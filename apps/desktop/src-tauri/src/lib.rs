mod app;
mod commands;
mod config;
mod domain;
mod error;
mod infrastructure;
mod repository;
mod usecase;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(app::SharedState::default())
        .setup(|app| {
            let shared = app.state::<app::SharedState>().inner().clone();
            shared.bootstrap_profiles();
            infrastructure::window_manager::build_overlay_windows(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_state,
            commands::get_workspace_state,
            commands::import_profile_documents,
            commands::import_profile_documents_from_files,
            commands::remove_profile_document,
            commands::clear_profile_documents,
            commands::save_workspace_state,
            commands::start_session,
            commands::stop_session,
            commands::toggle_share_safe_mode,
            commands::set_overlay_visibility
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
