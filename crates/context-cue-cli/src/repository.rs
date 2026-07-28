use std::path::{Path, PathBuf};

use context_cue_workspace::{PersistedWorkspace, WorkspaceLock, read_workspace, write_workspace};
use serde_json::Value;

use crate::{args::Resource, error::CliError, model::WorkspaceState, service};

type WorkspaceEnvelope = PersistedWorkspace<Value, Value>;

pub struct WorkspaceRepository {
    path: PathBuf,
}

impl WorkspaceRepository {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    pub fn resolve_path(data_dir: Option<PathBuf>, demo: bool) -> Result<PathBuf, CliError> {
        let mut path = if let Some(path) = data_dir {
            path
        } else if let Some(path) = std::env::var_os("CONTEXT_CUE_DATA_DIR") {
            PathBuf::from(path)
        } else {
            let mut path = dirs::data_local_dir().ok_or_else(|| {
                CliError::Internal("local data directory is unavailable".to_owned())
            })?;
            path.push(if demo {
                "how-to-talk-demo"
            } else {
                "how-to-talk"
            });
            path
        };
        path.push("workspace-state-v2.json");
        Ok(path)
    }

    pub fn list(&self, resource: Resource) -> Result<Value, CliError> {
        let (_, state) = self.load()?;
        service::list(&state, resource)
    }

    pub fn get(&self, resource: Resource, id: &str) -> Result<Value, CliError> {
        let (_, state) = self.load()?;
        service::get(&state, resource, id)
    }

    pub fn create(&self, resource: Resource, data: Value) -> Result<Value, CliError> {
        self.mutate(|state| service::create(state, resource, data))
    }

    pub fn update(&self, resource: Resource, id: &str, data: Value) -> Result<Value, CliError> {
        self.mutate(|state| service::update(state, resource, id, data))
    }

    pub fn delete(&self, resource: Resource, id: &str) -> Result<Value, CliError> {
        self.mutate(|state| service::delete(state, resource, id))
    }

    fn mutate(
        &self,
        operation: impl FnOnce(&mut WorkspaceState) -> Result<Value, CliError>,
    ) -> Result<Value, CliError> {
        let _lock = WorkspaceLock::acquire(&self.path)?;
        let (mut envelope, mut state) = self.load()?;
        let result = operation(&mut state)?;
        service::normalize(&mut state);
        envelope.dashboard_state =
            serde_json::to_value(state).map_err(|error| CliError::Internal(error.to_string()))?;
        write_workspace(&self.path, &envelope)?;
        Ok(result)
    }

    fn load(&self) -> Result<(WorkspaceEnvelope, WorkspaceState), CliError> {
        let envelope = if self.path.exists() {
            read_workspace(&self.path)?
        } else {
            WorkspaceEnvelope::default()
        };
        let state = serde_json::from_value(envelope.dashboard_state.clone())
            .map_err(|error| CliError::Input(format!("stored workspace is invalid: {error}")))?;
        Ok((envelope, state))
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::WorkspaceRepository;
    use crate::{args::Resource, error::CliError};

    #[test]
    fn crud_round_trip_uses_the_workspace_file() -> Result<(), CliError> {
        let temp_dir =
            tempfile::tempdir().map_err(|error| CliError::Internal(error.to_string()))?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let repository = WorkspaceRepository::new(path.clone());

        let created = repository.create(Resource::Knowledge, json!({"title":"設計方針"}))?;
        let id = created["id"]
            .as_str()
            .ok_or_else(|| CliError::Internal("created id missing".to_owned()))?;
        assert_eq!(
            repository.get(Resource::Knowledge, id)?["title"],
            "設計方針"
        );

        let updated =
            repository.update(Resource::Knowledge, id, json!({"content":["ローカル優先"]}))?;
        assert_eq!(updated["content"], json!(["ローカル優先"]));
        assert_eq!(repository.list(Resource::Knowledge)?[0]["id"], id);

        repository.delete(Resource::Knowledge, id)?;
        assert!(repository.list(Resource::Knowledge)?[0].is_null());
        assert!(path.exists());
        Ok(())
    }

    #[test]
    fn writer_lock_blocks_mutation() -> Result<(), CliError> {
        let temp_dir =
            tempfile::tempdir().map_err(|error| CliError::Internal(error.to_string()))?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let _lock = context_cue_workspace::WorkspaceLock::acquire(&path)?;
        let repository = WorkspaceRepository::new(path);

        let error = repository
            .create(Resource::Templates, json!({"title":"競合"}))
            .expect_err("mutation must be blocked");
        assert_eq!(error.code(), "workspace_in_use");
        Ok(())
    }

    #[test]
    fn deleting_relations_normalizes_sessions() -> Result<(), CliError> {
        let temp_dir =
            tempfile::tempdir().map_err(|error| CliError::Internal(error.to_string()))?;
        let repository = WorkspaceRepository::new(temp_dir.path().join("workspace-state-v2.json"));
        let person = repository.create(Resource::People, json!({"name":"関係者"}))?;
        let project = repository.create(Resource::Projects, json!({"title":"関連案件"}))?;
        let person_id = person["id"].as_str().unwrap_or_default();
        let project_id = project["id"].as_str().unwrap_or_default();
        let session = repository.create(
            Resource::Sessions,
            json!({"peopleIds":[person_id],"projectIds":[project_id]}),
        )?;
        let session_id = session["id"].as_str().unwrap_or_default();

        assert_eq!(
            repository.get(Resource::Projects, project_id)?["sessions"],
            1
        );
        repository.delete(Resource::People, person_id)?;
        repository.delete(Resource::Projects, project_id)?;

        let normalized = repository.get(Resource::Sessions, session_id)?;
        assert_eq!(normalized["peopleIds"], json!([]));
        assert_eq!(normalized["projectIds"], json!([]));
        Ok(())
    }
}
