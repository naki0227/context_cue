use std::fmt;

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SttStatus {
    pub model_id: String,
    pub model_name: String,
    pub model_installed: bool,
    pub model_size_bytes: u64,
    pub model_download_bytes: u64,
    pub system_memory_bytes: u64,
    pub selection_reason: String,
    pub devices: Vec<AudioDevice>,
    pub selected_device_id: Option<String>,
    pub recording: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SttModelProgress {
    pub completed_bytes: u64,
    pub total_bytes: u64,
    pub percent: u8,
    pub done: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SttError {
    AudioDeviceUnavailable,
    AudioPermissionDenied,
    Cancelled,
    InvalidModel,
    ModelNotInstalled,
    Persistence,
    Transcription,
    Transport,
}

impl fmt::Display for SttError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::AudioDeviceUnavailable => write!(formatter, "audio input device is unavailable"),
            Self::AudioPermissionDenied => write!(formatter, "microphone permission was denied"),
            Self::Cancelled => write!(formatter, "operation was cancelled"),
            Self::InvalidModel => write!(formatter, "downloaded STT model is invalid"),
            Self::ModelNotInstalled => write!(formatter, "STT model is not installed"),
            Self::Persistence => write!(formatter, "STT model could not be saved"),
            Self::Transcription => write!(formatter, "speech could not be transcribed"),
            Self::Transport => write!(formatter, "STT model download failed"),
        }
    }
}

impl std::error::Error for SttError {}
