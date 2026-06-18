use context_cue_contracts::{AppState, ImportedDocument};

use crate::{
    domain::profile_document::{OwnedProfileDocument, ProfileImportDraft, slugify_title},
    repository::profile_repository::upsert_document,
};

pub fn import_profile_documents(
    documents: &mut Vec<OwnedProfileDocument>,
    seed_documents: &[OwnedProfileDocument],
    app_state: &mut AppState,
) {
    *documents = seed_documents.to_vec();
    refresh_imported_documents(documents, app_state);
}

pub fn import_profile_documents_from_files(
    documents: &mut Vec<OwnedProfileDocument>,
    drafts: Vec<ProfileImportDraft>,
    app_state: &mut AppState,
) {
    for draft in drafts {
        let title = draft.title.trim();
        let content = draft.content.trim();

        if title.is_empty() || content.is_empty() {
            continue;
        }

        upsert_document(
            documents,
            OwnedProfileDocument {
                id: slugify_title(title),
                title: title.to_owned(),
                content: content.to_owned(),
                source_type: "ローカルファイル".to_owned(),
            },
        );
    }

    refresh_imported_documents(documents, app_state);
}

pub fn remove_profile_document(
    documents: &mut Vec<OwnedProfileDocument>,
    document_id: &str,
    app_state: &mut AppState,
) {
    documents.retain(|document| document.id != document_id);
    refresh_imported_documents(documents, app_state);
}

pub fn clear_profile_documents(
    documents: &mut Vec<OwnedProfileDocument>,
    app_state: &mut AppState,
) {
    documents.clear();
    refresh_imported_documents(documents, app_state);
}

pub fn refresh_imported_documents(
    documents: &[OwnedProfileDocument],
    app_state: &mut AppState,
) {
    app_state.imported_documents = documents
        .iter()
        .map(OwnedProfileDocument::to_imported_document)
        .collect::<Vec<ImportedDocument>>();
}
