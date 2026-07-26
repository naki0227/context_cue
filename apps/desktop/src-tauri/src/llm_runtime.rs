use std::sync::{Arc, Mutex};

use context_cue_contracts::ContextCue;
use tokio_util::sync::CancellationToken;

use crate::{
    domain::llm::{CueGenerationOutcome, CueGenerationRequest, LlmError, OllamaStatus},
    infrastructure::ollama_client::OllamaClient,
    repository::llm_repository::{LlmRepository, ProgressReporter},
    usecase::llm_usecase::{check_ollama_status, generate_context_cue, pull_recommended_model},
};

pub struct LlmRuntime {
    repository: Arc<dyn LlmRepository>,
    pull_cancellation: Mutex<Option<CancellationToken>>,
}

impl Default for LlmRuntime {
    fn default() -> Self {
        Self::new(Arc::new(OllamaClient::default()))
    }
}

impl LlmRuntime {
    pub fn new(repository: Arc<dyn LlmRepository>) -> Self {
        Self {
            repository,
            pull_cancellation: Mutex::new(None),
        }
    }

    pub async fn check_status(&self) -> Result<OllamaStatus, LlmError> {
        check_ollama_status(self.repository.as_ref()).await
    }

    pub async fn generate(
        &self,
        request: CueGenerationRequest,
        previous_cue: ContextCue,
    ) -> CueGenerationOutcome {
        generate_context_cue(self.repository.as_ref(), request, previous_cue).await
    }

    pub async fn pull_model(&self, reporter: ProgressReporter) -> Result<(), LlmError> {
        let cancellation = CancellationToken::new();
        {
            let mut active = self
                .pull_cancellation
                .lock()
                .map_err(|_| LlmError::Transport)?;
            if let Some(previous) = active.replace(cancellation.clone()) {
                previous.cancel();
            }
        }

        let result = pull_recommended_model(self.repository.as_ref(), cancellation, reporter).await;
        if let Ok(mut active) = self.pull_cancellation.lock() {
            *active = None;
        }
        result
    }

    pub fn cancel_pull(&self) -> Result<(), LlmError> {
        let active = self
            .pull_cancellation
            .lock()
            .map_err(|_| LlmError::Transport)?;
        if let Some(cancellation) = active.as_ref() {
            cancellation.cancel();
        }
        Ok(())
    }
}
