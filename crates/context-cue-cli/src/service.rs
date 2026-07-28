use std::collections::HashSet;

use serde::{Serialize, de::DeserializeOwned};
use serde_json::{Map, Value, json};
use uuid::Uuid;

use crate::{
    args::Resource,
    error::CliError,
    model::{ProjectLinkedSession, WorkspaceState},
};

pub fn list(state: &WorkspaceState, resource: Resource) -> Result<Value, CliError> {
    collection(state, resource)
}

pub fn get(state: &WorkspaceState, resource: Resource, id: &str) -> Result<Value, CliError> {
    collection(state, resource)?
        .as_array()
        .and_then(|items| items.iter().find(|item| item["id"] == id))
        .cloned()
        .ok_or_else(|| CliError::NotFound {
            resource: resource.key(),
            id: id.to_owned(),
        })
}

pub fn create(
    state: &mut WorkspaceState,
    resource: Resource,
    patch: Value,
) -> Result<Value, CliError> {
    let id = format!("{}-{}", resource.id_prefix(), Uuid::new_v4());
    let mut value = default_value(resource, id);
    merge_patch(&mut value, patch)?;
    match resource {
        Resource::Sessions => create_typed(&mut state.sessions, resource, value),
        Resource::People => create_typed(&mut state.people, resource, value),
        Resource::Projects => create_typed(&mut state.projects, resource, value),
        Resource::Reviews => create_typed(&mut state.reviews, resource, value),
        Resource::Knowledge => create_typed(&mut state.knowledge_items, resource, value),
        Resource::Templates => create_typed(&mut state.templates, resource, value),
    }
}

pub fn update(
    state: &mut WorkspaceState,
    resource: Resource,
    id: &str,
    patch: Value,
) -> Result<Value, CliError> {
    match resource {
        Resource::Sessions => update_typed(&mut state.sessions, resource, id, patch),
        Resource::People => update_typed(&mut state.people, resource, id, patch),
        Resource::Projects => update_typed(&mut state.projects, resource, id, patch),
        Resource::Reviews => update_typed(&mut state.reviews, resource, id, patch),
        Resource::Knowledge => update_typed(&mut state.knowledge_items, resource, id, patch),
        Resource::Templates => update_typed(&mut state.templates, resource, id, patch),
    }
}

pub fn delete(state: &mut WorkspaceState, resource: Resource, id: &str) -> Result<Value, CliError> {
    match resource {
        Resource::Sessions => delete_typed(&mut state.sessions, resource, id),
        Resource::People => delete_typed(&mut state.people, resource, id),
        Resource::Projects => delete_typed(&mut state.projects, resource, id),
        Resource::Reviews => delete_typed(&mut state.reviews, resource, id),
        Resource::Knowledge => delete_typed(&mut state.knowledge_items, resource, id),
        Resource::Templates => delete_typed(&mut state.templates, resource, id),
    }
}

pub fn normalize(state: &mut WorkspaceState) {
    let people_ids = state
        .people
        .iter()
        .map(|item| item.id.as_str())
        .collect::<HashSet<_>>();
    let project_ids = state
        .projects
        .iter()
        .map(|item| item.id.as_str())
        .collect::<HashSet<_>>();
    let review_ids = state
        .reviews
        .iter()
        .map(|item| item.id.as_str())
        .collect::<HashSet<_>>();

    for session in &mut state.sessions {
        retain_unique(&mut session.people_ids, &people_ids);
        retain_unique(&mut session.project_ids, &project_ids);
        if session
            .review_id
            .as_ref()
            .is_some_and(|id| !review_ids.contains(id.as_str()))
        {
            session.review_id = None;
        }
    }

    for project in &mut state.projects {
        project.linked_sessions = state
            .sessions
            .iter()
            .filter(|session| session.project_ids.contains(&project.id))
            .map(|session| ProjectLinkedSession {
                date: session.date_label.clone(),
                id: session.id.clone(),
                title: session.title.clone(),
                kind: session.kind.clone(),
            })
            .collect();
        project.sessions = u32::try_from(project.linked_sessions.len()).unwrap_or(u32::MAX);
    }
}

fn retain_unique(ids: &mut Vec<String>, valid_ids: &HashSet<&str>) {
    let mut seen = HashSet::new();
    ids.retain(|id| valid_ids.contains(id.as_str()) && seen.insert(id.clone()));
}

fn collection(state: &WorkspaceState, resource: Resource) -> Result<Value, CliError> {
    match resource {
        Resource::Sessions => to_value(&state.sessions),
        Resource::People => to_value(&state.people),
        Resource::Projects => to_value(&state.projects),
        Resource::Reviews => to_value(&state.reviews),
        Resource::Knowledge => to_value(&state.knowledge_items),
        Resource::Templates => to_value(&state.templates),
    }
}

fn to_value<T: Serialize>(value: &T) -> Result<Value, CliError> {
    serde_json::to_value(value).map_err(internal)
}

fn create_typed<T>(items: &mut Vec<T>, resource: Resource, value: Value) -> Result<Value, CliError>
where
    T: DeserializeOwned + Serialize,
{
    validate_semantics(resource, &value)?;
    let record = serde_json::from_value::<T>(value).map_err(invalid)?;
    let serialized = to_value(&record)?;
    let id = serialized["id"].as_str().unwrap_or_default();
    if find_index(items, id)?.is_some() {
        return Err(CliError::Conflict("id already exists".to_owned()));
    }
    items.push(record);
    Ok(serialized)
}

fn update_typed<T>(
    items: &mut [T],
    resource: Resource,
    id: &str,
    patch: Value,
) -> Result<Value, CliError>
where
    T: DeserializeOwned + Serialize,
{
    let index = find_index(items, id)?.ok_or_else(|| not_found(resource, id))?;
    let mut value = to_value(&items[index])?;
    merge_patch(&mut value, patch)?;
    validate_semantics(resource, &value)?;
    let record = serde_json::from_value::<T>(value).map_err(invalid)?;
    let serialized = to_value(&record)?;
    items[index] = record;
    Ok(serialized)
}

fn delete_typed<T>(items: &mut Vec<T>, resource: Resource, id: &str) -> Result<Value, CliError>
where
    T: Serialize,
{
    let index = find_index(items, id)?.ok_or_else(|| not_found(resource, id))?;
    to_value(&items.remove(index))
}

fn find_index<T: Serialize>(items: &[T], id: &str) -> Result<Option<usize>, CliError> {
    for (index, item) in items.iter().enumerate() {
        if to_value(item)?["id"] == id {
            return Ok(Some(index));
        }
    }
    Ok(None)
}

fn not_found(resource: Resource, id: &str) -> CliError {
    CliError::NotFound {
        resource: resource.key(),
        id: id.to_owned(),
    }
}

fn merge_patch(target: &mut Value, patch: Value) -> Result<(), CliError> {
    let patch = patch
        .as_object()
        .ok_or_else(|| CliError::Input("input JSON must be an object".to_owned()))?;
    let target = target
        .as_object_mut()
        .ok_or_else(|| CliError::Internal("record is not an object".to_owned()))?;
    for (key, value) in patch {
        if key == "id" && target.get("id") != Some(value) {
            return Err(CliError::Input("id cannot be changed".to_owned()));
        }
        target.insert(key.clone(), value.clone());
    }
    Ok(())
}

fn validate_semantics(resource: Resource, value: &Value) -> Result<(), CliError> {
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
        if let Some(avatar) = value.get("avatarDataUrl").and_then(Value::as_str)
            && (avatar.len() > 800_000
                || ![
                    "data:image/jpeg;base64,",
                    "data:image/png;base64,",
                    "data:image/webp;base64,",
                ]
                .iter()
                .any(|prefix| avatar.starts_with(prefix)))
        {
            return Err(CliError::Input(
                "avatarDataUrl must be a JPEG, PNG, or WebP data URL up to 800KB".to_owned(),
            ));
        }
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

fn default_value(resource: Resource, id: String) -> Value {
    let base = Map::from_iter([("id".to_owned(), Value::String(id))]);
    let defaults = match resource {
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
    };
    let mut object = defaults.as_object().cloned().unwrap_or(base.clone());
    object.extend(base);
    Value::Object(object)
}

fn internal(error: serde_json::Error) -> CliError {
    CliError::Internal(error.to_string())
}

fn invalid(error: serde_json::Error) -> CliError {
    CliError::Input(error.to_string())
}
