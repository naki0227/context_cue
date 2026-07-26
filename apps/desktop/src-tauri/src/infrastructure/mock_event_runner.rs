use tauri::AppHandle;
use tokio::time::{Duration, sleep};

use crate::{app::SharedState, live_transcript::process_live_transcript};

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
                if !matches!(state.current_status().as_deref(), Ok("running")) {
                    break;
                }

                sleep(Duration::from_secs(2)).await;
                process_live_transcript(
                    app.clone(),
                    state.clone(),
                    sample.to_owned(),
                    "モック音声",
                )
                .await;
            }
        });
    }
}
