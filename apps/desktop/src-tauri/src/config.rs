use std::path::PathBuf;

pub fn profile_seed_dir() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("..");
    path.push("..");
    path.push("..");
    path.push("profiles");
    path.push("sample");
    path
}

pub fn app_data_dir() -> PathBuf {
    if let Some(path) = std::env::var_os("CONTEXT_CUE_DATA_DIR") {
        return PathBuf::from(path);
    }

    let mut path = dirs::data_local_dir().unwrap_or_else(std::env::temp_dir);
    path.push("how-to-talk");
    path
}

pub fn persisted_state_file() -> PathBuf {
    let mut path = app_data_dir();
    path.push("workspace-state.json");
    path
}
