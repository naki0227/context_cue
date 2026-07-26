use std::fmt;

use context_cue_contracts::{ContextCue, RollingSummary};
use serde::{Deserialize, Serialize};

pub const RECOMMENDED_MODEL: &str = "gemma4:e2b";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LlmModel {
    pub name: String,
    pub size_bytes: u64,
    pub parameter_size: String,
    pub quantization_level: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OllamaStatus {
    pub running: bool,
    pub models: Vec<LlmModel>,
    pub recommended_model: String,
    pub recommended_model_installed: bool,
    pub message: String,
}

impl OllamaStatus {
    pub fn unavailable() -> Self {
        Self {
            running: false,
            models: Vec::new(),
            recommended_model: RECOMMENDED_MODEL.to_owned(),
            recommended_model_installed: false,
            message: "Ollamaを起動してください。".to_owned(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PullProgress {
    pub status: String,
    pub completed_bytes: u64,
    pub total_bytes: u64,
    pub percent: u8,
    pub done: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RetrievedNote {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CueGenerationRequest {
    pub transcript_recent: String,
    pub rolling_summary: RollingSummary,
    pub question_likelihood: f32,
    pub detected_intent_hint: String,
    pub retrieved_notes: Vec<RetrievedNote>,
    pub mode: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CueGenerationOutcome {
    pub cue: ContextCue,
    pub used_fallback: bool,
    pub warning: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LlmError {
    Cancelled,
    HttpStatus(u16),
    InvalidModelName,
    InvalidResponse,
    ModelNotInstalled,
    Timeout,
    Transport,
}

impl fmt::Display for LlmError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Cancelled => write!(formatter, "operation was cancelled"),
            Self::HttpStatus(status) => write!(formatter, "Ollama returned HTTP {status}"),
            Self::InvalidModelName => write!(formatter, "model name is invalid"),
            Self::InvalidResponse => write!(formatter, "Ollama response is invalid"),
            Self::ModelNotInstalled => write!(formatter, "recommended model is not installed"),
            Self::Timeout => write!(formatter, "Ollama request timed out"),
            Self::Transport => write!(formatter, "Ollama is unavailable"),
        }
    }
}

impl std::error::Error for LlmError {}
