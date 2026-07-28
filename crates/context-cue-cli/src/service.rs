use std::collections::HashSet;

use serde::{Serialize, de::DeserializeOwned};
use serde_json::Value;
use uuid::Uuid;

use crate::{
    args::Resource,
    error::CliError,
    model::{ProjectLinkedSession, WorkspaceState},
    record_contract::{default_record, merge_patch, validate, validate_update_patch},
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
    let mut value = default_record(resource, id);
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
    validate_update_patch(&patch)?;
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
    validate(resource, &value)?;
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
    validate(resource, &value)?;
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

fn internal(error: serde_json::Error) -> CliError {
    CliError::Internal(error.to_string())
}

fn invalid(error: serde_json::Error) -> CliError {
    let message = error.to_string();
    let concise = message
        .strip_prefix("unknown field `")
        .and_then(|rest| rest.split_once('`'))
        .map(|(field, _)| format!("unknown field '{field}'"))
        .unwrap_or(message);
    CliError::Input(concise)
}

#[cfg(test)]
mod tests {
    use super::invalid;

    #[test]
    fn unknown_field_error_does_not_expose_unrelated_fields() {
        let source = r#"{"known":true,"unexpected":true}"#;
        let error =
            serde_json::from_str::<KnownOnly>(source).expect_err("unknown fields must be rejected");

        assert_eq!(invalid(error).to_string(), "unknown field 'unexpected'");
    }

    #[derive(Debug, serde::Deserialize)]
    #[serde(deny_unknown_fields)]
    struct KnownOnly {
        #[allow(dead_code)]
        known: bool,
    }
}
