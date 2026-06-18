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
