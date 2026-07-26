use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use uuid::Uuid;

use super::{
    PersistenceError,
    model::PersistedWorkspace,
    validation::{validate_dashboard_state, validate_schema_version, validate_size},
};

const MAX_BACKUPS: usize = 5;

pub fn read_workspace(path: &Path) -> Result<PersistedWorkspace, PersistenceError> {
    let mut file = File::open(path).map_err(PersistenceError::Read)?;
    let length = file.metadata().map_err(PersistenceError::Read)?.len();
    let length = usize::try_from(length).map_err(|_| PersistenceError::WorkspaceTooLarge {
        actual: usize::MAX,
        maximum: super::validation::MAX_WORKSPACE_BYTES,
    })?;
    validate_size(length)?;

    let mut content = String::with_capacity(length);
    file.read_to_string(&mut content)
        .map_err(PersistenceError::Read)?;
    let workspace = serde_json::from_str::<PersistedWorkspace>(&content)
        .map_err(PersistenceError::Deserialize)?;
    validate_schema_version(workspace.schema_version)?;
    validate_dashboard_state(&workspace.dashboard_state)?;
    Ok(workspace)
}

pub fn write_workspace(
    path: &Path,
    workspace: &PersistedWorkspace,
) -> Result<(), PersistenceError> {
    validate_schema_version(workspace.schema_version)?;
    validate_dashboard_state(&workspace.dashboard_state)?;
    let serialized = serde_json::to_vec_pretty(workspace).map_err(PersistenceError::Serialize)?;
    validate_size(serialized.len())?;

    let parent = path.parent().ok_or(PersistenceError::MissingParent)?;
    fs::create_dir_all(parent).map_err(PersistenceError::Write)?;
    let temp_path = parent.join(format!(".workspace-{}.tmp", Uuid::new_v4()));

    let result = write_temp_file(&temp_path, &serialized)
        .and_then(|()| replace_file(&temp_path, path))
        .and_then(|()| secure_permissions(path))
        .and_then(|()| sync_directory(parent));

    if result.is_err() {
        let _ = fs::remove_file(&temp_path);
    }
    result
}

pub fn archive_workspace(path: &Path) -> Result<Option<PathBuf>, PersistenceError> {
    if !path.exists() {
        return Ok(None);
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| PersistenceError::Clock)?
        .as_nanos();
    let backup_path = path.with_file_name(format!("workspace-state-v2.backup-{timestamp}.json"));
    fs::rename(path, &backup_path).map_err(PersistenceError::Write)?;
    secure_permissions(&backup_path)?;
    prune_backups(path)?;
    Ok(Some(backup_path))
}

pub fn recover_latest_backup(path: &Path) -> Result<Option<PersistedWorkspace>, PersistenceError> {
    for backup in backup_paths(path)? {
        if let Ok(workspace) = read_workspace(&backup) {
            write_workspace(path, &workspace)?;
            return Ok(Some(workspace));
        }
    }
    Ok(None)
}

fn write_temp_file(path: &Path, content: &[u8]) -> Result<(), PersistenceError> {
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }

    let mut file = options.open(path).map_err(PersistenceError::Write)?;
    file.write_all(content).map_err(PersistenceError::Write)?;
    file.sync_all().map_err(PersistenceError::Write)
}

#[cfg(unix)]
fn replace_file(temp_path: &Path, path: &Path) -> Result<(), PersistenceError> {
    fs::rename(temp_path, path).map_err(PersistenceError::Write)
}

#[cfg(windows)]
fn replace_file(temp_path: &Path, path: &Path) -> Result<(), PersistenceError> {
    let replaced = path.with_extension("replace-backup");
    if path.exists() {
        let _ = fs::remove_file(&replaced);
        fs::rename(path, &replaced).map_err(PersistenceError::Write)?;
    }
    if let Err(error) = fs::rename(temp_path, path) {
        let _ = fs::rename(&replaced, path);
        return Err(PersistenceError::Write(error));
    }
    let _ = fs::remove_file(replaced);
    Ok(())
}

#[cfg(unix)]
fn secure_permissions(path: &Path) -> Result<(), PersistenceError> {
    use std::os::unix::fs::PermissionsExt;

    fs::set_permissions(path, fs::Permissions::from_mode(0o600)).map_err(PersistenceError::Write)
}

#[cfg(not(unix))]
fn secure_permissions(_path: &Path) -> Result<(), PersistenceError> {
    Ok(())
}

#[cfg(unix)]
fn sync_directory(path: &Path) -> Result<(), PersistenceError> {
    File::open(path)
        .and_then(|directory| directory.sync_all())
        .map_err(PersistenceError::Write)
}

#[cfg(not(unix))]
fn sync_directory(_path: &Path) -> Result<(), PersistenceError> {
    Ok(())
}

fn prune_backups(path: &Path) -> Result<(), PersistenceError> {
    for backup in backup_paths(path)?.into_iter().skip(MAX_BACKUPS) {
        fs::remove_file(backup).map_err(PersistenceError::Write)?;
    }
    Ok(())
}

fn backup_paths(path: &Path) -> Result<Vec<PathBuf>, PersistenceError> {
    let parent = path.parent().ok_or(PersistenceError::MissingParent)?;
    let mut backups = fs::read_dir(parent)
        .map_err(PersistenceError::Read)?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|entry| {
            entry.file_name().is_some_and(|name| {
                name.to_string_lossy()
                    .starts_with("workspace-state-v2.backup-")
            })
        })
        .collect::<Vec<_>>();
    backups.sort_by(|left, right| right.file_name().cmp(&left.file_name()));
    Ok(backups)
}
