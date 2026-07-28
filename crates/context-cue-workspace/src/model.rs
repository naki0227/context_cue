use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

pub const CURRENT_SCHEMA_VERSION: u32 = 3;

fn current_schema_version() -> u32 {
    CURRENT_SCHEMA_VERSION
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(bound(
    serialize = "Document: Serialize, Audit: Serialize",
    deserialize = "Document: Deserialize<'de>, Audit: Deserialize<'de>"
))]
pub struct PersistedWorkspace<Document, Audit> {
    #[serde(default = "current_schema_version")]
    pub schema_version: u32,
    #[serde(default)]
    pub documents: Vec<Document>,
    #[serde(default)]
    pub dashboard_state: Value,
    #[serde(default)]
    pub consent_audit: Vec<Audit>,
}

impl<Document, Audit> Default for PersistedWorkspace<Document, Audit> {
    fn default() -> Self {
        Self {
            schema_version: CURRENT_SCHEMA_VERSION,
            documents: Vec::new(),
            dashboard_state: empty_dashboard_state(),
            consent_audit: Vec::new(),
        }
    }
}

pub fn empty_dashboard_state() -> Value {
    json!({
        "sessions": [],
        "people": [],
        "projects": [],
        "reviews": [],
        "knowledgeItems": [],
        "templates": [],
    })
}
