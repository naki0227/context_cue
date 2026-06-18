use std::{
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
};

use context_cue_contracts::{
    AdaptiveInferenceState, AppState, ConnectionState, ConsentInput, ContextCue, RollingSummary,
    SessionState, TranscriptChunk,
};
use context_cue_core::{
    cues::shorten_list,
    detection::{classify_intent, question_score},
    profile_search::{ProfileDocument, score_document},
};
use tauri::{AppHandle, Emitter};
use tokio::time::{Duration, sleep};
use uuid::Uuid;

#[derive(Clone)]
pub struct SharedState {
    inner: Arc<Mutex<InnerState>>,
}

impl Default for SharedState {
    fn default() -> Self {
        Self {
            inner: Arc::new(Mutex::new(InnerState::default())),
        }
    }
}

impl SharedState {
    pub fn snapshot(&self) -> AppState {
        self.inner.lock().expect("shared state poisoned").snapshot()
    }

    pub fn start(&self, consent: ConsentInput) -> Result<(), &'static str> {
        if !(consent.participant_consent && consent.no_covert_use && consent.share_safe_understood)
        {
            return Err("consent requirements are incomplete");
        }

        let mut state = self.inner.lock().expect("shared state poisoned");
        state.app_state.session.status = "running".to_owned();
        Ok(())
    }

    pub fn stop(&self) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        state.app_state.session.status = "stopped".to_owned();
        state.app_state.adaptive_inference.mode = "light".to_owned();
        state.app_state.adaptive_inference.question_score = 0.0;
    }

    pub fn toggle_share_safe_mode(&self) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        state.app_state.session.share_safe_mode = !state.app_state.session.share_safe_mode;
        state.snapshot()
    }

    pub fn push_mock_chunk(
        &self,
        text: &str,
    ) -> (
        TranscriptChunk,
        RollingSummary,
        ContextCue,
        AdaptiveInferenceState,
    ) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let question = question_score(text);
        let intent = classify_intent(text).to_owned();

        let chunk = TranscriptChunk {
            id: Uuid::new_v4().to_string(),
            source: "mock-stt".to_owned(),
            text: text.to_owned(),
        };

        state.app_state.transcript.push(chunk.clone());
        state.app_state.transcript = state
            .app_state
            .transcript
            .iter()
            .rev()
            .take(10)
            .cloned()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect();

        state.app_state.rolling_summary = RollingSummary {
            current_topic: if text.contains("面接") {
                "面接準備と過去の決定事項の確認".to_owned()
            } else {
                "会話中の論点整理".to_owned()
            },
            important_points: vec![
                "Adaptive Inference Mode enabled".to_owned(),
                "Question-triggered deep mode".to_owned(),
            ],
            open_questions: if question >= 0.36 {
                vec![text.to_owned()]
            } else {
                vec![]
            },
        };

        state.app_state.adaptive_inference = AdaptiveInferenceState {
            mode: if question >= 0.36 {
                "deep".to_owned()
            } else {
                "light".to_owned()
            },
            question_score: question,
        };

        let related = state.rank_notes(text);

        state.app_state.context_cue = ContextCue {
            topic: state.app_state.rolling_summary.current_topic.clone(),
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
            state.app_state.rolling_summary.clone(),
            state.app_state.context_cue.clone(),
            state.app_state.adaptive_inference.clone(),
        )
    }

    pub fn bootstrap_profiles(&self) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        state.documents = load_profile_documents();
    }

    pub fn current_status(&self) -> String {
        self.inner
            .lock()
            .expect("shared state poisoned")
            .app_state
            .session
            .status
            .clone()
    }
}

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
                if state.current_status() != "running" {
                    break;
                }

                sleep(Duration::from_secs(2)).await;
                let (chunk, summary, cue, adaptive) = state.push_mock_chunk(sample);
                let _ = app.emit("transcript-updated", chunk);
                let _ = app.emit("rolling-summary-updated", summary);
                let _ = app.emit("context-cue-updated", cue);
                let _ = app.emit("question-score-updated", adaptive);
            }
        });
    }
}

struct InnerState {
    app_state: AppState,
    documents: Vec<OwnedProfileDocument>,
}

impl Default for InnerState {
    fn default() -> Self {
        Self {
            app_state: default_app_state(),
            documents: Vec::new(),
        }
    }
}

impl InnerState {
    fn snapshot(&self) -> AppState {
        self.app_state.clone()
    }

    fn rank_notes(&self, query: &str) -> Vec<String> {
        let mut ranked = self
            .documents
            .iter()
            .map(|document| {
                let borrowed = ProfileDocument {
                    title: &document.title,
                    content: &document.content,
                };
                (score_document(query, &borrowed), document.title.clone())
            })
            .collect::<Vec<_>>();

        ranked.sort_by(|left, right| right.0.cmp(&left.0));
        ranked
            .into_iter()
            .filter(|(score, _)| *score > 0)
            .take(3)
            .map(|(_, title)| title)
            .collect()
    }
}

#[derive(Clone)]
struct OwnedProfileDocument {
    title: String,
    content: String,
}

fn default_app_state() -> AppState {
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
            current_topic: "Waiting for a session".to_owned(),
            important_points: vec![],
            open_questions: vec![],
        },
        context_cue: ContextCue {
            topic: "No active conversation".to_owned(),
            intent: "Start a session to preview cues".to_owned(),
            related_notes: vec![],
            suggested_points: vec![],
            questions_to_ask: vec![],
            caution: "Consent is required before transcription starts.".to_owned(),
        },
        transcript: vec![],
    }
}

fn load_profile_documents() -> Vec<OwnedProfileDocument> {
    let base = profile_seed_dir();
    let mut documents = Vec::new();

    if let Ok(entries) = fs::read_dir(base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let Some(stem) = path.file_stem().and_then(|value| value.to_str()) else {
                continue;
            };
            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };
            documents.push(OwnedProfileDocument {
                title: stem.to_owned(),
                content,
            });
        }
    }

    documents
}

fn profile_seed_dir() -> PathBuf {
    let mut path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    path.push("profiles");
    path.push("sample");
    path
}

#[cfg(test)]
mod tests {
    use super::SharedState;
    use context_cue_contracts::ConsentInput;

    #[test]
    fn start_requires_all_consent_checkboxes() {
        let state = SharedState::default();
        let result = state.start(ConsentInput {
            participant_consent: true,
            no_covert_use: false,
            share_safe_understood: true,
        });

        assert!(result.is_err());
    }

    #[test]
    fn question_chunk_enters_deep_mode() {
        let state = SharedState::default();
        let (_, _, _, adaptive) = state.push_mock_chunk("この変更は今回のリリース対象ですか？");
        assert_eq!(adaptive.mode, "deep");
        assert!(adaptive.question_score >= 0.36);
    }
}
