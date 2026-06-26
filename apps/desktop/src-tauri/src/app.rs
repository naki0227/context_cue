use std::sync::{Arc, Mutex};

use context_cue_contracts::{
    AdaptiveInferenceState, AppState, ConsentInput, ContextCue, RollingSummary, TranscriptChunk,
};
use serde_json::Value;

use crate::{
    domain::profile_document::{OwnedProfileDocument, ProfileImportDraft},
    infrastructure::persistence::{load_workspace, restore_app_state, save_workspace},
    error::AppError,
    repository::profile_repository::load_profile_documents,
    usecase::{
        profile_usecase::{
            clear_profile_documents, import_profile_documents,
            import_profile_documents_from_files, remove_profile_document,
        },
        session_usecase::{
            push_mock_chunk, start_session, stop_session, toggle_share_safe_mode,
        },
    },
};

#[derive(Clone)]
pub struct SharedState {
    inner: Arc<Mutex<InnerState>>,
}

impl Default for SharedState {
    fn default() -> Self {
        Self {
            inner: Arc::new(Mutex::new(InnerState::default())),
        }
    }
}

impl SharedState {
    pub fn snapshot(&self) -> AppState {
        self.inner.lock().expect("shared state poisoned").snapshot()
    }

    pub fn start(&self, consent: ConsentInput) -> Result<(), AppError> {
        let mut state = self.inner.lock().expect("shared state poisoned");
        start_session(&mut state.app_state, consent)
    }

    pub fn stop(&self) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        stop_session(&mut state.app_state);
    }

    pub fn toggle_share_safe_mode(&self) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        toggle_share_safe_mode(&mut state.app_state);
        persist_workspace(&state);
        state.snapshot()
    }

    pub fn push_mock_chunk(
        &self,
        text: &str,
    ) -> (
        TranscriptChunk,
        RollingSummary,
        ContextCue,
        AdaptiveInferenceState,
    ) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let documents = state.documents.clone();
        push_mock_chunk(&mut state.app_state, &documents, text)
    }

    pub fn bootstrap_profiles(&self) {
        let mut state = self.inner.lock().expect("shared state poisoned");
        state.seed_documents = load_profile_documents();
    }

    pub fn import_profile_documents(&self) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let seed_documents = state.seed_documents.clone();
        let mut documents = std::mem::take(&mut state.documents);
        import_profile_documents(&mut documents, &seed_documents, &mut state.app_state);
        state.documents = documents;
        persist_workspace(&state);
        state.snapshot()
    }

    pub fn import_profile_documents_from_files(&self, drafts: Vec<ProfileImportDraft>) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let mut documents = std::mem::take(&mut state.documents);
        import_profile_documents_from_files(&mut documents, drafts, &mut state.app_state);
        state.documents = documents;
        persist_workspace(&state);
        state.snapshot()
    }

    pub fn remove_profile_document(&self, document_id: &str) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let mut documents = std::mem::take(&mut state.documents);
        remove_profile_document(&mut documents, document_id, &mut state.app_state);
        state.documents = documents;
        persist_workspace(&state);
        state.snapshot()
    }

    pub fn clear_profile_documents(&self) -> AppState {
        let mut state = self.inner.lock().expect("shared state poisoned");
        let mut documents = std::mem::take(&mut state.documents);
        clear_profile_documents(&mut documents, &mut state.app_state);
        state.documents = documents;
        persist_workspace(&state);
        state.snapshot()
    }

    pub fn current_status(&self) -> String {
        self.inner
            .lock()
            .expect("shared state poisoned")
            .app_state
            .session
            .status
            .clone()
    }

    pub fn workspace_snapshot(&self) -> Value {
        self.inner
            .lock()
            .expect("shared state poisoned")
            .dashboard_state
            .clone()
    }

    pub fn save_workspace_snapshot(&self, workspace_state: Value) -> Value {
        let mut state = self.inner.lock().expect("shared state poisoned");
        state.dashboard_state = workspace_state;
        persist_workspace(&state);
        state.dashboard_state.clone()
    }
}

struct InnerState {
    app_state: AppState,
    dashboard_state: Value,
    documents: Vec<OwnedProfileDocument>,
    seed_documents: Vec<OwnedProfileDocument>,
}

impl Default for InnerState {
    fn default() -> Self {
        let persisted = load_workspace();

        Self {
            app_state: restore_app_state(&persisted.documents, persisted.share_safe_mode),
            dashboard_state: persisted.dashboard_state,
            documents: persisted.documents,
            seed_documents: Vec::new(),
        }
    }
}

impl InnerState {
    fn snapshot(&self) -> AppState {
        self.app_state.clone()
    }
}

fn persist_workspace(state: &InnerState) {
    save_workspace(
        &state.documents,
        &state.dashboard_state,
        state.app_state.session.share_safe_mode,
    );
}

#[cfg(test)]
mod tests {
    use super::SharedState;
    use crate::domain::profile_document::ProfileImportDraft;
    use context_cue_contracts::ConsentInput;

    #[test]
    fn start_requires_all_consent_checkboxes() {
        let state = SharedState::default();
        let result = state.start(ConsentInput {
            participant_consent: true,
            no_covert_use: false,
            share_safe_understood: true,
        });

        assert!(result.is_err());
    }

    #[test]
    fn question_chunk_enters_deep_mode() {
        let state = SharedState::default();
        let (_, _, _, adaptive) = state.push_mock_chunk("この変更は今回のリリース対象ですか？");
        assert_eq!(adaptive.mode, "deep");
        assert!(adaptive.question_score >= 0.36);
    }

    #[test]
    fn imported_documents_can_be_added_and_removed() {
        let state = SharedState::default();
        state.bootstrap_profiles();

        let imported = state.import_profile_documents();
        assert_eq!(imported.imported_documents.len(), 5);

        let removed = state.remove_profile_document("values");
        assert_eq!(removed.imported_documents.len(), 4);

        let cleared = state.clear_profile_documents();
        assert!(cleared.imported_documents.is_empty());
    }

    #[test]
    fn imported_files_replace_same_title_and_keep_local_source_type() {
        let state = SharedState::default();

        let imported = state.import_profile_documents_from_files(vec![
            ProfileImportDraft {
                title: "自己紹介".to_owned(),
                content: "最初の内容".to_owned(),
            },
            ProfileImportDraft {
                title: "自己紹介".to_owned(),
                content: "更新後の内容".to_owned(),
            },
        ]);

        assert_eq!(imported.imported_documents.len(), 1);
        assert_eq!(imported.imported_documents[0].title, "自己紹介");
        assert_eq!(imported.imported_documents[0].source_type, "ローカルファイル");
    }
}
