mod file_store;
pub mod model;
mod validation;

use std::{fmt, io, path::Path};

use serde_json::Value;

use crate::{
    config::{LaunchMode, launch_mode, persisted_state_file},
    domain::profile_document::OwnedProfileDocument,
    usecase::session_usecase::default_app_state,
};

pub use model::ConsentAuditRecord;
use model::{CURRENT_SCHEMA_VERSION, PersistedWorkspace};

#[derive(Debug)]
pub enum PersistenceError {
    Clock,
    Deserialize(serde_json::Error),
    InvalidSchema(&'static str),
    MissingParent,
    Read(io::Error),
    Serialize(serde_json::Error),
    UnsupportedSchemaVersion(u32),
    WorkspaceTooLarge { actual: usize, maximum: usize },
    Write(io::Error),
}

impl fmt::Display for PersistenceError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Clock => write!(formatter, "system clock is unavailable"),
            Self::Deserialize(_) => write!(formatter, "workspace data is corrupted"),
            Self::InvalidSchema(message) => write!(formatter, "invalid workspace: {message}"),
            Self::MissingParent => write!(formatter, "workspace directory is invalid"),
            Self::Read(_) => write!(formatter, "workspace could not be read"),
            Self::Serialize(_) => write!(formatter, "workspace could not be encoded"),
            Self::UnsupportedSchemaVersion(version) => {
                write!(formatter, "workspace version {version} is not supported")
            }
            Self::WorkspaceTooLarge { actual, maximum } => {
                write!(formatter, "workspace size {actual} exceeds limit {maximum}")
            }
            Self::Write(_) => write!(formatter, "workspace could not be saved"),
        }
    }
}

impl std::error::Error for PersistenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Deserialize(error) | Self::Serialize(error) => Some(error),
            Self::Read(error) | Self::Write(error) => Some(error),
            _ => None,
        }
    }
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
    file_store::write_workspace(path, &workspace)
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

    match file_store::read_workspace(path) {
        Ok(workspace) => Ok(workspace),
        Err(primary_error) => file_store::recover_latest_backup(path)?.ok_or(primary_error),
    }
}

fn start_new_workspace(path: &Path) -> Result<PersistedWorkspace, PersistenceError> {
    file_store::archive_workspace(path)?;
    Ok(PersistedWorkspace::default())
}

#[cfg(test)]
mod tests {
    use super::{
        ConsentAuditRecord,
        file_store::{archive_workspace, read_workspace, recover_latest_backup, write_workspace},
        model::PersistedWorkspace,
    };
    use std::{error::Error, fs};

    #[test]
    fn workspace_round_trip_is_private_and_versioned() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        write_workspace(&path, &PersistedWorkspace::default())?;

        let loaded = read_workspace(&path)?;
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

        let recovered = recover_latest_backup(&path)?.ok_or("backup missing")?;
        assert_eq!(recovered.schema_version, 3);
        assert!(read_workspace(&path).is_ok());
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
}
