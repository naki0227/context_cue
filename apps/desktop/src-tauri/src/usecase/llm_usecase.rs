use context_cue_contracts::ContextCue;
use tokio_util::sync::CancellationToken;

use crate::{
    domain::llm::{
        CueGenerationOutcome, CueGenerationRequest, LlmError, OllamaStatus, RECOMMENDED_MODEL,
    },
    repository::llm_repository::{LlmRepository, ProgressReporter},
};

const MAX_TRANSCRIPT_CHARS: usize = 4_000;
const MAX_NOTE_CHARS: usize = 2_000;
const MAX_NOTES: usize = 8;
const MAX_FIELD_CHARS: usize = 240;
const MAX_LIST_ITEMS: usize = 5;

pub async fn check_ollama_status(repository: &dyn LlmRepository) -> Result<OllamaStatus, LlmError> {
    repository.check_status().await
}

pub async fn pull_recommended_model(
    repository: &dyn LlmRepository,
    cancellation: CancellationToken,
    report_progress: ProgressReporter,
) -> Result<(), LlmError> {
    repository
        .pull_model(RECOMMENDED_MODEL, cancellation, report_progress)
        .await
}

pub async fn generate_context_cue(
    repository: &dyn LlmRepository,
    request: CueGenerationRequest,
    previous_cue: ContextCue,
) -> CueGenerationOutcome {
    let request = sanitize_request(request);

    for strict_retry in [false, true] {
        match repository.generate(&request, strict_retry).await {
            Ok(cue) => match sanitize_cue(cue) {
                Ok(cue) => {
                    return CueGenerationOutcome {
                        cue,
                        used_fallback: false,
                        warning: None,
                    };
                }
                Err(LlmError::InvalidResponse) => continue,
                Err(_) => break,
            },
            Err(LlmError::InvalidResponse) => continue,
            Err(error) => {
                return fallback(previous_cue, error);
            }
        }
    }

    fallback(previous_cue, LlmError::InvalidResponse)
}

fn fallback(previous_cue: ContextCue, error: LlmError) -> CueGenerationOutcome {
    CueGenerationOutcome {
        cue: previous_cue,
        used_fallback: true,
        warning: Some(
            match error {
                LlmError::ModelNotInstalled => "推奨モデルが未取得のため、前回の表示を維持します。",
                LlmError::Timeout => "ローカルAIが時間内に応答しないため、前回の表示を維持します。",
                LlmError::Cancelled => "ローカルAI処理を中止しました。",
                _ => "ローカルAIを利用できないため、前回の表示を維持します。",
            }
            .to_owned(),
        ),
    }
}

fn sanitize_request(mut request: CueGenerationRequest) -> CueGenerationRequest {
    request.transcript_recent = truncate(&request.transcript_recent, MAX_TRANSCRIPT_CHARS);
    request.detected_intent_hint = truncate(&request.detected_intent_hint, 80);
    request.mode = truncate(&request.mode, 40);
    request.question_likelihood = request.question_likelihood.clamp(0.0, 1.0);
    request.retrieved_notes.truncate(MAX_NOTES);
    for note in &mut request.retrieved_notes {
        note.title = truncate(&note.title, 120);
        note.content = truncate(&note.content, MAX_NOTE_CHARS);
    }
    request
}

fn sanitize_cue(mut cue: ContextCue) -> Result<ContextCue, LlmError> {
    cue.topic = required_field(cue.topic)?;
    cue.intent = required_field(cue.intent)?;
    cue.caution = truncate(cue.caution.trim(), MAX_FIELD_CHARS);
    cue.related_notes = sanitize_list(cue.related_notes);
    cue.suggested_points = sanitize_list(cue.suggested_points);
    cue.questions_to_ask = sanitize_list(cue.questions_to_ask);
    Ok(cue)
}

fn required_field(value: String) -> Result<String, LlmError> {
    let value = truncate(value.trim(), MAX_FIELD_CHARS);
    if value.is_empty() {
        Err(LlmError::InvalidResponse)
    } else {
        Ok(value)
    }
}

fn sanitize_list(values: Vec<String>) -> Vec<String> {
    values
        .into_iter()
        .map(|value| truncate(value.trim(), MAX_FIELD_CHARS))
        .filter(|value| !value.is_empty())
        .take(MAX_LIST_ITEMS)
        .collect()
}

fn truncate(value: &str, max_chars: usize) -> String {
    value.chars().take(max_chars).collect()
}

#[cfg(test)]
mod tests {
    use super::generate_context_cue;
    use crate::{
        domain::llm::{CueGenerationRequest, LlmError, OllamaStatus, RetrievedNote},
        repository::llm_repository::{LlmRepository, ProgressReporter},
    };
    use async_trait::async_trait;
    use context_cue_contracts::{ContextCue, RollingSummary};
    use std::sync::Mutex;
    use tokio_util::sync::CancellationToken;

    struct StubRepository {
        responses: Mutex<Vec<Result<ContextCue, LlmError>>>,
    }

    #[async_trait]
    impl LlmRepository for StubRepository {
        async fn check_status(&self) -> Result<OllamaStatus, LlmError> {
            Ok(OllamaStatus::unavailable())
        }

        async fn generate(
            &self,
            _request: &CueGenerationRequest,
            _strict_retry: bool,
        ) -> Result<ContextCue, LlmError> {
            self.responses
                .lock()
                .map_err(|_| LlmError::Transport)?
                .remove(0)
        }

        async fn pull_model(
            &self,
            _model: &str,
            _cancellation: CancellationToken,
            _report_progress: ProgressReporter,
        ) -> Result<(), LlmError> {
            Ok(())
        }
    }

    fn cue(topic: &str) -> ContextCue {
        ContextCue {
            topic: topic.to_owned(),
            intent: "確認".to_owned(),
            related_notes: Vec::new(),
            suggested_points: Vec::new(),
            questions_to_ask: Vec::new(),
            caution: String::new(),
        }
    }

    fn request() -> CueGenerationRequest {
        CueGenerationRequest {
            transcript_recent: "次の方針を確認できますか？".to_owned(),
            rolling_summary: RollingSummary {
                current_topic: "方針確認".to_owned(),
                important_points: Vec::new(),
                open_questions: Vec::new(),
            },
            question_likelihood: 0.8,
            detected_intent_hint: "question".to_owned(),
            retrieved_notes: vec![RetrievedNote {
                title: "前回".to_owned(),
                content: "担当を決める".to_owned(),
            }],
            mode: "meeting".to_owned(),
        }
    }

    #[tokio::test]
    async fn invalid_json_is_retried_once() {
        let repository = StubRepository {
            responses: Mutex::new(vec![Err(LlmError::InvalidResponse), Ok(cue("有効な結果"))]),
        };

        let outcome = generate_context_cue(&repository, request(), cue("前回")).await;

        assert!(!outcome.used_fallback);
        assert_eq!(outcome.cue.topic, "有効な結果");
    }

    #[tokio::test]
    async fn transport_error_keeps_previous_cue() {
        let repository = StubRepository {
            responses: Mutex::new(vec![Err(LlmError::Transport)]),
        };

        let outcome = generate_context_cue(&repository, request(), cue("前回")).await;

        assert!(outcome.used_fallback);
        assert_eq!(outcome.cue.topic, "前回");
        assert!(outcome.warning.is_some());
    }
}
