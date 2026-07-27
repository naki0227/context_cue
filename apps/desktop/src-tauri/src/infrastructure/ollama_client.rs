use std::time::Duration;

use async_trait::async_trait;
use context_cue_contracts::ContextCue;
use futures_util::StreamExt;
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tokio_util::sync::CancellationToken;

use crate::{
    domain::llm::{
        CueGenerationRequest, LlmError, LlmModel, OllamaStatus, PullProgress, RECOMMENDED_MODEL,
    },
    repository::llm_repository::{LlmRepository, ProgressReporter},
};

const OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";

#[derive(Clone)]
pub struct OllamaClient {
    base_url: String,
    client: Client,
}

impl Default for OllamaClient {
    fn default() -> Self {
        let client = Client::builder()
            .connect_timeout(Duration::from_secs(2))
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap_or_default();
        Self {
            base_url: OLLAMA_BASE_URL.to_owned(),
            client,
        }
    }
}

#[async_trait]
impl LlmRepository for OllamaClient {
    async fn check_status(&self) -> Result<OllamaStatus, LlmError> {
        let response = match self
            .client
            .get(format!("{}/api/tags", self.base_url))
            .send()
            .await
        {
            Ok(response) => response,
            Err(_) => return Ok(OllamaStatus::unavailable()),
        };
        status_from_tags(parse_response(response).await?)
    }

    async fn generate(
        &self,
        request: &CueGenerationRequest,
        strict_retry: bool,
    ) -> Result<ContextCue, LlmError> {
        let response = self
            .client
            .post(format!("{}/api/generate", self.base_url))
            .json(&GenerateBody::new(request, strict_retry)?)
            .send()
            .await
            .map_err(map_reqwest_error)?;
        let body: GenerateResponse = parse_response(response).await?;
        serde_json::from_str(&body.response).map_err(|_| LlmError::InvalidResponse)
    }

    async fn pull_model(
        &self,
        model: &str,
        cancellation: CancellationToken,
        report_progress: ProgressReporter,
    ) -> Result<(), LlmError> {
        validate_model_name(model)?;
        let response = self
            .client
            .post(format!("{}/api/pull", self.base_url))
            .json(&json!({ "model": model, "stream": true }))
            .send()
            .await
            .map_err(map_reqwest_error)?;
        let response = checked_response(response)?;
        let mut stream = response.bytes_stream();
        let mut pending = Vec::new();

        loop {
            let chunk = tokio::select! {
                _ = cancellation.cancelled() => return Err(LlmError::Cancelled),
                chunk = stream.next() => chunk,
            };
            let Some(chunk) = chunk else {
                break;
            };
            pending.extend_from_slice(&chunk.map_err(|_| LlmError::Transport)?);
            parse_progress_lines(&mut pending, &report_progress)?;
        }
        parse_last_progress_line(&pending, &report_progress)?;
        Ok(())
    }
}

#[derive(Deserialize)]
struct TagsResponse {
    models: Vec<ModelResponse>,
}

#[derive(Deserialize)]
struct ModelResponse {
    name: String,
    size: u64,
    details: ModelDetails,
}

#[derive(Deserialize)]
struct ModelDetails {
    parameter_size: String,
    quantization_level: String,
}

impl From<ModelResponse> for LlmModel {
    fn from(model: ModelResponse) -> Self {
        Self {
            name: model.name,
            size_bytes: model.size,
            parameter_size: model.details.parameter_size,
            quantization_level: model.details.quantization_level,
        }
    }
}

fn status_from_tags(body: TagsResponse) -> Result<OllamaStatus, LlmError> {
    let models = body
        .models
        .into_iter()
        .map(LlmModel::from)
        .collect::<Vec<_>>();
    let recommended_model_installed = models.iter().any(|model| model.name == RECOMMENDED_MODEL);

    Ok(OllamaStatus {
        running: true,
        message: if recommended_model_installed {
            "推奨モデルを利用できます。".to_owned()
        } else {
            "推奨モデルを取得してください。".to_owned()
        },
        models,
        recommended_model: RECOMMENDED_MODEL.to_owned(),
        recommended_model_installed,
    })
}

#[derive(Serialize)]
struct GenerateBody {
    model: &'static str,
    prompt: String,
    system: &'static str,
    stream: bool,
    format: Value,
    keep_alive: &'static str,
    options: Value,
}

impl GenerateBody {
    fn new(request: &CueGenerationRequest, strict_retry: bool) -> Result<Self, LlmError> {
        let input = serde_json::to_string(request).map_err(|_| LlmError::InvalidResponse)?;
        let retry_instruction = if strict_retry {
            "\n前回の出力は無効でした。説明やMarkdownを含めず、schemaに一致するJSONだけを返してください。"
        } else {
            ""
        };
        Ok(Self {
            model: RECOMMENDED_MODEL,
            prompt: format!("次の会話文脈を整理してください。\n{input}{retry_instruction}"),
            system: SYSTEM_PROMPT,
            stream: false,
            format: context_cue_schema(),
            keep_alive: "5m",
            options: json!({ "temperature": 0, "num_ctx": 4096, "num_predict": 256 }),
        })
    }
}

#[derive(Deserialize)]
struct GenerateResponse {
    response: String,
}

#[derive(Deserialize)]
struct PullResponse {
    status: String,
    #[serde(default)]
    completed: u64,
    #[serde(default)]
    total: u64,
}

const SYSTEM_PROMPT: &str = "あなたは、参加者の同意がある会話で文脈整理を支援するローカルAIです。回答文を代筆せず、利用者になりすまさず、秘密録音や隠れたAI利用を促しません。提供された事実だけを使い、日本語の簡潔なJSONだけを返してください。";

fn context_cue_schema() -> Value {
    json!({
        "type": "object",
        "properties": {
            "topic": { "type": "string" },
            "intent": { "type": "string" },
            "relatedNotes": { "type": "array", "items": { "type": "string" } },
            "suggestedPoints": { "type": "array", "items": { "type": "string" } },
            "questionsToAsk": { "type": "array", "items": { "type": "string" } },
            "caution": { "type": "string" }
        },
        "required": [
            "topic", "intent", "relatedNotes", "suggestedPoints",
            "questionsToAsk", "caution"
        ],
        "additionalProperties": false
    })
}

async fn parse_response<T: for<'de> Deserialize<'de>>(response: Response) -> Result<T, LlmError> {
    checked_response(response)?
        .json()
        .await
        .map_err(|_| LlmError::InvalidResponse)
}

fn checked_response(response: Response) -> Result<Response, LlmError> {
    let status = response.status();
    if status.is_success() {
        Ok(response)
    } else if status.as_u16() == 404 {
        Err(LlmError::ModelNotInstalled)
    } else {
        Err(LlmError::HttpStatus(status.as_u16()))
    }
}

fn map_reqwest_error(error: reqwest::Error) -> LlmError {
    if error.is_timeout() {
        LlmError::Timeout
    } else {
        LlmError::Transport
    }
}

fn validate_model_name(model: &str) -> Result<(), LlmError> {
    let valid = !model.is_empty()
        && model.len() <= 128
        && !model.contains("..")
        && !model.contains("://")
        && model
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._:/-".contains(character));
    valid.then_some(()).ok_or(LlmError::InvalidModelName)
}

fn parse_progress_lines(pending: &mut Vec<u8>, report: &ProgressReporter) -> Result<(), LlmError> {
    while let Some(position) = pending.iter().position(|byte| *byte == b'\n') {
        let line = pending.drain(..=position).collect::<Vec<_>>();
        parse_progress_line(&line, report)?;
    }
    Ok(())
}

fn parse_last_progress_line(pending: &[u8], report: &ProgressReporter) -> Result<(), LlmError> {
    if !pending.is_empty() {
        parse_progress_line(pending, report)?;
    }
    Ok(())
}

fn parse_progress_line(line: &[u8], report: &ProgressReporter) -> Result<(), LlmError> {
    let line = std::str::from_utf8(line)
        .map_err(|_| LlmError::InvalidResponse)?
        .trim();
    if line.is_empty() {
        return Ok(());
    }
    let progress: PullResponse =
        serde_json::from_str(line).map_err(|_| LlmError::InvalidResponse)?;
    let percent = progress
        .completed
        .saturating_mul(100)
        .checked_div(progress.total)
        .map(|value| value.min(100) as u8)
        .unwrap_or_else(|| u8::from(progress.status == "success") * 100);
    report(PullProgress {
        done: progress.status == "success",
        status: progress.status,
        completed_bytes: progress.completed,
        total_bytes: progress.total,
        percent,
    });
    Ok(())
}

#[cfg(test)]
#[path = "ollama_client_tests.rs"]
mod tests;
