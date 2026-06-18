use context_cue_contracts::{
    AdaptiveInferenceState, AppState, ConnectionState, ConsentInput, ContextCue, RollingSummary,
    SessionState, TranscriptChunk,
};
use context_cue_core::{
    cues::shorten_list,
    detection::{classify_intent, question_score},
};
use uuid::Uuid;

use crate::{domain::profile_document::OwnedProfileDocument, error::AppError, repository::profile_repository::rank_notes};

pub fn default_app_state() -> AppState {
    AppState {
        session: SessionState {
            status: "idle".to_owned(),
            share_safe_mode: false,
        },
        connections: ConnectionState {
            ollama_ready: true,
            stt_ready: true,
        },
        adaptive_inference: AdaptiveInferenceState {
            mode: "light".to_owned(),
            question_score: 0.0,
        },
        rolling_summary: RollingSummary {
            current_topic: "セッション開始を待っています".to_owned(),
            important_points: vec![],
            open_questions: vec![],
        },
        context_cue: ContextCue {
            topic: "まだ会話は始まっていません".to_owned(),
            intent: "セッションを開始すると提示内容を表示します".to_owned(),
            related_notes: vec![],
            suggested_points: vec![],
            questions_to_ask: vec![],
            caution: "文字起こしを始める前に参加者の同意が必要です。".to_owned(),
        },
        transcript: vec![],
        imported_documents: vec![],
    }
}

pub fn start_session(app_state: &mut AppState, consent: ConsentInput) -> Result<(), AppError> {
    if !(consent.participant_consent && consent.no_covert_use && consent.share_safe_understood) {
        return Err(AppError::ConsentIncomplete);
    }

    app_state.session.status = "running".to_owned();
    Ok(())
}

pub fn stop_session(app_state: &mut AppState) {
    app_state.session.status = "stopped".to_owned();
    app_state.adaptive_inference.mode = "light".to_owned();
    app_state.adaptive_inference.question_score = 0.0;
}

pub fn toggle_share_safe_mode(app_state: &mut AppState) {
    app_state.session.share_safe_mode = !app_state.session.share_safe_mode;
}

pub fn push_mock_chunk(
    app_state: &mut AppState,
    documents: &[OwnedProfileDocument],
    text: &str,
) -> (
    TranscriptChunk,
    RollingSummary,
    ContextCue,
    AdaptiveInferenceState,
) {
    let question = question_score(text);
    let intent = classify_intent(text).to_owned();

    let chunk = TranscriptChunk {
        id: Uuid::new_v4().to_string(),
        source: "モック音声".to_owned(),
        text: text.to_owned(),
    };

    app_state.transcript.push(chunk.clone());
    app_state.transcript = app_state
        .transcript
        .iter()
        .rev()
        .take(10)
        .cloned()
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .collect();

    app_state.rolling_summary = RollingSummary {
        current_topic: if text.contains("面接") {
            "面接準備と過去の決定事項の確認".to_owned()
        } else {
            "会話中の論点整理".to_owned()
        },
        important_points: vec![
            "適応的推論モードが有効".to_owned(),
            "質問を検出したときだけ深い推論を実行".to_owned(),
        ],
        open_questions: if question >= 0.36 {
            vec![text.to_owned()]
        } else {
            vec![]
        },
    };

    app_state.adaptive_inference = AdaptiveInferenceState {
        mode: if question >= 0.36 {
            "deep".to_owned()
        } else {
            "light".to_owned()
        },
        question_score: question,
    };

    let related = rank_notes(documents, text);

    app_state.context_cue = ContextCue {
        topic: app_state.rolling_summary.current_topic.clone(),
        intent,
        related_notes: shorten_list(&related, 3),
        suggested_points: shorten_list(
            &vec![
                "前回の決定事項を短く確認する".to_owned(),
                "担当と期限を明確にする".to_owned(),
                "質問時だけ deep mode を使う".to_owned(),
            ],
            5,
        ),
        questions_to_ask: if question >= 0.36 {
            vec!["今回の変更は面接本番までに必要ですか？".to_owned()]
        } else {
            vec![]
        },
        caution: if question >= 0.36 {
            "質問トリガー時のみ重い推論を実行".to_owned()
        } else {
            "前回の有効 cue を維持".to_owned()
        },
    };

    (
        chunk,
        app_state.rolling_summary.clone(),
        app_state.context_cue.clone(),
        app_state.adaptive_inference.clone(),
    )
}
