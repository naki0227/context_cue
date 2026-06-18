mod commands;
mod state;

use tauri::{window::Color, Manager, WebviewUrl, WebviewWindowBuilder};

fn build_top_overlay_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("overlay_top").is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        "overlay_top",
        WebviewUrl::App("index.html?view=overlay-top".into()),
    )
    .title("How to Talk Top Overlay")
    .inner_size(1680.0, 220.0)
    .min_inner_size(960.0, 160.0)
    .position(44.0, 32.0)
    .decorations(false)
    .transparent(true)
    .background_color(Color(0, 0, 0, 0))
    .always_on_top(true)
    .skip_taskbar(true)
    .shadow(false)
    .resizable(true)
    .build()?;

    Ok(())
}

fn build_side_overlay_window(app: &tauri::AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("overlay_side").is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        "overlay_side",
        WebviewUrl::App("index.html?view=overlay-side".into()),
    )
    .title("How to Talk Side Overlay")
    .inner_size(360.0, 560.0)
    .min_inner_size(300.0, 360.0)
    .position(1510.0, 146.0)
    .decorations(false)
    .transparent(true)
    .background_color(Color(0, 0, 0, 0))
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
            build_top_overlay_window(&app.handle())?;
            build_side_overlay_window(&app.handle())?;
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
            commands::toggle_share_safe_mode,
            commands::set_overlay_visibility
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
