use std::{fmt, io, path::PathBuf};

#[derive(Debug)]
pub enum CliError {
    Conflict(String),
    Input(String),
    Internal(String),
    Io { path: PathBuf, source: io::Error },
    NotFound { resource: &'static str, id: String },
    Persistence(context_cue_workspace::PersistenceError),
}

impl CliError {
    pub const fn code(&self) -> &'static str {
        match self {
            Self::Conflict(_) => "workspace_in_use",
            Self::Input(_) => "invalid_input",
            Self::Internal(_) => "internal_error",
            Self::Io { .. } => "io_error",
            Self::NotFound { .. } => "not_found",
            Self::Persistence(context_cue_workspace::PersistenceError::WorkspaceInUse) => {
                "workspace_in_use"
            }
            Self::Persistence(_) => "persistence_error",
        }
    }

    pub const fn exit_code(&self) -> i32 {
        match self {
            Self::Input(_) => 2,
            Self::Conflict(_)
            | Self::NotFound { .. }
            | Self::Persistence(context_cue_workspace::PersistenceError::WorkspaceInUse) => 3,
            Self::Internal(_) | Self::Io { .. } | Self::Persistence(_) => 1,
        }
    }
}

impl fmt::Display for CliError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Conflict(message) | Self::Input(message) | Self::Internal(message) => {
                write!(formatter, "{message}")
            }
            Self::Io { path, .. } => write!(formatter, "could not read {}", path.display()),
            Self::NotFound { resource, id } => {
                write!(formatter, "{resource} item '{id}' was not found")
            }
            Self::Persistence(error) => error.fmt(formatter),
        }
    }
}

impl std::error::Error for CliError {}

impl From<context_cue_workspace::PersistenceError> for CliError {
    fn from(error: context_cue_workspace::PersistenceError) -> Self {
        Self::Persistence(error)
    }
}
