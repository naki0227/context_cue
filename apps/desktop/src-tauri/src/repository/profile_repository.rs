use std::fs;

use context_cue_core::profile_search::{ProfileDocument, score_document};

use crate::{config::profile_seed_dir, domain::profile_document::OwnedProfileDocument};

pub fn load_profile_documents() -> Vec<OwnedProfileDocument> {
    let base = profile_seed_dir();
    let mut documents = Vec::new();

    if let Ok(entries) = fs::read_dir(base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let Some(stem) = path.file_stem().and_then(|value| value.to_str()) else {
                continue;
            };
            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };
            documents.push(OwnedProfileDocument {
                id: stem.to_owned(),
                title: stem.to_owned(),
                content,
                source_type: "サンプル".to_owned(),
            });
        }
    }

    documents
}

pub fn upsert_document(documents: &mut Vec<OwnedProfileDocument>, candidate: OwnedProfileDocument) {
    documents.retain(|document| document.id != candidate.id && document.title != candidate.title);
    documents.push(candidate);
}

pub fn rank_notes(documents: &[OwnedProfileDocument], query: &str) -> Vec<String> {
    let mut ranked = documents
        .iter()
        .map(|document| {
            let borrowed = ProfileDocument {
                title: &document.title,
                content: &document.content,
            };
            (score_document(query, &borrowed), document.title.clone())
        })
        .collect::<Vec<_>>();

    ranked.sort_by(|left, right| right.0.cmp(&left.0));
    ranked
        .into_iter()
        .filter(|(score, _)| *score > 0)
        .take(3)
        .map(|(_, title)| title)
        .collect()
}
