use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentInput {
    pub participant_consent: bool,
    pub no_covert_use: bool,
    pub share_safe_understood: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptChunk {
    pub id: String,
    pub source: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RollingSummary {
    pub current_topic: String,
    pub important_points: Vec<String>,
    pub open_questions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextCue {
    pub topic: String,
    pub intent: String,
    pub related_notes: Vec<String>,
    pub suggested_points: Vec<String>,
    pub questions_to_ask: Vec<String>,
    pub caution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionState {
    pub status: String,
    pub share_safe_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionState {
    pub ollama_ready: bool,
    pub stt_ready: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdaptiveInferenceState {
    pub mode: String,
    pub question_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    pub session: SessionState,
    pub connections: ConnectionState,
    pub adaptive_inference: AdaptiveInferenceState,
    pub rolling_summary: RollingSummary,
    pub context_cue: ContextCue,
    pub transcript: Vec<TranscriptChunk>,
}
