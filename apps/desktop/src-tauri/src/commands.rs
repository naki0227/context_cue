use context_cue_contracts::{AppState, ConsentInput};
use serde_json::Value;
use std::{path::PathBuf, sync::Arc};
use tauri::{AppHandle, Emitter, State};

use crate::{
    app::SharedState,
    config,
    domain::{
        llm::{CueGenerationOutcome, CueGenerationRequest, OllamaStatus, PullProgress},
        profile_document::ProfileImportDraft,
    },
    infrastructure::{mock_event_runner::MockEventRunner, window_manager},
    llm_runtime::LlmRuntime,
    repository::llm_repository::ProgressReporter,
};

#[tauri::command]
pub fn get_launch_mode() -> String {
    config::launch_mode().as_str().to_owned()
}

#[tauri::command]
pub fn get_app_state(state: State<'_, SharedState>) -> Result<AppState, String> {
    state.snapshot().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_workspace_state(state: State<'_, SharedState>) -> Result<Value, String> {
    state
        .workspace_snapshot()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn save_workspace_state(
    state: State<'_, SharedState>,
    workspace_state: Value,
) -> Result<Value, String> {
    state
        .save_workspace_snapshot(workspace_state)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn import_profile_documents(state: State<'_, SharedState>) -> Result<AppState, String> {
    state
        .import_profile_documents()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn import_profile_documents_from_files(
    state: State<'_, SharedState>,
    documents: Vec<ProfileImportDraft>,
) -> Result<AppState, String> {
    state
        .import_profile_documents_from_files(documents)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn remove_profile_document(
    state: State<'_, SharedState>,
    document_id: String,
) -> Result<AppState, String> {
    state
        .remove_profile_document(&document_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn clear_profile_documents(state: State<'_, SharedState>) -> Result<AppState, String> {
    state
        .clear_profile_documents()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn export_workspace(state: State<'_, SharedState>, destination: String) -> Result<(), String> {
    let destination = PathBuf::from(destination);
    if !destination.is_absolute() {
        return Err(crate::error::AppError::InvalidExportPath.to_string());
    }
    state
        .export_workspace(&destination)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_all_data(state: State<'_, SharedState>) -> Result<AppState, String> {
    state.delete_all_data().map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn check_ollama_status(
    state: State<'_, SharedState>,
    runtime: State<'_, LlmRuntime>,
) -> Result<OllamaStatus, String> {
    let status = runtime
        .check_status()
        .await
        .map_err(|error| error.to_string())?;
    state
        .set_ollama_ready(status.running && status.recommended_model_installed)
        .map_err(|error| error.to_string())?;
    Ok(status)
}

#[tauri::command]
pub async fn pull_recommended_model(
    app: AppHandle,
    state: State<'_, SharedState>,
    runtime: State<'_, LlmRuntime>,
) -> Result<OllamaStatus, String> {
    let progress_app = app.clone();
    let reporter: ProgressReporter = Arc::new(move |progress: PullProgress| {
        let _ = progress_app.emit("ollama-pull-progress", progress);
    });
    runtime
        .pull_model(reporter)
        .await
        .map_err(|error| error.to_string())?;
    let status = runtime
        .check_status()
        .await
        .map_err(|error| error.to_string())?;
    state
        .set_ollama_ready(status.running && status.recommended_model_installed)
        .map_err(|error| error.to_string())?;
    Ok(status)
}

#[tauri::command]
pub fn cancel_model_pull(runtime: State<'_, LlmRuntime>) -> Result<(), String> {
    runtime.cancel_pull().map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn generate_context_cue(
    app: AppHandle,
    state: State<'_, SharedState>,
    runtime: State<'_, LlmRuntime>,
    request: CueGenerationRequest,
) -> Result<CueGenerationOutcome, String> {
    let previous_cue = state.context_cue().map_err(|error| error.to_string())?;
    let outcome = runtime.generate(request, previous_cue).await;
    state
        .set_context_cue(outcome.cue.clone())
        .map_err(|error| error.to_string())?;
    app.emit("context-cue-updated", outcome.cue.clone())
        .map_err(|error| error.to_string())?;
    Ok(outcome)
}

#[tauri::command]
pub async fn start_session(
    app: AppHandle,
    state: State<'_, SharedState>,
    consent: ConsentInput,
) -> Result<AppState, String> {
    state.start(consent).map_err(|error| error.to_string())?;

    let snapshot = state.snapshot().map_err(|error| error.to_string())?;
    app.emit("session-status-changed", snapshot.session)
        .map_err(|error| error.to_string())?;

    MockEventRunner::spawn(app, state.inner().clone());

    state.snapshot().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn stop_session(app: AppHandle, state: State<'_, SharedState>) -> Result<AppState, String> {
    state.stop().map_err(|error| error.to_string())?;
    let snapshot = state.snapshot().map_err(|error| error.to_string())?;
    app.emit("session-status-changed", snapshot.session)
        .map_err(|error| error.to_string())?;
    state.snapshot().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn toggle_share_safe_mode(
    app: AppHandle,
    state: State<'_, SharedState>,
) -> Result<AppState, String> {
    let snapshot = state
        .toggle_share_safe_mode()
        .map_err(|error| error.to_string())?;
    app.emit("share-safe-mode-changed", snapshot.session.clone())
        .map_err(|error| error.to_string())?;
    Ok(snapshot)
}

#[tauri::command]
pub fn set_overlay_visibility(
    app: AppHandle,
    overlay: String,
    visible: bool,
) -> Result<(), String> {
    window_manager::set_overlay_visibility(&app, &overlay, visible)
        .map_err(|error| error.to_string())
}
