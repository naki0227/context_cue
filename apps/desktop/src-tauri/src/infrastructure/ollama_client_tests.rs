use super::{TagsResponse, parse_progress_line, status_from_tags, validate_model_name};
use crate::repository::llm_repository::ProgressReporter;
use std::sync::{Arc, Mutex};

#[test]
fn model_name_rejects_path_traversal() {
    assert!(validate_model_name("gemma4:e2b").is_ok());
    assert!(validate_model_name("../private").is_err());
    assert!(validate_model_name("http://remote/model").is_err());
}

#[test]
fn pull_progress_is_converted_to_percent() {
    let captured = Arc::new(Mutex::new(Vec::new()));
    let target = Arc::clone(&captured);
    let reporter: ProgressReporter = Arc::new(move |progress| {
        if let Ok(mut values) = target.lock() {
            values.push(progress.percent);
        }
    });

    let result = parse_progress_line(
        br#"{"status":"pulling manifest","completed":50,"total":200}"#,
        &reporter,
    );

    assert!(result.is_ok());
    assert_eq!(
        captured.lock().map(|value| value.clone()).ok(),
        Some(vec![25])
    );
}

#[test]
fn status_reads_installed_models_from_api_contract() {
    let body: Option<TagsResponse> = serde_json::from_str(
        r#"{"models":[{"name":"gemma4:e2b","size":7162405886,"details":{"parameter_size":"5.1B","quantization_level":"Q4_K_M"}}]}"#,
    )
    .ok();
    let status = body.and_then(|body| status_from_tags(body).ok());

    assert!(status.as_ref().is_some_and(|value| value.running));
    assert!(
        status
            .as_ref()
            .is_some_and(|value| value.recommended_model_installed)
    );
    assert_eq!(
        status
            .and_then(|value| value.models.first().cloned())
            .map(|model| model.size_bytes),
        Some(7_162_405_886)
    );
}
