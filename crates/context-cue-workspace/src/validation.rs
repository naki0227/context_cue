use serde_json::Value;

use crate::{CURRENT_SCHEMA_VERSION, PersistenceError};

pub const MAX_WORKSPACE_BYTES: usize = 10 * 1024 * 1024;
const MAX_COLLECTION_ITEMS: usize = 10_000;
const COLLECTION_KEYS: [&str; 6] = [
    "sessions",
    "people",
    "projects",
    "reviews",
    "knowledgeItems",
    "templates",
];

pub(crate) fn validate_dashboard_state(value: &Value) -> Result<(), PersistenceError> {
    let object = value.as_object().ok_or(PersistenceError::InvalidSchema(
        "workspace must be an object",
    ))?;

    for key in COLLECTION_KEYS {
        let collection =
            object
                .get(key)
                .and_then(Value::as_array)
                .ok_or(PersistenceError::InvalidSchema(
                    "workspace collections must be arrays",
                ))?;
        if collection.len() > MAX_COLLECTION_ITEMS {
            return Err(PersistenceError::InvalidSchema(
                "workspace collection limit exceeded",
            ));
        }
    }
    Ok(())
}

pub(crate) fn validate_schema_version(version: u32) -> Result<(), PersistenceError> {
    if version > CURRENT_SCHEMA_VERSION {
        return Err(PersistenceError::UnsupportedSchemaVersion(version));
    }
    Ok(())
}

pub(crate) fn validate_size(bytes: usize) -> Result<(), PersistenceError> {
    if bytes > MAX_WORKSPACE_BYTES {
        return Err(PersistenceError::WorkspaceTooLarge {
            actual: bytes,
            maximum: MAX_WORKSPACE_BYTES,
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{validate_dashboard_state, validate_size};
    use crate::empty_dashboard_state;

    #[test]
    fn dashboard_requires_all_collections() {
        assert!(validate_dashboard_state(&json!({ "sessions": [] })).is_err());
        assert!(validate_dashboard_state(&empty_dashboard_state()).is_ok());
    }

    #[test]
    fn workspace_size_has_a_hard_limit() {
        assert!(validate_size(10 * 1024 * 1024).is_ok());
        assert!(validate_size(10 * 1024 * 1024 + 1).is_err());
    }
}
