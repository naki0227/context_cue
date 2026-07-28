use serde_json::{Value, json};

use crate::error::CliError;

pub fn success(data: impl serde::Serialize) -> Value {
    json!({ "ok": true, "data": data })
}

pub fn format(value: &Value) -> String {
    serde_json::to_string_pretty(value)
        .unwrap_or_else(|_| r#"{"ok":false,"error":{"code":"serialization_error"}}"#.to_owned())
}

pub fn format_error(error: &CliError) -> String {
    format(&json!({
        "ok": false,
        "error": {
            "code": error.code(),
            "message": error.to_string(),
        }
    }))
}
