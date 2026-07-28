use serde_json::{Value, json};

use crate::{args::Resource, error::CliError};

pub fn default_record(resource: Resource, id: String) -> Value {
    let mut object = create_defaults(resource)
        .as_object()
        .cloned()
        .unwrap_or_default();
    object.insert("id".to_owned(), Value::String(id));
    Value::Object(object)
}

pub fn create_defaults(resource: Resource) -> Value {
    match resource {
        Resource::Sessions => {
            json!({"dateLabel":"未設定","durationMinutes":30,"location":"オンライン","memo":"","partner":"相手未設定","peopleIds":[],"platform":"オンライン","projectIds":[],"recording":"","recordingTone":"neutral","startAt":"","status":"予定","statusTone":"blue","title":"新しいセッション","type":"面談","typeTone":"green"})
        }
        Resource::People => {
            json!({"checks":[],"history":[],"lastContactLabel":"未接触","mail":"","memo":[],"name":"新しい人物","profile":[],"role":"役職未設定","shortRole":"その他","updatedAt":""})
        }
        Resource::Projects => {
            json!({"actions":[],"category":"プロジェクト","connections":[],"icon":"chart","issues":0,"linkedSessions":[],"overview":"","points":[],"progress":0,"sessions":0,"statusLabel":"進行中","subtitle":"","title":"新しいプロジェクト","tone":"green","updatedAt":""})
        }
        Resource::Reviews => {
            json!({"actions":[],"date":"","improvements":[],"insights":[],"memo":[],"meta":"","summary":[],"title":"新しい振り返り","transcript":[],"type":"その他"})
        }
        Resource::Knowledge => {
            json!({"content":[],"source":"manual","sourceLabel":"本人入力","confidence":"未確認","sensitivity":"個人","tag":"下書き","title":"新しいナレッジ","updatedAt":""})
        }
        Resource::Templates => {
            json!({"body":[],"description":"","icon":"doc","tag":"その他","title":"新しいテンプレート","tone":"blue","updatedAt":""})
        }
    }
}

pub fn merge_patch(target: &mut Value, patch: Value) -> Result<(), CliError> {
    let patch = patch
        .as_object()
        .ok_or_else(|| CliError::Input("input JSON must be an object".to_owned()))?;
    let target = target
        .as_object_mut()
        .ok_or_else(|| CliError::Internal("record is not an object".to_owned()))?;
    for (key, value) in patch {
        if key == "id" {
            return Err(CliError::Input("id cannot be changed".to_owned()));
        }
        target.insert(key.clone(), value.clone());
    }
    Ok(())
}

pub fn validate_update_patch(patch: &Value) -> Result<(), CliError> {
    let patch = patch
        .as_object()
        .ok_or_else(|| CliError::Input("input JSON must be an object".to_owned()))?;
    if patch.is_empty() {
        return Err(CliError::Input(
            "update input must contain at least one property".to_owned(),
        ));
    }
    Ok(())
}

pub fn validate(resource: Resource, value: &Value) -> Result<(), CliError> {
    if value["id"].as_str().is_none_or(str::is_empty) {
        return Err(CliError::Input("id must not be empty".to_owned()));
    }
    if resource == Resource::Projects
        && value["progress"]
            .as_u64()
            .is_some_and(|progress| progress > 100)
    {
        return Err(CliError::Input(
            "project progress must be between 0 and 100".to_owned(),
        ));
    }
    if resource == Resource::Knowledge {
        validate_choice(
            value.get("confidence"),
            &["確認済み", "概算", "未確認"],
            "confidence",
        )?;
        validate_choice(
            value.get("sensitivity"),
            &["一般", "個人", "機密"],
            "sensitivity",
        )?;
        validate_avatar(value)?;
    }
    Ok(())
}

fn validate_choice(value: Option<&Value>, choices: &[&str], field: &str) -> Result<(), CliError> {
    if let Some(value) = value
        && value.as_str().is_none_or(|value| !choices.contains(&value))
    {
        return Err(CliError::Input(format!("{field} has an invalid value")));
    }
    Ok(())
}

fn validate_avatar(value: &Value) -> Result<(), CliError> {
    let Some(avatar) = value.get("avatarDataUrl").and_then(Value::as_str) else {
        return Ok(());
    };
    let valid_prefix = [
        "data:image/jpeg;base64,",
        "data:image/png;base64,",
        "data:image/webp;base64,",
    ]
    .iter()
    .any(|prefix| avatar.starts_with(prefix));
    if avatar.len() <= 800_000 && valid_prefix {
        return Ok(());
    }
    Err(CliError::Input(
        "avatarDataUrl must be a JPEG, PNG, or WebP data URL up to 800KB".to_owned(),
    ))
}

pub fn apply_defaults_to_schema(schema: &mut Value, resource: Resource) {
    let defaults = create_defaults(resource);
    let Some(properties) = schema.get_mut("properties").and_then(Value::as_object_mut) else {
        return;
    };
    let Some(defaults) = defaults.as_object() else {
        return;
    };
    for (name, default) in defaults {
        if let Some(property) = properties.get_mut(name).and_then(Value::as_object_mut) {
            property.insert("default".to_owned(), default.clone());
        }
    }
}

pub fn remove_id(schema: &mut Value) {
    if let Some(properties) = schema.get_mut("properties").and_then(Value::as_object_mut) {
        properties.remove("id");
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{create_defaults, default_record, validate_update_patch};
    use crate::args::Resource;

    #[test]
    fn every_resource_default_is_an_object_without_id() {
        for resource in all_resources() {
            let defaults = create_defaults(resource);
            assert!(defaults.is_object());
            assert!(defaults.get("id").is_none());
            assert_eq!(
                default_record(resource, "generated".to_owned())["id"],
                "generated"
            );
        }
    }

    #[test]
    fn update_patch_must_not_be_empty() {
        assert!(validate_update_patch(&json!({})).is_err());
        assert!(validate_update_patch(&json!({"title": "更新"})).is_ok());
    }

    fn all_resources() -> [Resource; 6] {
        [
            Resource::Sessions,
            Resource::People,
            Resource::Projects,
            Resource::Reviews,
            Resource::Knowledge,
            Resource::Templates,
        ]
    }
}
