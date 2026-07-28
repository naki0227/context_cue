use crate::domain::profile_document::OwnedProfileDocument;

use super::ConsentAuditRecord;

pub type PersistedWorkspace =
    context_cue_workspace::PersistedWorkspace<OwnedProfileDocument, ConsentAuditRecord>;

pub use context_cue_workspace::empty_dashboard_state;
