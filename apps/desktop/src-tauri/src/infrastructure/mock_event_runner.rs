use tauri::{AppHandle, Emitter};
use tokio::time::{Duration, sleep};

use crate::app::SharedState;

pub struct MockEventRunner;

impl MockEventRunner {
    pub fn spawn(app: AppHandle, state: SharedState) {
        tauri::async_runtime::spawn(async move {
            let samples = [
                "前回の仕様確認から始めましょう",
                "この変更は今回のリリース対象ですか？",
                "担当者の確認も必要です",
                "面接で過去プロジェクトの説明をどう整理しますか？",
            ];

            for sample in samples {
                if state.current_status() != "running" {
                    break;
                }

                sleep(Duration::from_secs(2)).await;
                let (chunk, summary, cue, adaptive) = state.push_mock_chunk(sample);
                let _ = app.emit("transcript-updated", chunk);
                let _ = app.emit("rolling-summary-updated", summary);
                let _ = app.emit("context-cue-updated", cue);
                let _ = app.emit("question-score-updated", adaptive);
            }
        });
    }
}
