mod commands;
mod state;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(state::SharedState::default())
        .setup(|app| {
            let shared = app.state::<state::SharedState>().inner().clone();
            shared.bootstrap_profiles();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_state,
            commands::import_profile_documents,
            commands::import_profile_documents_from_files,
            commands::remove_profile_document,
            commands::clear_profile_documents,
            commands::start_session,
            commands::stop_session,
            commands::toggle_share_safe_mode
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
