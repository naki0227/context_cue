use std::cmp::Reverse;

use context_cue_core::profile_search::{ProfileDocument, score_document};

use crate::domain::profile_document::OwnedProfileDocument;

const PROFILE_SEEDS: [(&str, &str); 5] = [
    (
        "experiences",
        include_str!("../../../../../profiles/sample/experiences.md"),
    ),
    (
        "meetings",
        include_str!("../../../../../profiles/sample/meetings.md"),
    ),
    (
        "projects",
        include_str!("../../../../../profiles/sample/projects.md"),
    ),
    (
        "todos",
        include_str!("../../../../../profiles/sample/todos.md"),
    ),
    (
        "values",
        include_str!("../../../../../profiles/sample/values.md"),
    ),
];

pub fn load_profile_documents() -> Vec<OwnedProfileDocument> {
    PROFILE_SEEDS
        .into_iter()
        .map(|(title, content)| OwnedProfileDocument {
            id: title.to_owned(),
            title: title.to_owned(),
            content: content.to_owned(),
            source_type: "サンプル".to_owned(),
        })
        .collect()
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

    ranked.sort_by_key(|entry| Reverse(entry.0));
    ranked
        .into_iter()
        .filter(|(score, _)| *score > 0)
        .take(3)
        .map(|(_, title)| title)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::load_profile_documents;

    #[test]
    fn profile_seeds_are_embedded_for_release_builds() {
        let documents = load_profile_documents();

        assert_eq!(documents.len(), 5);
        assert!(
            documents
                .iter()
                .all(|document| !document.content.is_empty())
        );
    }
}
