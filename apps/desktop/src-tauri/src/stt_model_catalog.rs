use sysinfo::System;

const GIB: u64 = 1024 * 1024 * 1024;
const APPLE_SILICON_HIGH_ACCURACY_MEMORY_THRESHOLD: u64 = 8 * GIB;
const OTHER_HIGH_ACCURACY_MEMORY_THRESHOLD: u64 = 16 * GIB;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct HardwareProfile {
    pub total_memory_bytes: u64,
    pub apple_silicon: bool,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct SttModelSpec {
    pub id: &'static str,
    pub display_name: &'static str,
    pub filename: &'static str,
    pub url: &'static str,
    pub sha256: &'static str,
    pub download_bytes: u64,
}

pub const LIGHTWEIGHT_MODEL: SttModelSpec = SttModelSpec {
    id: "base-q5-1",
    display_name: "Whisper base q5_1（軽量・日本語対応）",
    filename: "ggml-base-q5_1.bin",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin",
    sha256: "422f1ae452ade6f30a004d7e5c6a43195e4433bc370bf23fac9cc591f01a8898",
    download_bytes: 59_707_625,
};

pub const HIGH_ACCURACY_MODEL: SttModelSpec = SttModelSpec {
    id: "large-v3-turbo-q5-0",
    display_name: "Whisper large-v3-turbo q5_0（高精度・日本語対応）",
    filename: "ggml-large-v3-turbo-q5_0.bin",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin",
    sha256: "394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2",
    download_bytes: 574_041_195,
};

pub fn hardware_profile() -> HardwareProfile {
    HardwareProfile {
        total_memory_bytes: System::new_all().total_memory(),
        apple_silicon: cfg!(all(target_os = "macos", target_arch = "aarch64")),
    }
}

pub const fn recommended_model(profile: HardwareProfile) -> SttModelSpec {
    let threshold = if profile.apple_silicon {
        APPLE_SILICON_HIGH_ACCURACY_MEMORY_THRESHOLD
    } else {
        OTHER_HIGH_ACCURACY_MEMORY_THRESHOLD
    };
    if profile.total_memory_bytes >= threshold {
        HIGH_ACCURACY_MODEL
    } else {
        LIGHTWEIGHT_MODEL
    }
}

pub fn selection_reason(profile: HardwareProfile, model: SttModelSpec) -> String {
    let memory_gib = profile.total_memory_bytes / GIB;
    if model == HIGH_ACCURACY_MODEL {
        let processor = if profile.apple_silicon {
            "Apple Siliconと"
        } else {
            ""
        };
        format!(
            "{processor}メモリ約{memory_gib} GBを検出したため、精度を優先したモデルを自動選択しました。"
        )
    } else {
        format!(
            "メモリ約{memory_gib} GBを検出したため、安定動作を優先した軽量モデルを自動選択しました。"
        )
    }
}

#[cfg(test)]
mod tests {
    use super::{GIB, HIGH_ACCURACY_MODEL, HardwareProfile, LIGHTWEIGHT_MODEL, recommended_model};

    #[test]
    fn recommends_high_accuracy_model_for_supported_apple_silicon() {
        assert_eq!(
            recommended_model(HardwareProfile {
                total_memory_bytes: 8 * GIB,
                apple_silicon: true,
            }),
            HIGH_ACCURACY_MODEL
        );
    }

    #[test]
    fn keeps_eight_gib_non_apple_devices_on_lightweight_model() {
        assert_eq!(
            recommended_model(HardwareProfile {
                total_memory_bytes: 8 * GIB,
                apple_silicon: false,
            }),
            LIGHTWEIGHT_MODEL
        );
    }

    #[test]
    fn recommends_high_accuracy_model_for_other_sixteen_gib_devices() {
        assert_eq!(
            recommended_model(HardwareProfile {
                total_memory_bytes: 16 * GIB,
                apple_silicon: false,
            }),
            HIGH_ACCURACY_MODEL
        );
    }

    #[test]
    fn catalog_keeps_verified_download_sizes() {
        assert_eq!(LIGHTWEIGHT_MODEL.download_bytes, 59_707_625);
        assert_eq!(HIGH_ACCURACY_MODEL.download_bytes, 574_041_195);
    }
}
