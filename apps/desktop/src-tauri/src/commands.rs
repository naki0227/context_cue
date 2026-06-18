use context_cue_contracts::{AppState, ConsentInput};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::state::{MockEventRunner, ProfileImportDraft, SharedState};

#[tauri::command]
pub fn get_app_state(state: State<'_, SharedState>) -> AppState {
    state.snapshot()
}

#[tauri::command]
pub fn import_profile_documents(state: State<'_, SharedState>) -> AppState {
    state.import_profile_documents()
}

#[tauri::command]
pub fn import_profile_documents_from_files(
    state: State<'_, SharedState>,
    documents: Vec<ProfileImportDraft>,
) -> AppState {
    state.import_profile_documents_from_files(documents)
}

#[tauri::command]
pub fn remove_profile_document(state: State<'_, SharedState>, document_id: String) -> AppState {
    state.remove_profile_document(&document_id)
}

#[tauri::command]
pub fn clear_profile_documents(state: State<'_, SharedState>) -> AppState {
    state.clear_profile_documents()
}

#[tauri::command]
pub async fn start_session(
    app: AppHandle,
    state: State<'_, SharedState>,
    consent: ConsentInput,
) -> Result<AppState, String> {
    state.start(consent).map_err(|error| error.to_string())?;

    app.emit("session-status-changed", state.snapshot().session)
        .map_err(|error| error.to_string())?;

    MockEventRunner::spawn(app, state.inner().clone());

    Ok(state.snapshot())
}

#[tauri::command]
pub fn stop_session(app: AppHandle, state: State<'_, SharedState>) -> Result<AppState, String> {
    state.stop();
    app.emit("session-status-changed", state.snapshot().session)
        .map_err(|error| error.to_string())?;
    Ok(state.snapshot())
}

#[tauri::command]
pub fn toggle_share_safe_mode(
    app: AppHandle,
    state: State<'_, SharedState>,
) -> Result<AppState, String> {
    let snapshot = state.toggle_share_safe_mode();
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
    let label = match overlay.as_str() {
        "top" => "overlay_top",
        "side" => "overlay_side",
        other => return Err(format!("unknown overlay target: {other}")),
    };

    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("overlay window not found: {label}"))?;

    if visible {
        window.show().map_err(|error| error.to_string())?;
        window.set_focus().map_err(|error| error.to_string())?;
    } else {
        window.hide().map_err(|error| error.to_string())?;
    }

    Ok(())
}
