use tauri::{window::Color, AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::error::AppError;

pub fn build_overlay_windows(app: &AppHandle) -> tauri::Result<()> {
    build_top_overlay_window(app)?;
    build_side_overlay_window(app)?;
    Ok(())
}

pub fn set_overlay_visibility(
    app: &AppHandle,
    overlay: &str,
    visible: bool,
) -> Result<(), AppError> {
    let label = match overlay {
        "top" => "overlay_top",
        "side" => "overlay_side",
        other => return Err(AppError::UnknownOverlayTarget(other.to_owned())),
    };

    let window = app
        .get_webview_window(label)
        .ok_or_else(|| AppError::OverlayWindowNotFound(label.to_owned()))?;

    if visible {
        window.show().map_err(|_| AppError::OverlayWindowNotFound(label.to_owned()))?;
        window.set_focus().map_err(|_| AppError::OverlayWindowNotFound(label.to_owned()))?;
    } else {
        window.hide().map_err(|_| AppError::OverlayWindowNotFound(label.to_owned()))?;
    }

    Ok(())
}

fn build_top_overlay_window(app: &AppHandle) -> tauri::Result<()> {
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

fn build_side_overlay_window(app: &AppHandle) -> tauri::Result<()> {
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
