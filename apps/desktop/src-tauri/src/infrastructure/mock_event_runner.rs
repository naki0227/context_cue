use tauri::{AppHandle, Emitter, Manager};
use tokio::time::{Duration, sleep};

use crate::{
    app::SharedState,
    domain::llm::{CueGenerationRequest, RetrievedNote},
    llm_runtime::LlmRuntime,
};

pub struct MockEventRunner;

impl MockEventRunner {
    pub fn spawn(app: AppHandle, state: SharedState) {
        tauri::async_runtime::spawn(async move {
            let samples = [
                "前回の仕様確認から始めましょう",
                "この変更は今回のリリース対象ですか？",
                "担当者の確認も必要です",
                "面接で過去プロジェクトの説明をどう整理しますか？",
            ];

            for sample in samples {
                if !matches!(state.current_status().as_deref(), Ok("running")) {
                    break;
                }

                sleep(Duration::from_secs(2)).await;
                let Ok((chunk, summary, cue, adaptive)) = state.push_mock_chunk(sample) else {
                    break;
                };
                let _ = app.emit("transcript-updated", chunk);
                let _ = app.emit("rolling-summary-updated", summary.clone());
                let _ = app.emit("question-score-updated", adaptive.clone());

                let final_cue = if adaptive.mode == "deep" {
                    let request = CueGenerationRequest {
                        transcript_recent: sample.to_owned(),
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
                    };
                    let outcome = app
                        .state::<LlmRuntime>()
                        .generate(request, cue.clone())
                        .await;
                    if let Some(warning) = outcome.warning {
                        let _ = app.emit("llm-warning", warning);
                    }
                    outcome.cue
                } else {
                    cue
                };

                let _ = state.set_context_cue(final_cue.clone());
                let _ = app.emit("context-cue-updated", final_cue);
            }
        });
    }
}
