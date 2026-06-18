pub fn question_score(text: &str) -> f32 {
    let normalized = text.trim().to_lowercase();
    let mut score = 0.0_f32;

    let markers = [
        "ですか",
        "ますか",
        "どう",
        "なぜ",
        "いつ",
        "どれ",
        "できますか",
        "確認",
        "お願い",
        "？",
        "?",
    ];

    for marker in markers {
        if normalized.contains(marker) {
            score += 0.18;
        }
    }

    score.clamp(0.0, 1.0)
}

pub fn classify_intent(text: &str) -> &'static str {
    let score = question_score(text);

    if score >= 0.36 {
        "question"
    } else if text.contains("確認") {
        "confirmation"
    } else if text.contains("お願い") || text.contains("頼み") {
        "request"
    } else {
        "discussion"
    }
}

#[cfg(test)]
mod tests {
    use super::{classify_intent, question_score};

    #[test]
    fn question_detector_scores_question_high() {
        let score = question_score("この変更は今回のリリース対象ですか？");
        assert!(score >= 0.36);
        assert_eq!(
            classify_intent("この変更は今回のリリース対象ですか？"),
            "question"
        );
    }

    #[test]
    fn question_detector_keeps_plain_statement_low() {
        let score = question_score("前回の決定事項を共有します");
        assert!(score < 0.36);
    }
}
