use serde_json::{Value, json};

use crate::args::Resource;

const SPEC: &str = include_str!("../../../docs/SPEC.md");
const SCHEMA: &str = include_str!("../../../docs/schemas/agent-cli.schema.json");

pub const fn markdown() -> &'static str {
    SPEC
}

pub fn schema(resource: Option<Resource>) -> Value {
    let root = serde_json::from_str::<Value>(SCHEMA).unwrap_or_else(|_| {
        json!({
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "error": "embedded schema is invalid"
        })
    });
    let Some(resource) = resource else {
        return root;
    };
    let name = match resource {
        Resource::Sessions => "session",
        Resource::People => "person",
        Resource::Projects => "project",
        Resource::Reviews => "review",
        Resource::Knowledge => "knowledge",
        Resource::Templates => "template",
    };
    root.get("$defs")
        .and_then(|definitions| definitions.get(name))
        .cloned()
        .unwrap_or_else(|| json!({"error": "resource schema is unavailable"}))
}

#[cfg(test)]
mod tests {
    use super::schema;
    use crate::args::Resource;

    #[test]
    fn embedded_schema_contains_every_resource() {
        for resource in [
            Resource::Sessions,
            Resource::People,
            Resource::Projects,
            Resource::Reviews,
            Resource::Knowledge,
            Resource::Templates,
        ] {
            assert_eq!(
                schema(Some(resource))["type"],
                "object",
                "{resource:?} schema missing"
            );
        }
    }
}
