use std::io::Read;

use serde_json::Value;

use crate::{args::JsonInput, error::CliError};

pub fn read_json(input: &JsonInput) -> Result<Value, CliError> {
    let content = if let Some(data) = &input.data {
        if data == "-" {
            let mut content = String::new();
            std::io::stdin()
                .read_to_string(&mut content)
                .map_err(|error| CliError::Internal(error.to_string()))?;
            content
        } else {
            data.clone()
        }
    } else if let Some(path) = &input.file {
        std::fs::read_to_string(path).map_err(|source| CliError::Io {
            path: path.clone(),
            source,
        })?
    } else {
        return Err(CliError::Input("JSON input is required".to_owned()));
    };

    let value: Value =
        serde_json::from_str(&content).map_err(|error| CliError::Input(error.to_string()))?;
    if !value.is_object() {
        return Err(CliError::Input("input JSON must be an object".to_owned()));
    }
    Ok(value)
}
