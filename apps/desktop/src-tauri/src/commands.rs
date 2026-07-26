use context_cue_contracts::{AppState, ConsentInput};
use serde_json::Value;
use tauri::{AppHandle, Emitter, State};

use crate::{
    app::SharedState,
    config,
    domain::profile_document::ProfileImportDraft,
    infrastructure::{mock_event_runner::MockEventRunner, window_manager},
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
