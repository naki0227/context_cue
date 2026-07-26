use tauri::{AppHandle, Emitter, Manager};

use crate::{
    app::SharedState, llm_runtime::LlmRuntime,
    usecase::session_usecase::build_cue_generation_request,
};

pub async fn process_live_transcript(
    app: AppHandle,
    state: SharedState,
    text: String,
    source: &'static str,
) {
    if !matches!(state.current_status().as_deref(), Ok("running")) {
        return;
    }

    let Ok((chunk, summary, rule_cue, adaptive)) = state.push_transcript_chunk(&text, source)
    else {
        let _ = app.emit("stt-warning", "文字起こし結果を処理できませんでした。");
        return;
    };

    let _ = app.emit("transcript-updated", chunk);
    let _ = app.emit("rolling-summary-updated", summary.clone());
    let _ = app.emit("question-score-updated", adaptive.clone());

    let final_cue =
        if let Some(request) = build_cue_generation_request(&text, summary, &rule_cue, &adaptive) {
            let outcome = app
                .state::<LlmRuntime>()
                .generate(request, rule_cue.clone())
                .await;
            if let Some(warning) = outcome.warning {
                let _ = app.emit("llm-warning", warning);
            }
            outcome.cue
        } else {
            rule_cue
        };

    // A slow local model must not restore content after the session was stopped.
    if !matches!(state.current_status().as_deref(), Ok("running")) {
        return;
    }
    if state.set_context_cue(final_cue.clone()).is_ok() {
        let _ = app.emit("context-cue-updated", final_cue);
    }
}
