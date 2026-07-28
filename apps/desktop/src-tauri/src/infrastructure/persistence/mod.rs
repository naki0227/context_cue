pub mod model;

use std::path::Path;

use context_cue_workspace::{
    archive_workspace, delete_workspace_files, read_workspace, recover_latest_backup,
    write_workspace,
};
use serde_json::Value;

use crate::{
    config::{LaunchMode, launch_mode, persisted_state_file},
    domain::profile_document::OwnedProfileDocument,
    usecase::session_usecase::default_app_state,
};

use context_cue_workspace::CURRENT_SCHEMA_VERSION;
pub use context_cue_workspace::PersistenceError;
use model::PersistedWorkspace;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentAuditRecord {
    pub session_id: String,
    pub confirmed_at_unix_ms: u64,
    pub policy_version: String,
}

pub fn load_workspace() -> Result<PersistedWorkspace, PersistenceError> {
    let path = persisted_state_file();
    load_workspace_at(&path, launch_mode())
}

pub fn load_workspace_at(
    path: &Path,
    mode: LaunchMode,
) -> Result<PersistedWorkspace, PersistenceError> {
    match mode {
        LaunchMode::New => start_new_workspace(path),
        LaunchMode::Resume | LaunchMode::Demo => load_or_recover(path),
    }
}

pub fn save_workspace_at(
    path: &Path,
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    consent_audit: &[ConsentAuditRecord],
) -> Result<(), PersistenceError> {
    let workspace = PersistedWorkspace {
        schema_version: CURRENT_SCHEMA_VERSION,
        documents: documents.to_vec(),
        dashboard_state: dashboard_state.clone(),
        consent_audit: consent_audit.to_vec(),
    };
    write_workspace(path, &workspace)
}

pub fn export_workspace_at(
    destination: &Path,
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    consent_audit: &[ConsentAuditRecord],
) -> Result<(), PersistenceError> {
    save_workspace_at(destination, documents, dashboard_state, consent_audit)
}

pub fn delete_workspace_at(path: &Path) -> Result<(), PersistenceError> {
    delete_workspace_files(path)
}

pub fn restore_app_state(documents: &[OwnedProfileDocument]) -> context_cue_contracts::AppState {
    let mut app_state = default_app_state();
    app_state.imported_documents = documents
        .iter()
        .map(OwnedProfileDocument::to_imported_document)
        .collect();
    app_state
}

fn load_or_recover(path: &Path) -> Result<PersistedWorkspace, PersistenceError> {
    if !path.exists() {
        return Ok(PersistedWorkspace::default());
    }

    match read_workspace(path) {
        Ok(workspace) => Ok(workspace),
        Err(primary_error) => recover_latest_backup(path)?.ok_or(primary_error),
    }
}

fn start_new_workspace(path: &Path) -> Result<PersistedWorkspace, PersistenceError> {
    archive_workspace(path)?;
    Ok(PersistedWorkspace::default())
}

#[cfg(test)]
mod tests {
    use super::{ConsentAuditRecord, model::PersistedWorkspace};
    use context_cue_workspace::{
        archive_workspace, delete_workspace_files, read_workspace, recover_latest_backup,
        write_workspace,
    };
    use std::{error::Error, fs};

    #[test]
    fn workspace_round_trip_is_private_and_versioned() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        write_workspace(&path, &PersistedWorkspace::default())?;

        let loaded: PersistedWorkspace = read_workspace(&path)?;
        assert_eq!(loaded.schema_version, 3);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(fs::metadata(path)?.permissions().mode() & 0o777, 0o600);
        }
        Ok(())
    }

    #[test]
    fn corrupted_workspace_recovers_from_latest_backup() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let workspace = PersistedWorkspace::default();
        write_workspace(&path, &workspace)?;
        archive_workspace(&path)?;
        fs::write(&path, b"{broken")?;

        let recovered: PersistedWorkspace =
            recover_latest_backup(&path)?.ok_or("backup missing")?;
        assert_eq!(recovered.schema_version, 3);
        let restored: Result<PersistedWorkspace, _> = read_workspace(&path);
        assert!(restored.is_ok());
        Ok(())
    }

    #[test]
    fn consent_audit_contains_no_checkbox_values() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let workspace = PersistedWorkspace {
            consent_audit: vec![ConsentAuditRecord {
                session_id: "session-1".to_owned(),
                confirmed_at_unix_ms: 1_234,
                policy_version: "consent-v1".to_owned(),
            }],
            ..PersistedWorkspace::default()
        };
        write_workspace(&path, &workspace)?;

        let content = fs::read_to_string(path)?;
        assert!(content.contains("\"sessionId\": \"session-1\""));
        assert!(!content.contains("participantConsent"));
        assert!(!content.contains("noCovertUse"));
        assert!(!content.contains("shareSafeUnderstood"));
        Ok(())
    }

    #[test]
    fn backup_retention_is_limited() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");

        for _ in 0..8 {
            write_workspace(&path, &PersistedWorkspace::default())?;
            archive_workspace(&path)?;
        }

        let backup_count = fs::read_dir(temp_dir.path())?
            .filter_map(Result::ok)
            .filter(|entry| {
                entry
                    .file_name()
                    .to_string_lossy()
                    .starts_with("workspace-state-v2.backup-")
            })
            .count();
        assert_eq!(backup_count, 5);
        Ok(())
    }

    #[test]
    fn full_delete_removes_workspace_backups_and_temporary_files() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        write_workspace(&path, &PersistedWorkspace::default())?;
        archive_workspace(&path)?;
        write_workspace(&path, &PersistedWorkspace::default())?;
        fs::write(
            temp_dir.path().join(".workspace-interrupted.tmp"),
            b"partial",
        )?;

        delete_workspace_files(&path)?;

        assert_eq!(fs::read_dir(temp_dir.path())?.count(), 0);
        Ok(())
    }
}
