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

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedWorkspace {
    pub documents: Vec<OwnedProfileDocument>,
    #[serde(default)]
    pub dashboard_state: Value,
    pub share_safe_mode: bool,
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
    share_safe_mode: bool,
) {
    let path = persisted_state_file();
    save_workspace_to(&path, documents, dashboard_state, share_safe_mode);
}

fn load_workspace_from(path: &Path) -> Option<PersistedWorkspace> {
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

fn save_workspace_to(
    path: &Path,
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    share_safe_mode: bool,
) {
    let Some(parent) = path.parent() else {
        return;
    };

    if fs::create_dir_all(parent).is_err() {
        return;
    }

    let workspace = PersistedWorkspace {
        documents: documents.to_vec(),
        dashboard_state: dashboard_state.clone(),
        share_safe_mode,
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
        dashboard_state: json!({
            "sessions": [],
            "people": [],
            "projects": [],
            "reviews": [],
            "knowledgeItems": [],
            "templates": [],
        }),
        share_safe_mode: false,
    }
}

pub fn restore_app_state(
    documents: &[OwnedProfileDocument],
    share_safe_mode: bool,
) -> context_cue_contracts::AppState {
    let mut app_state = default_app_state();
    app_state.session.share_safe_mode = share_safe_mode;
    app_state.imported_documents = documents
        .iter()
        .map(OwnedProfileDocument::to_imported_document)
        .collect();
    app_state
}

#[cfg(test)]
mod tests {
    use super::{
        empty_user_workspace, load_workspace_from, save_workspace_to, start_new_workspace,
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
            true,
        );

        let loaded = load_workspace_from(&path).ok_or("workspace was not saved")?;
        assert_eq!(loaded.documents.len(), 1);
        assert_eq!(loaded.dashboard_state, json!({ "sessions": [] }));
        assert!(loaded.share_safe_mode);
        Ok(())
    }

    #[test]
    fn new_workspace_archives_previous_data() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        save_workspace_to(&path, &[], &json!({ "sessions": ["seed"] }), false);

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
}
