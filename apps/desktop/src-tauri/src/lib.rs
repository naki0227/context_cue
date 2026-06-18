mod commands;
mod state;

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

fn build_overlay_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("overlay").is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        "overlay",
        WebviewUrl::App("index.html?view=overlay".into()),
    )
    .title("How to Talk Overlay")
    .inner_size(1320.0, 320.0)
    .min_inner_size(900.0, 220.0)
    .position(80.0, 36.0)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .shadow(false)
    .resizable(true)
    .build()?;

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(state::SharedState::default())
        .setup(|app| {
            let shared = app.state::<state::SharedState>().inner().clone();
            shared.bootstrap_profiles();
            build_overlay_window(&app.handle())?;
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
