use std::sync::Arc;

use async_trait::async_trait;
use context_cue_contracts::ContextCue;
use tokio_util::sync::CancellationToken;

use crate::domain::llm::{CueGenerationRequest, LlmError, OllamaStatus, PullProgress};

pub type ProgressReporter = Arc<dyn Fn(PullProgress) + Send + Sync>;

#[async_trait]
pub trait LlmRepository: Send + Sync {
    async fn check_status(&self) -> Result<OllamaStatus, LlmError>;

    async fn generate(
        &self,
        request: &CueGenerationRequest,
        strict_retry: bool,
    ) -> Result<ContextCue, LlmError>;

    async fn pull_model(
        &self,
        model: &str,
        cancellation: CancellationToken,
        report_progress: ProgressReporter,
    ) -> Result<(), LlmError>;
}
