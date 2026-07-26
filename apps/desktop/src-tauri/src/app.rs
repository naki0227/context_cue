use std::{
    path::PathBuf,
    sync::{Arc, Mutex, MutexGuard},
    time::{SystemTime, UNIX_EPOCH},
};

use context_cue_contracts::{
    AdaptiveInferenceState, AppState, ConsentInput, ContextCue, RollingSummary, TranscriptChunk,
};
use serde_json::Value;

use crate::{
    config::persisted_state_file,
    domain::profile_document::{OwnedProfileDocument, ProfileImportDraft},
    error::AppError,
    infrastructure::persistence::{
        ConsentAuditRecord, load_workspace, restore_app_state, save_workspace_at,
    },
    repository::profile_repository::load_profile_documents,
    usecase::{
        profile_usecase::{
            clear_profile_documents, import_profile_documents, import_profile_documents_from_files,
            remove_profile_document,
        },
        session_usecase::{push_mock_chunk, start_session, stop_session, toggle_share_safe_mode},
    },
};

#[cfg(test)]
use crate::{config::LaunchMode, infrastructure::persistence::load_workspace_at};
#[cfg(test)]
use std::path::Path;

#[derive(Clone)]
pub struct SharedState {
    inner: Arc<Mutex<InnerState>>,
}

impl Default for SharedState {
    fn default() -> Self {
        let path = persisted_state_file();
        let persisted = load_workspace().unwrap_or_else(|error| {
            eprintln!("workspace initialization failed: {error}");
            Default::default()
        });
        Self::from_parts(path, persisted)
    }
}

impl SharedState {
    pub fn snapshot(&self) -> Result<AppState, AppError> {
        Ok(self.lock()?.snapshot())
    }

    pub fn start(&self, consent: ConsentInput) -> Result<(), AppError> {
        let mut state = self.lock()?;
        let confirmed_at_unix_ms = current_unix_ms()?;
        let session_id = uuid::Uuid::new_v4().to_string();
        let mut app_state = state.app_state.clone();
        let mut consent_audit = state.consent_audit.clone();

        start_session(
            &mut app_state,
            consent,
            session_id.clone(),
            confirmed_at_unix_ms,
        )?;
        consent_audit.push(ConsentAuditRecord {
            session_id,
            confirmed_at_unix_ms,
            policy_version: "consent-v1".to_owned(),
        });
        retain_latest_audits(&mut consent_audit);
        persist_workspace(
            &state,
            &state.documents,
            &state.dashboard_state,
            &consent_audit,
        )?;

        state.app_state = app_state;
        state.consent_audit = consent_audit;
        Ok(())
    }

    pub fn stop(&self) -> Result<(), AppError> {
        stop_session(&mut self.lock()?.app_state);
        Ok(())
    }

    pub fn toggle_share_safe_mode(&self) -> Result<AppState, AppError> {
        let mut state = self.lock()?;
        toggle_share_safe_mode(&mut state.app_state);
        Ok(state.snapshot())
    }

    pub fn push_mock_chunk(
        &self,
        text: &str,
    ) -> Result<
        (
            TranscriptChunk,
            RollingSummary,
            ContextCue,
            AdaptiveInferenceState,
        ),
        AppError,
    > {
        let mut state = self.lock()?;
        let documents = state.documents.clone();
        Ok(push_mock_chunk(&mut state.app_state, &documents, text))
    }

    pub fn bootstrap_profiles(&self) -> Result<(), AppError> {
        self.lock()?.seed_documents = load_profile_documents();
        Ok(())
    }

    pub fn import_profile_documents(&self) -> Result<AppState, AppError> {
        let mut state = self.lock()?;
        let mut documents = state.documents.clone();
        let mut app_state = state.app_state.clone();
        import_profile_documents(&mut documents, &state.seed_documents, &mut app_state);
        persist_workspace(
            &state,
            &documents,
            &state.dashboard_state,
            &state.consent_audit,
        )?;
        state.documents = documents;
        state.app_state = app_state;
        Ok(state.snapshot())
    }

    pub fn import_profile_documents_from_files(
        &self,
        drafts: Vec<ProfileImportDraft>,
    ) -> Result<AppState, AppError> {
        let mut state = self.lock()?;
        let mut documents = state.documents.clone();
        let mut app_state = state.app_state.clone();
        import_profile_documents_from_files(&mut documents, drafts, &mut app_state);
        persist_workspace(
            &state,
            &documents,
            &state.dashboard_state,
            &state.consent_audit,
        )?;
        state.documents = documents;
        state.app_state = app_state;
        Ok(state.snapshot())
    }

    pub fn remove_profile_document(&self, document_id: &str) -> Result<AppState, AppError> {
        let mut state = self.lock()?;
        let mut documents = state.documents.clone();
        let mut app_state = state.app_state.clone();
        remove_profile_document(&mut documents, document_id, &mut app_state);
        persist_workspace(
            &state,
            &documents,
            &state.dashboard_state,
            &state.consent_audit,
        )?;
        state.documents = documents;
        state.app_state = app_state;
        Ok(state.snapshot())
    }

    pub fn clear_profile_documents(&self) -> Result<AppState, AppError> {
        let mut state = self.lock()?;
        let mut documents = state.documents.clone();
        let mut app_state = state.app_state.clone();
        clear_profile_documents(&mut documents, &mut app_state);
        persist_workspace(
            &state,
            &documents,
            &state.dashboard_state,
            &state.consent_audit,
        )?;
        state.documents = documents;
        state.app_state = app_state;
        Ok(state.snapshot())
    }

    pub fn current_status(&self) -> Result<String, AppError> {
        Ok(self.lock()?.app_state.session.status.clone())
    }

    pub fn workspace_snapshot(&self) -> Result<Value, AppError> {
        Ok(self.lock()?.dashboard_state.clone())
    }

    pub fn save_workspace_snapshot(&self, workspace_state: Value) -> Result<Value, AppError> {
        let mut state = self.lock()?;
        persist_workspace(
            &state,
            &state.documents,
            &workspace_state,
            &state.consent_audit,
        )?;
        state.dashboard_state = workspace_state;
        Ok(state.dashboard_state.clone())
    }

    fn lock(&self) -> Result<MutexGuard<'_, InnerState>, AppError> {
        self.inner.lock().map_err(|_| AppError::StateUnavailable)
    }

    fn from_parts(
        workspace_path: PathBuf,
        persisted: crate::infrastructure::persistence::model::PersistedWorkspace,
    ) -> Self {
        Self {
            inner: Arc::new(Mutex::new(InnerState {
                app_state: restore_app_state(&persisted.documents),
                dashboard_state: persisted.dashboard_state,
                documents: persisted.documents,
                seed_documents: Vec::new(),
                consent_audit: persisted.consent_audit,
                workspace_path,
            })),
        }
    }

    #[cfg(test)]
    fn for_test(path: &Path) -> Result<Self, AppError> {
        let persisted = load_workspace_at(path, LaunchMode::Resume)?;
        Ok(Self::from_parts(path.to_path_buf(), persisted))
    }
}

struct InnerState {
    app_state: AppState,
    dashboard_state: Value,
    documents: Vec<OwnedProfileDocument>,
    seed_documents: Vec<OwnedProfileDocument>,
    consent_audit: Vec<ConsentAuditRecord>,
    workspace_path: PathBuf,
}

impl InnerState {
    fn snapshot(&self) -> AppState {
        self.app_state.clone()
    }
}

fn current_unix_ms() -> Result<u64, AppError> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| AppError::SystemClockUnavailable)?
        .as_millis()
        .try_into()
        .map_err(|_| AppError::SystemClockUnavailable)
}

fn retain_latest_audits(audits: &mut Vec<ConsentAuditRecord>) {
    if audits.len() > 1_000 {
        audits.drain(..audits.len() - 1_000);
    }
}

fn persist_workspace(
    state: &InnerState,
    documents: &[OwnedProfileDocument],
    dashboard_state: &Value,
    consent_audit: &[ConsentAuditRecord],
) -> Result<(), AppError> {
    save_workspace_at(
        &state.workspace_path,
        documents,
        dashboard_state,
        consent_audit,
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::SharedState;
    use crate::domain::profile_document::ProfileImportDraft;
    use context_cue_contracts::ConsentInput;
    use std::error::Error;

    fn test_state() -> Result<(tempfile::TempDir, SharedState), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let state = SharedState::for_test(&path)?;
        Ok((temp_dir, state))
    }

    #[test]
    fn start_requires_all_consent_checkboxes() -> Result<(), Box<dyn Error>> {
        let (_temp_dir, state) = test_state()?;
        let result = state.start(ConsentInput {
            participant_consent: true,
            no_covert_use: false,
            share_safe_understood: true,
        });
        assert!(result.is_err());
        Ok(())
    }

    #[test]
    fn imported_files_replace_same_title() -> Result<(), Box<dyn Error>> {
        let (_temp_dir, state) = test_state()?;
        let imported = state.import_profile_documents_from_files(vec![
            ProfileImportDraft {
                title: "自己紹介".to_owned(),
                content: "最初の内容".to_owned(),
            },
            ProfileImportDraft {
                title: "自己紹介".to_owned(),
                content: "更新後の内容".to_owned(),
            },
        ])?;
        assert_eq!(imported.imported_documents.len(), 1);
        assert_eq!(
            imported.imported_documents[0].source_type,
            "ローカルファイル"
        );
        Ok(())
    }
}
