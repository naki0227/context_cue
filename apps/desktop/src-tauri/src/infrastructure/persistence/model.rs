use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::domain::profile_document::OwnedProfileDocument;

pub const CURRENT_SCHEMA_VERSION: u32 = 3;

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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedWorkspace {
    #[serde(default = "current_schema_version")]
    pub schema_version: u32,
    #[serde(default)]
    pub documents: Vec<OwnedProfileDocument>,
    #[serde(default)]
    pub dashboard_state: Value,
    #[serde(default)]
    pub consent_audit: Vec<ConsentAuditRecord>,
}

impl Default for PersistedWorkspace {
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
