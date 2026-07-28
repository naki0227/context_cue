use serde_json::{Value, json};

use crate::{
    args::{Resource, SchemaOperation},
    record_contract::{apply_defaults_to_schema, remove_id},
};

const SPEC: &str = include_str!("../../../docs/SPEC.md");
const SCHEMA: &str = include_str!("../../../docs/schemas/agent-cli.schema.json");
const SPEC_VERSION: &str = "1.0.0-draft";

pub const fn markdown() -> &'static str {
    SPEC
}

pub fn schema(resource: Option<Resource>, operation: SchemaOperation) -> Value {
    let root = serde_json::from_str::<Value>(SCHEMA).unwrap_or_else(|_| {
        json!({
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "error": "embedded schema is invalid"
        })
    });
    let Some(resource) = resource else {
        return root;
    };
    let name = definition_name(resource);
    let mut record = root
        .get("$defs")
        .and_then(|definitions| definitions.get(name))
        .cloned()
        .unwrap_or_else(|| json!({"error": "resource schema is unavailable"}));
    add_schema_context(&mut record, &root, resource, operation);
    match operation {
        SchemaOperation::Record => record,
        SchemaOperation::Create => create_schema(record, resource),
        SchemaOperation::Update => update_schema(record),
        SchemaOperation::Response => response_schema(record),
        SchemaOperation::ListResponse => list_response_schema(record),
    }
}

fn definition_name(resource: Resource) -> &'static str {
    match resource {
        Resource::Sessions => "session",
        Resource::People => "person",
        Resource::Projects => "project",
        Resource::Reviews => "review",
        Resource::Knowledge => "knowledge",
        Resource::Templates => "template",
    }
}

fn add_schema_context(
    schema: &mut Value,
    root: &Value,
    resource: Resource,
    operation: SchemaOperation,
) {
    let Some(object) = schema.as_object_mut() else {
        return;
    };
    object.insert(
        "$schema".to_owned(),
        Value::String("https://json-schema.org/draft/2020-12/schema".to_owned()),
    );
    object.insert("$defs".to_owned(), related_definitions(root, resource));
    object.insert(
        "title".to_owned(),
        Value::String(format!(
            "How to Talk {} {operation:?} schema",
            resource.key()
        )),
    );
    object.insert(
        "x-cli-version".to_owned(),
        Value::String(env!("CARGO_PKG_VERSION").to_owned()),
    );
    object.insert(
        "x-spec-version".to_owned(),
        Value::String(SPEC_VERSION.to_owned()),
    );
}

fn related_definitions(root: &Value, resource: Resource) -> Value {
    let names: &[&str] = match resource {
        Resource::People => &["personHistory"],
        Resource::Projects => &["projectAction", "projectLinkedSession"],
        Resource::Reviews => &["reviewAction"],
        Resource::Sessions | Resource::Knowledge | Resource::Templates => &[],
    };
    let definitions = root.get("$defs").and_then(Value::as_object);
    Value::Object(
        names
            .iter()
            .filter_map(|name| {
                definitions
                    .and_then(|items| items.get(*name))
                    .cloned()
                    .map(|schema| ((*name).to_owned(), schema))
            })
            .collect(),
    )
}

fn create_schema(mut schema: Value, resource: Resource) -> Value {
    remove_id(&mut schema);
    if let Some(object) = schema.as_object_mut() {
        object.remove("required");
        object.insert(
            "description".to_owned(),
            Value::String(
                "createの入力。すべて省略可能で、defaultが省略時に適用されます。idはCLIが生成します。"
                    .to_owned(),
            ),
        );
    }
    apply_defaults_to_schema(&mut schema, resource);
    schema
}

fn update_schema(mut schema: Value) -> Value {
    remove_id(&mut schema);
    if let Some(object) = schema.as_object_mut() {
        object.remove("required");
        object.insert("minProperties".to_owned(), Value::from(1));
        object.insert(
            "description".to_owned(),
            Value::String(
                "updateのトップレベル部分更新入力。idは指定不可で、配列とオブジェクトは項目単位で置換します。"
                    .to_owned(),
            ),
        );
    }
    schema
}

fn response_schema(record: Value) -> Value {
    response_envelope(
        record,
        "How to Talk item response",
        "get/create/update/deleteのレスポンス。deleteのdataは削除された完全なレコードです。",
    )
}

fn list_response_schema(record: Value) -> Value {
    response_envelope(
        json!({"type": "array", "items": record}),
        "How to Talk list response",
        "listのレスポンス。dataは0件以上の完全なレコード配列です。",
    )
}

fn response_envelope(data: Value, title: &str, description: &str) -> Value {
    let metadata = response_metadata(title, description);
    let mut schema = json!({
        "oneOf": [
            {
                "type": "object",
                "additionalProperties": false,
                "required": ["ok", "data"],
                "properties": {
                    "ok": {"const": true},
                    "data": data
                }
            },
            {
                "type": "object",
                "additionalProperties": false,
                "required": ["ok", "error"],
                "properties": {
                    "ok": {"const": false},
                    "error": {
                        "type": "object",
                        "additionalProperties": false,
                        "required": ["code", "message"],
                        "properties": {
                            "code": {
                                "type": "string",
                                "enum": [
                                    "invalid_input",
                                    "not_found",
                                    "workspace_in_use",
                                    "io_error",
                                    "persistence_error",
                                    "internal_error"
                                ]
                            },
                            "message": {"type": "string"}
                        }
                    }
                }
            }
        ]
    });
    if let (Some(target), Some(source)) = (schema.as_object_mut(), metadata.as_object()) {
        target.extend(source.clone());
    }
    schema
}

fn response_metadata(title: &str, description: &str) -> Value {
    json!({
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": title,
        "description": description,
        "x-cli-version": env!("CARGO_PKG_VERSION"),
        "x-spec-version": SPEC_VERSION,
        "x-error-exit-codes": {
            "invalid_input": 2,
            "not_found": 3,
            "workspace_in_use": 3,
            "io_error": 1,
            "persistence_error": 1,
            "internal_error": 1
        }
    })
}

#[cfg(test)]
mod tests {
    use super::schema;
    use crate::args::{Resource, SchemaOperation};

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
                schema(Some(resource), SchemaOperation::Record)["type"],
                "object",
                "{resource:?} schema missing"
            );
        }
    }

    #[test]
    fn create_schema_excludes_id_and_exposes_defaults() {
        let schema = schema(Some(Resource::Knowledge), SchemaOperation::Create);
        assert!(schema.get("required").is_none());
        assert!(schema["properties"].get("id").is_none());
        assert_eq!(schema["properties"]["title"]["default"], "新しいナレッジ");
        assert_eq!(schema["x-cli-version"], env!("CARGO_PKG_VERSION"));
    }

    #[test]
    fn update_schema_requires_a_non_id_property() {
        let schema = schema(Some(Resource::People), SchemaOperation::Update);
        assert_eq!(schema["minProperties"], 1);
        assert!(schema["properties"].get("id").is_none());
        assert!(schema.get("required").is_none());
    }

    #[test]
    fn response_schema_covers_success_and_error_envelopes() {
        let schema = schema(Some(Resource::Templates), SchemaOperation::Response);
        assert_eq!(schema["oneOf"].as_array().map(Vec::len), Some(2));
        assert_eq!(schema["oneOf"][0]["properties"]["ok"]["const"], true);
        assert_eq!(schema["oneOf"][1]["properties"]["ok"]["const"], false);
        assert_eq!(
            schema["oneOf"][1]["properties"]["error"]["properties"]["code"]["enum"]
                .as_array()
                .map(Vec::len),
            Some(6)
        );
    }

    #[test]
    fn list_response_schema_returns_an_array() {
        let schema = schema(Some(Resource::Sessions), SchemaOperation::ListResponse);
        assert_eq!(schema["oneOf"][0]["properties"]["data"]["type"], "array");
        assert_eq!(schema["x-error-exit-codes"]["not_found"], 3);
    }
}
