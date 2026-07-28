use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkspaceState {
    #[serde(default)]
    pub sessions: Vec<SessionRecord>,
    #[serde(default)]
    pub people: Vec<PersonRecord>,
    #[serde(default)]
    pub projects: Vec<ProjectRecord>,
    #[serde(default)]
    pub reviews: Vec<ReviewRecord>,
    #[serde(default)]
    pub knowledge_items: Vec<KnowledgeRecord>,
    #[serde(default)]
    pub templates: Vec<TemplateRecord>,
    #[serde(default)]
    pub template_library_version: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SessionRecord {
    pub date_label: String,
    pub duration_minutes: u32,
    pub id: String,
    pub location: String,
    pub memo: String,
    pub partner: String,
    pub people_ids: Vec<String>,
    pub platform: String,
    pub project_ids: Vec<String>,
    pub recording: String,
    pub recording_tone: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub review_id: Option<String>,
    pub start_at: String,
    pub status: String,
    pub status_tone: String,
    pub title: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub type_tone: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PersonHistoryRecord {
    pub date: String,
    pub duration: String,
    pub id: String,
    pub title: String,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PersonRecord {
    pub checks: Vec<String>,
    pub history: Vec<PersonHistoryRecord>,
    pub id: String,
    pub last_contact_label: String,
    pub mail: String,
    pub memo: Vec<String>,
    pub name: String,
    pub profile: Vec<String>,
    pub role: String,
    pub short_role: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProjectLinkedSession {
    pub date: String,
    pub id: String,
    pub title: String,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProjectAction {
    pub due_date: String,
    pub id: String,
    pub priority: String,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProjectRecord {
    pub actions: Vec<ProjectAction>,
    pub category: String,
    pub connections: Vec<String>,
    pub icon: String,
    pub id: String,
    pub issues: u32,
    pub linked_sessions: Vec<ProjectLinkedSession>,
    pub overview: String,
    pub points: Vec<String>,
    pub progress: u8,
    pub sessions: u32,
    pub status_label: String,
    pub subtitle: String,
    pub title: String,
    pub tone: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewAction {
    pub date: String,
    pub id: String,
    pub owner: String,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReviewRecord {
    pub actions: Vec<ReviewAction>,
    pub date: String,
    pub id: String,
    pub improvements: Vec<String>,
    pub insights: Vec<String>,
    pub memo: Vec<String>,
    pub meta: String,
    pub summary: Vec<String>,
    pub title: String,
    pub transcript: Vec<String>,
    #[serde(rename = "type")]
    pub kind: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct KnowledgeRecord {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avatar_data_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub confidence: Option<String>,
    pub content: Vec<String>,
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sensitivity: Option<String>,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_document_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_label: Option<String>,
    pub tag: String,
    pub title: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct TemplateRecord {
    pub body: Vec<String>,
    pub description: String,
    pub icon: String,
    pub id: String,
    pub tag: String,
    pub title: String,
    pub tone: String,
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::WorkspaceState;

    #[test]
    fn rejects_unknown_entity_fields() {
        let value = json!({
            "sessions": [{
                "id": "session-1",
                "unexpected": true
            }],
            "people": [],
            "projects": [],
            "reviews": [],
            "knowledgeItems": [],
            "templates": []
        });
        assert!(serde_json::from_value::<WorkspaceState>(value).is_err());
    }
}
