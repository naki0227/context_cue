use std::{error::Error, fmt};

#[derive(Debug, Clone)]
pub enum AppError {
    ConsentIncomplete,
    UnknownOverlayTarget(String),
    OverlayWindowNotFound(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ConsentIncomplete => write!(f, "consent requirements are incomplete"),
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
