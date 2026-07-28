use std::{fmt, io};

#[derive(Debug)]
pub enum PersistenceError {
    Clock,
    Deserialize(serde_json::Error),
    InvalidSchema(&'static str),
    MissingParent,
    Read(io::Error),
    Serialize(serde_json::Error),
    UnsupportedSchemaVersion(u32),
    WorkspaceInUse,
    WorkspaceTooLarge { actual: usize, maximum: usize },
    Write(io::Error),
}

impl fmt::Display for PersistenceError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Clock => write!(formatter, "system clock is unavailable"),
            Self::Deserialize(_) => write!(formatter, "workspace data is corrupted"),
            Self::InvalidSchema(message) => write!(formatter, "invalid workspace: {message}"),
            Self::MissingParent => write!(formatter, "workspace directory is invalid"),
            Self::Read(_) => write!(formatter, "workspace could not be read"),
            Self::Serialize(_) => write!(formatter, "workspace could not be encoded"),
            Self::UnsupportedSchemaVersion(version) => {
                write!(formatter, "workspace version {version} is not supported")
            }
            Self::WorkspaceInUse => write!(
                formatter,
                "workspace is in use; close the desktop app and retry"
            ),
            Self::WorkspaceTooLarge { actual, maximum } => {
                write!(formatter, "workspace size {actual} exceeds limit {maximum}")
            }
            Self::Write(_) => write!(formatter, "workspace could not be saved"),
        }
    }
}

impl std::error::Error for PersistenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Deserialize(error) | Self::Serialize(error) => Some(error),
            Self::Read(error) | Self::Write(error) => Some(error),
            _ => None,
        }
    }
}
