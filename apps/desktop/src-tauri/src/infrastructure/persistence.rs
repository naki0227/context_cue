use std::{
    fs, io,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::{
    config::{LaunchMode, launch_mode, persisted_state_file},
    domain::profile_document::OwnedProfileDocument,
    usecase::session_usecase::default_app_state,
};

const CURRENT_SCHEMA_VERSION: u32 = 3;

fn current_schema_version() -> u32 {
    CURRENT_SCHEMA_VERSION
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConsentAuditRecord {
    pub session_id: String,
    pub confirmed_at_unix_ms: u64,
    pub policy_version: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedWorkspace {
    #[serde(default = "current_schema_version")]
    pub schema_version: u32,
    pub documents: Vec<OwnedProfileDocument>,
    #[serde(default)]
    pub dashboard_state: Value,
    #[serde(default)]
    pub consent_audit: Vec<ConsentAuditRecord>,
}

pub fn load_workspace() -> PersistedWorkspace {
    let path = persisted_state_file();

    match launch_mode() {
        LaunchMode::New => start_new_workspace(&path),
        LaunchMode::Resume => load_workspace_from(&path).unwrap_or_else(empty_user_workspace),
        LaunchMode::Demo => load_workspace_from(&path).unwrap_or_default(),
    }
}

pub fn save_workspace(
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    consent_audit: &[ConsentAuditRecord],
) {
    let path = persisted_state_file();
    save_workspace_to(&path, documents, dashboard_state, consent_audit);
}

fn load_workspace_from(path: &Path) -> Option<PersistedWorkspace> {
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

fn save_workspace_to(
    path: &Path,
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    consent_audit: &[ConsentAuditRecord],
) {
    let Some(parent) = path.parent() else {
        return;
    };

    if fs::create_dir_all(parent).is_err() {
        return;
    }

    let workspace = PersistedWorkspace {
        schema_version: CURRENT_SCHEMA_VERSION,
        documents: documents.to_vec(),
        dashboard_state: dashboard_state.clone(),
        consent_audit: consent_audit.to_vec(),
    };

    let Ok(serialized) = serde_json::to_string_pretty(&workspace) else {
        return;
    };

    let _ = fs::write(path, serialized);
}

fn start_new_workspace(path: &Path) -> PersistedWorkspace {
    match archive_workspace(path) {
        Ok(_) => empty_user_workspace(),
        Err(error) => {
            eprintln!("failed to archive the previous workspace: {error}");
            load_workspace_from(path).unwrap_or_else(empty_user_workspace)
        }
    }
}

fn archive_workspace(path: &Path) -> io::Result<Option<PathBuf>> {
    if !path.exists() {
        return Ok(None);
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(io::Error::other)?
        .as_nanos();
    let backup_path = path.with_file_name(format!("workspace-state-v2.backup-{timestamp}.json"));

    fs::copy(path, &backup_path)?;
    fs::remove_file(path)?;
    Ok(Some(backup_path))
}

fn empty_user_workspace() -> PersistedWorkspace {
    PersistedWorkspace {
        documents: Vec::new(),
        schema_version: CURRENT_SCHEMA_VERSION,
        dashboard_state: json!({
            "sessions": [],
            "people": [],
            "projects": [],
            "reviews": [],
            "knowledgeItems": [],
            "templates": [],
        }),
        consent_audit: Vec::new(),
    }
}

pub fn restore_app_state(documents: &[OwnedProfileDocument]) -> context_cue_contracts::AppState {
    let mut app_state = default_app_state();
    app_state.imported_documents = documents
        .iter()
        .map(OwnedProfileDocument::to_imported_document)
        .collect();
    app_state
}

#[cfg(test)]
mod tests {
    use super::{
        ConsentAuditRecord, empty_user_workspace, load_workspace_from, save_workspace_to,
        start_new_workspace,
    };
    use crate::domain::profile_document::OwnedProfileDocument;
    use serde_json::json;
    use std::{error::Error, fs};

    #[test]
    fn workspace_round_trip_works() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");

        save_workspace_to(
            &path,
            &[OwnedProfileDocument {
                id: "note-1".to_owned(),
                title: "note".to_owned(),
                content: "hello".to_owned(),
                source_type: "ローカルファイル".to_owned(),
            }],
            &json!({ "sessions": [] }),
            &[],
        );

        let loaded = load_workspace_from(&path).ok_or("workspace was not saved")?;
        assert_eq!(loaded.documents.len(), 1);
        assert_eq!(loaded.dashboard_state, json!({ "sessions": [] }));
        assert_eq!(loaded.schema_version, 3);
        assert!(loaded.consent_audit.is_empty());
        Ok(())
    }

    #[test]
    fn new_workspace_archives_previous_data() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        save_workspace_to(&path, &[], &json!({ "sessions": ["seed"] }), &[]);

        let workspace = start_new_workspace(&path);
        let backups = fs::read_dir(temp_dir.path())?
            .filter_map(Result::ok)
            .filter(|entry| {
                entry
                    .file_name()
                    .to_string_lossy()
                    .starts_with("workspace-state-v2.backup-")
            })
            .collect::<Vec<_>>();

        assert_eq!(
            workspace.dashboard_state,
            empty_user_workspace().dashboard_state
        );
        assert!(!path.exists());
        assert_eq!(backups.len(), 1);

        let archived = load_workspace_from(&backups[0].path())
            .ok_or("archived workspace could not be loaded")?;
        assert_eq!(archived.dashboard_state, json!({ "sessions": ["seed"] }));
        Ok(())
    }

    #[test]
    fn consent_audit_does_not_store_checkbox_values() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let audit = [ConsentAuditRecord {
            session_id: "session-1".to_owned(),
            confirmed_at_unix_ms: 1_234,
            policy_version: "consent-v1".to_owned(),
        }];

        save_workspace_to(&path, &[], &json!({ "sessions": [] }), &audit);

        let content = fs::read_to_string(path)?;
        assert!(content.contains("\"sessionId\": \"session-1\""));
        assert!(!content.contains("participantConsent"));
        assert!(!content.contains("noCovertUse"));
        assert!(!content.contains("shareSafeUnderstood"));
        Ok(())
    }
}
