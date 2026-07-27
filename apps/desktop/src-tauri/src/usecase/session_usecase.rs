use context_cue_contracts::{
    AdaptiveInferenceState, AppState, ConnectionState, ConsentInput, ContextCue, RollingSummary,
    SessionState, TranscriptChunk,
};
use context_cue_core::{
    cues::shorten_list,
    detection::{classify_intent, question_score},
};
use uuid::Uuid;

use crate::{
    domain::{
        llm::{CueGenerationRequest, RetrievedNote},
        profile_document::OwnedProfileDocument,
    },
    error::AppError,
    repository::profile_repository::rank_notes,
};

pub fn default_app_state() -> AppState {
    AppState {
        session: SessionState {
            status: "idle".to_owned(),
            share_safe_mode: false,
            session_id: None,
            consent_confirmed_at_unix_ms: None,
        },
        connections: ConnectionState {
            ollama_ready: false,
            stt_ready: false,
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

pub fn start_session(
    app_state: &mut AppState,
    consent: ConsentInput,
    session_id: String,
    confirmed_at_unix_ms: u64,
) -> Result<(), AppError> {
    if !(consent.participant_consent && consent.no_covert_use && consent.share_safe_understood) {
        return Err(AppError::ConsentIncomplete);
    }

    app_state.session.status = "running".to_owned();
    app_state.session.session_id = Some(session_id);
    app_state.session.consent_confirmed_at_unix_ms = Some(confirmed_at_unix_ms);
    Ok(())
}

pub fn stop_session(app_state: &mut AppState) {
    app_state.session.status = "stopped".to_owned();
    app_state.session.share_safe_mode = false;
    app_state.adaptive_inference.mode = "light".to_owned();
    app_state.adaptive_inference.question_score = 0.0;
    app_state.transcript.clear();
    app_state.rolling_summary = default_app_state().rolling_summary;
    app_state.context_cue = default_app_state().context_cue;
}

pub fn toggle_share_safe_mode(app_state: &mut AppState) {
    app_state.session.share_safe_mode = !app_state.session.share_safe_mode;
}

pub fn push_transcript_chunk(
    app_state: &mut AppState,
    documents: &[OwnedProfileDocument],
    text: &str,
    source: &str,
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
        source: source.to_owned(),
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
            &[
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

pub fn build_cue_generation_request(
    text: &str,
    summary: RollingSummary,
    cue: &ContextCue,
    adaptive: &AdaptiveInferenceState,
) -> Option<CueGenerationRequest> {
    if adaptive.mode != "deep" {
        return None;
    }

    Some(CueGenerationRequest {
        transcript_recent: text.to_owned(),
        rolling_summary: summary,
        question_likelihood: adaptive.question_score,
        detected_intent_hint: cue.intent.clone(),
        retrieved_notes: cue
            .related_notes
            .iter()
            .map(|note| RetrievedNote {
                title: "参照ナレッジ".to_owned(),
                content: note.clone(),
            })
            .collect(),
        mode: "conversation".to_owned(),
    })
}

#[cfg(test)]
mod tests {
    use super::{
        build_cue_generation_request, default_app_state, push_transcript_chunk, start_session,
        stop_session,
    };
    use context_cue_contracts::ConsentInput;

    fn complete_consent() -> ConsentInput {
        ConsentInput {
            participant_consent: true,
            no_covert_use: true,
            share_safe_understood: true,
        }
    }

    #[test]
    fn session_start_records_only_session_metadata() {
        let mut state = default_app_state();

        let result = start_session(
            &mut state,
            complete_consent(),
            "session-1".to_owned(),
            1_234,
        );

        assert!(result.is_ok());
        assert_eq!(state.session.status, "running");
        assert_eq!(state.session.session_id.as_deref(), Some("session-1"));
        assert_eq!(state.session.consent_confirmed_at_unix_ms, Some(1_234));
    }

    #[test]
    fn session_stop_disables_share_safe_mode() {
        let mut state = default_app_state();
        state.session.status = "running".to_owned();
        state.session.share_safe_mode = true;
        state
            .transcript
            .push(context_cue_contracts::TranscriptChunk {
                id: "chunk-1".to_owned(),
                source: "マイク".to_owned(),
                text: "保存しない会話".to_owned(),
            });

        stop_session(&mut state);

        assert_eq!(state.session.status, "stopped");
        assert!(!state.session.share_safe_mode);
        assert!(state.transcript.is_empty());
        assert_eq!(
            state.rolling_summary.current_topic,
            "セッション開始を待っています"
        );
    }

    #[test]
    fn only_questions_build_a_deep_generation_request() {
        let mut state = default_app_state();
        let question = "この変更は今回のリリース対象ですか？";
        let (_, summary, cue, adaptive) =
            push_transcript_chunk(&mut state, &[], question, "マイク");

        let request = build_cue_generation_request(question, summary, &cue, &adaptive);

        assert!(request.is_some());

        let (_, summary, cue, adaptive) =
            push_transcript_chunk(&mut state, &[], "方針を共有します", "マイク");
        assert!(
            build_cue_generation_request("方針を共有します", summary, &cue, &adaptive).is_none()
        );
    }
}
