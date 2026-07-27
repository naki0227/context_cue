use std::{
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

use async_trait::async_trait;
use futures_util::StreamExt;
use reqwest::Client;
use sha1::{Digest, Sha1};
use tokio::{fs, io::AsyncWriteExt};
use tokio_util::sync::CancellationToken;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

use crate::{
    domain::stt::{SttError, SttModelProgress},
    repository::stt_repository::{SttProgressReporter, SttRepository},
};

const MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin";
const MODEL_SHA1: &str = "a3733eda680ef76256db5fc5dd9de8629e62c5e7";
const MINIMUM_MODEL_BYTES: u64 = 40_000_000;

pub struct WhisperEngine {
    client: Client,
    context: Arc<Mutex<Option<Arc<WhisperContext>>>>,
    model_path: PathBuf,
}

impl WhisperEngine {
    pub fn new(model_path: PathBuf) -> Self {
        Self {
            client: Client::new(),
            context: Arc::new(Mutex::new(None)),
            model_path,
        }
    }

    fn transcribe_blocking(
        context_cache: &Mutex<Option<Arc<WhisperContext>>>,
        model_path: &Path,
        samples: &[f32],
    ) -> Result<String, SttError> {
        if !model_path.exists() {
            return Err(SttError::ModelNotInstalled);
        }
        let context = {
            let mut cached = context_cache.lock().map_err(|_| SttError::Transcription)?;
            if let Some(context) = cached.as_ref() {
                Arc::clone(context)
            } else {
                let context = Arc::new(
                    WhisperContext::new_with_params(
                        model_path,
                        WhisperContextParameters::default(),
                    )
                    .map_err(|_| SttError::InvalidModel)?,
                );
                *cached = Some(Arc::clone(&context));
                context
            }
        };
        let mut state = context
            .create_state()
            .map_err(|_| SttError::Transcription)?;
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        params.set_language(Some("ja"));
        params.set_translate(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_special(false);
        params.set_print_timestamps(false);
        params.set_no_context(true);
        state
            .full(params, samples)
            .map_err(|_| SttError::Transcription)?;

        let text = state
            .as_iter()
            .map(|segment| segment.to_string())
            .collect::<Vec<_>>()
            .join("")
            .trim()
            .to_owned();
        Ok(text)
    }
}

#[async_trait]
impl SttRepository for WhisperEngine {
    fn model_installed(&self) -> bool {
        self.model_path
            .metadata()
            .is_ok_and(|metadata| metadata.len() >= MINIMUM_MODEL_BYTES)
    }

    async fn download_model(
        &self,
        cancellation: CancellationToken,
        reporter: SttProgressReporter,
    ) -> Result<(), SttError> {
        let parent = self.model_path.parent().ok_or(SttError::Persistence)?;
        fs::create_dir_all(parent)
            .await
            .map_err(|_| SttError::Persistence)?;
        let temporary = parent.join(".whisper-model.download");
        let response = self
            .client
            .get(MODEL_URL)
            .send()
            .await
            .map_err(|_| SttError::Transport)?;
        if !response.status().is_success() {
            return Err(SttError::Transport);
        }
        let total = response.content_length().unwrap_or_default();
        let mut stream = response.bytes_stream();
        let mut file = fs::File::create(&temporary)
            .await
            .map_err(|_| SttError::Persistence)?;
        let mut hasher = Sha1::new();
        let mut completed = 0_u64;

        loop {
            let chunk = tokio::select! {
                _ = cancellation.cancelled() => {
                    let _ = fs::remove_file(&temporary).await;
                    return Err(SttError::Cancelled);
                }
                chunk = stream.next() => chunk,
            };
            let Some(chunk) = chunk else {
                break;
            };
            let chunk = chunk.map_err(|_| SttError::Transport)?;
            file.write_all(&chunk)
                .await
                .map_err(|_| SttError::Persistence)?;
            hasher.update(&chunk);
            completed = completed.saturating_add(chunk.len() as u64);
            reporter(progress(completed, total, false));
        }

        file.sync_all().await.map_err(|_| SttError::Persistence)?;
        drop(file);
        let digest = hasher
            .finalize()
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect::<String>();
        if completed < MINIMUM_MODEL_BYTES || digest != MODEL_SHA1 {
            let _ = fs::remove_file(&temporary).await;
            return Err(SttError::InvalidModel);
        }
        set_private_permissions(&temporary).await?;
        fs::rename(&temporary, &self.model_path)
            .await
            .map_err(|_| SttError::Persistence)?;
        *self.context.lock().map_err(|_| SttError::Persistence)? = None;
        reporter(progress(completed, completed, true));
        Ok(())
    }

    async fn transcribe(&self, samples_16khz: Vec<f32>) -> Result<String, SttError> {
        let model_path = self.model_path.clone();
        let context = Arc::clone(&self.context);
        tokio::task::spawn_blocking(move || {
            Self::transcribe_blocking(&context, &model_path, &samples_16khz)
        })
        .await
        .map_err(|_| SttError::Transcription)?
    }
}

fn progress(completed: u64, total: u64, done: bool) -> SttModelProgress {
    let percent = completed
        .saturating_mul(100)
        .checked_div(total)
        .map(|value| value.min(100) as u8)
        .unwrap_or_else(|| u8::from(done) * 100);
    SttModelProgress {
        completed_bytes: completed,
        total_bytes: total,
        percent,
        done,
    }
}

#[cfg(unix)]
async fn set_private_permissions(path: &Path) -> Result<(), SttError> {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(path, std::fs::Permissions::from_mode(0o600))
        .await
        .map_err(|_| SttError::Persistence)
}

#[cfg(not(unix))]
async fn set_private_permissions(_path: &Path) -> Result<(), SttError> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{error::Error, path::PathBuf};

    use super::{WhisperEngine, progress};

    #[test]
    fn download_progress_is_bounded() {
        assert_eq!(progress(50, 200, false).percent, 25);
        assert_eq!(progress(300, 200, false).percent, 100);
    }

    #[test]
    #[ignore = "公式モデルを指定した実機スモークテストとして手動実行する"]
    fn official_model_loads_and_runs_inference() -> Result<(), Box<dyn Error>> {
        let model_path = std::env::var("CONTEXT_CUE_STT_SMOKE_MODEL")
            .map(PathBuf::from)
            .map_err(|_| "CONTEXT_CUE_STT_SMOKE_MODEL is required")?;
        let transcript =
            WhisperEngine::transcribe_blocking(&Default::default(), &model_path, &[0.0; 16_000])?;
        assert!(transcript.chars().count() < 100);
        Ok(())
    }
}
