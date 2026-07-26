use std::sync::Arc;

use async_trait::async_trait;
use tokio_util::sync::CancellationToken;

use crate::domain::stt::{SttError, SttModelProgress};

pub type SttProgressReporter = Arc<dyn Fn(SttModelProgress) + Send + Sync>;

#[async_trait]
pub trait SttRepository: Send + Sync {
    fn model_installed(&self) -> bool;

    async fn download_model(
        &self,
        cancellation: CancellationToken,
        reporter: SttProgressReporter,
    ) -> Result<(), SttError>;

    async fn transcribe(&self, samples_16khz: Vec<f32>) -> Result<String, SttError>;
}
