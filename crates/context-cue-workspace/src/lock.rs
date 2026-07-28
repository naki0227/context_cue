use std::{
    fs::{File, OpenOptions},
    path::{Path, PathBuf},
};

use fs2::FileExt;

use crate::PersistenceError;

pub struct WorkspaceLock {
    file: File,
    path: PathBuf,
}

impl WorkspaceLock {
    pub fn acquire(workspace_path: &Path) -> Result<Self, PersistenceError> {
        let parent = workspace_path
            .parent()
            .ok_or(PersistenceError::MissingParent)?;
        std::fs::create_dir_all(parent).map_err(PersistenceError::Write)?;
        let path = workspace_path.with_extension("lock");
        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .truncate(false)
            .write(true)
            .open(&path)
            .map_err(PersistenceError::Write)?;
        file.try_lock_exclusive()
            .map_err(|_| PersistenceError::WorkspaceInUse)?;
        Ok(Self { file, path })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for WorkspaceLock {
    fn drop(&mut self) {
        let _ = self.file.unlock();
    }
}

#[cfg(test)]
mod tests {
    use std::error::Error;

    use super::WorkspaceLock;

    #[test]
    fn a_workspace_allows_only_one_writer() -> Result<(), Box<dyn Error>> {
        let temp_dir = tempfile::tempdir()?;
        let path = temp_dir.path().join("workspace-state-v2.json");
        let first = WorkspaceLock::acquire(&path)?;
        assert!(WorkspaceLock::acquire(&path).is_err());
        drop(first);
        assert!(WorkspaceLock::acquire(&path).is_ok());
        Ok(())
    }
}
