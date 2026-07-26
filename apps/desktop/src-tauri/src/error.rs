use std::{error::Error, fmt};

use crate::infrastructure::persistence::PersistenceError;

#[derive(Debug)]
pub enum AppError {
    ConsentIncomplete,
    InvalidExportPath,
    Persistence(PersistenceError),
    StateUnavailable,
    SystemClockUnavailable,
    UnknownOverlayTarget(String),
    OverlayWindowNotFound(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ConsentIncomplete => write!(f, "consent requirements are incomplete"),
            Self::InvalidExportPath => write!(f, "export destination must be an absolute path"),
            Self::Persistence(error) => error.fmt(f),
            Self::StateUnavailable => write!(f, "application state is temporarily unavailable"),
            Self::SystemClockUnavailable => write!(f, "system clock is unavailable"),
            Self::UnknownOverlayTarget(target) => {
                write!(f, "unknown overlay target: {target}")
            }
            Self::OverlayWindowNotFound(label) => {
                write!(f, "overlay window not found: {label}")
            }
        }
    }
}

impl Error for AppError {}

impl From<PersistenceError> for AppError {
    fn from(error: PersistenceError) -> Self {
        Self::Persistence(error)
    }
}
