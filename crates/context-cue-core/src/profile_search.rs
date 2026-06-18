#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileDocument<'a> {
    pub title: &'a str,
    pub content: &'a str,
}

pub fn score_document(query: &str, document: &ProfileDocument<'_>) -> usize {
    let mut score = 0;
    let lowercase_query = query.to_lowercase();
    let lowercase_title = document.title.to_lowercase();
    let lowercase_content = document.content.to_lowercase();

    if lowercase_title == lowercase_query {
        score += 10;
    } else if lowercase_title.contains(&lowercase_query) {
        score += 6;
    }

    score += lowercase_content.matches(&lowercase_query).count();
    score
}

#[cfg(test)]
mod tests {
    use super::{ProfileDocument, score_document};

    #[test]
    fn title_hits_score_higher_than_body_hits() {
        let strong = ProfileDocument {
            title: "API仕様メモ",
            content: "期限の相談",
        };
        let weak = ProfileDocument {
            title: "会議メモ",
            content: "API仕様 API仕様",
        };

        assert!(score_document("API仕様メモ", &strong) > score_document("API仕様メモ", &weak));
    }
}
