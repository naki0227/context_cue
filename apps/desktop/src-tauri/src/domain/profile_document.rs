use context_cue_contracts::ImportedDocument;
use uuid::Uuid;

#[derive(Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileImportDraft {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnedProfileDocument {
    pub id: String,
    pub title: String,
    pub content: String,
    pub source_type: String,
}

impl OwnedProfileDocument {
    pub fn to_imported_document(&self) -> ImportedDocument {
        ImportedDocument {
            id: self.id.clone(),
            title: self.title.clone(),
            source_type: self.source_type.clone(),
        }
    }
}

pub fn slugify_title(title: &str) -> String {
    let mut slug = String::new();

    for character in title.chars() {
        if character.is_ascii_alphanumeric() {
            slug.push(character.to_ascii_lowercase());
        } else if (character.is_whitespace() || character == '-' || character == '_')
            && !slug.ends_with('-')
        {
            slug.push('-');
        }
    }

    let slug = slug.trim_matches('-').to_owned();
    if slug.is_empty() {
        Uuid::new_v4().to_string()
    } else {
        slug
    }
}
