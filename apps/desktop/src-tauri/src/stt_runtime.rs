use std::sync::{Arc, Mutex};

use cpal::Stream;
use tokio::sync::Semaphore;
use tokio_util::sync::CancellationToken;

use crate::{
    config::stt_model_file,
    domain::stt::{STT_MODEL_NAME, SttError, SttStatus},
    infrastructure::{
        audio_capture::{SegmentHandler, list_input_devices, start_input_stream},
        whisper_engine::WhisperEngine,
    },
    repository::stt_repository::{SttProgressReporter, SttRepository},
};

pub struct SttRuntime {
    repository: Arc<dyn SttRepository>,
    model_cancellation: Mutex<Option<CancellationToken>>,
    selected_device_id: Mutex<Option<String>>,
    stream: Mutex<Option<Stream>>,
    transcription_gate: Arc<Semaphore>,
}

impl Default for SttRuntime {
    fn default() -> Self {
        Self {
            repository: Arc::new(WhisperEngine::new(stt_model_file())),
            model_cancellation: Mutex::new(None),
            selected_device_id: Mutex::new(None),
            stream: Mutex::new(None),
            transcription_gate: Arc::new(Semaphore::new(1)),
        }
    }
}

impl SttRuntime {
    pub fn status(&self) -> Result<SttStatus, SttError> {
        let devices = list_input_devices().unwrap_or_default();
        let selected_device_id = self
            .selected_device_id
            .lock()
            .map_err(|_| SttError::AudioDeviceUnavailable)?
            .clone();
        let recording = self
            .stream
            .lock()
            .map_err(|_| SttError::AudioDeviceUnavailable)?
            .is_some();
        let model_installed = self.repository.model_installed();
        Ok(SttStatus {
            model_name: STT_MODEL_NAME.to_owned(),
            model_installed,
            model_size_bytes: stt_model_file()
                .metadata()
                .map(|metadata| metadata.len())
                .unwrap_or_default(),
            devices,
            selected_device_id,
            recording,
            message: if model_installed {
                "端末内で文字起こしできます。".to_owned()
            } else {
                "初回のみ音声認識モデルを取得してください。".to_owned()
            },
        })
    }

    pub async fn download_model(&self, reporter: SttProgressReporter) -> Result<(), SttError> {
        let cancellation = CancellationToken::new();
        {
            let mut active = self
                .model_cancellation
                .lock()
                .map_err(|_| SttError::Persistence)?;
            if let Some(previous) = active.replace(cancellation.clone()) {
                previous.cancel();
            }
        }
        let result = self.repository.download_model(cancellation, reporter).await;
        if let Ok(mut active) = self.model_cancellation.lock() {
            *active = None;
        }
        result
    }

    pub fn cancel_download(&self) -> Result<(), SttError> {
        let active = self
            .model_cancellation
            .lock()
            .map_err(|_| SttError::Persistence)?;
        if let Some(cancellation) = active.as_ref() {
            cancellation.cancel();
        }
        Ok(())
    }

    pub fn start_capture(
        &self,
        selected_device_id: Option<&str>,
        handler: SegmentHandler,
    ) -> Result<SttStatus, SttError> {
        if !self.repository.model_installed() {
            return Err(SttError::ModelNotInstalled);
        }
        self.stop_capture()?;
        let (stream, selected) = start_input_stream(selected_device_id, handler)?;
        *self
            .selected_device_id
            .lock()
            .map_err(|_| SttError::AudioDeviceUnavailable)? = Some(selected);
        *self
            .stream
            .lock()
            .map_err(|_| SttError::AudioDeviceUnavailable)? = Some(stream);
        self.status()
    }

    pub fn stop_capture(&self) -> Result<SttStatus, SttError> {
        *self
            .stream
            .lock()
            .map_err(|_| SttError::AudioDeviceUnavailable)? = None;
        self.status()
    }

    pub fn repository(&self) -> Arc<dyn SttRepository> {
        Arc::clone(&self.repository)
    }

    pub fn transcription_gate(&self) -> Arc<Semaphore> {
        Arc::clone(&self.transcription_gate)
    }
}
