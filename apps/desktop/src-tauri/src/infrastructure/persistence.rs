use std::fs;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    config::persisted_state_file,
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
    let Ok(content) = fs::read_to_string(path) else {
        return PersistedWorkspace::default();
    };

    serde_json::from_str(&content).unwrap_or_default()
}

pub fn save_workspace(
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    share_safe_mode: bool,
) {
    let path = persisted_state_file();
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

pub fn restore_app_state(documents: &[OwnedProfileDocument], share_safe_mode: bool) -> context_cue_contracts::AppState {
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
    use super::{load_workspace, save_workspace};
    use crate::domain::profile_document::OwnedProfileDocument;
    use serde_json::json;

    #[test]
    fn workspace_round_trip_works() {
        let temp_dir = tempfile::tempdir().expect("temporary directory");
        unsafe {
            std::env::set_var("CONTEXT_CUE_DATA_DIR", temp_dir.path());
        }

        save_workspace(
            &[OwnedProfileDocument {
                id: "note-1".to_owned(),
                title: "note".to_owned(),
                content: "hello".to_owned(),
                source_type: "ローカルファイル".to_owned(),
            }],
            &json!({ "sessions": [] }),
            true,
        );

        let loaded = load_workspace();
        assert_eq!(loaded.documents.len(), 1);
        assert_eq!(loaded.dashboard_state, json!({ "sessions": [] }));
        assert!(loaded.share_safe_mode);
    }
}
