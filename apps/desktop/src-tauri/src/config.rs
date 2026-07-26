use std::path::PathBuf;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum LaunchMode {
    Demo,
    User,
}

pub fn launch_mode() -> LaunchMode {
    parse_launch_mode(std::env::var("CONTEXT_CUE_LAUNCH_MODE").ok().as_deref())
}

fn parse_launch_mode(value: Option<&str>) -> LaunchMode {
    match value {
        Some("demo") => LaunchMode::Demo,
        _ => LaunchMode::User,
    }
}

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
    path.push(match launch_mode() {
        LaunchMode::Demo => "how-to-talk-demo",
        LaunchMode::User => "how-to-talk",
    });
    path
}

pub fn persisted_state_file() -> PathBuf {
    let mut path = app_data_dir();
    path.push("workspace-state-v2.json");
    path
}

#[cfg(test)]
mod tests {
    use super::{LaunchMode, parse_launch_mode};

    #[test]
    fn unknown_launch_mode_uses_user_storage() {
        assert_eq!(parse_launch_mode(None), LaunchMode::User);
        assert_eq!(parse_launch_mode(Some("unexpected")), LaunchMode::User);
    }

    #[test]
    fn demo_launch_mode_is_explicit() {
        assert_eq!(parse_launch_mode(Some("demo")), LaunchMode::Demo);
    }
}
