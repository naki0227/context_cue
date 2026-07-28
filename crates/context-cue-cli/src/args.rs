use std::path::PathBuf;

use clap::{Args, Parser, Subcommand, ValueEnum};

#[derive(Debug, Parser)]
#[command(
    name = "how-to-talk",
    about = "How to Talkのローカルデータを安全に操作します",
    version
)]
pub struct Cli {
    #[arg(long, global = true, value_name = "DIR")]
    pub data_dir: Option<PathBuf>,
    #[arg(long, global = true, conflicts_with = "data_dir")]
    pub demo: bool,
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// AIエージェント連携の正式SPECを表示します
    Spec,
    /// リソースのJSON Schemaを表示します
    Schema {
        #[arg(value_enum)]
        resource: Option<Resource>,
        /// 用途別のSchemaを表示します（resource指定時のみ）
        #[arg(long, value_enum, requires = "resource", default_value = "record")]
        operation: SchemaOperation,
    },
    /// 使用するworkspaceファイルの絶対パスを表示します
    Path,
    /// 一覧をJSONで取得します
    List { resource: Resource },
    /// IDを指定して1件取得します
    Get { resource: Resource, id: String },
    /// JSONから1件追加します
    Create {
        resource: Resource,
        #[command(flatten)]
        input: JsonInput,
    },
    /// JSONの部分更新を適用します
    Update {
        resource: Resource,
        id: String,
        #[command(flatten)]
        input: JsonInput,
    },
    /// IDを指定して1件削除します
    Delete { resource: Resource, id: String },
}

#[derive(Debug, Clone, Args)]
#[group(required = true, multiple = false)]
pub struct JsonInput {
    /// JSON文字列。`-`を指定するとstdinから読みます
    #[arg(long, value_name = "JSON|-")]
    pub data: Option<String>,
    /// JSONファイルから読みます
    #[arg(long, value_name = "FILE")]
    pub file: Option<PathBuf>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, ValueEnum)]
pub enum Resource {
    Sessions,
    People,
    Projects,
    Reviews,
    Knowledge,
    Templates,
}

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, ValueEnum)]
pub enum SchemaOperation {
    #[default]
    Record,
    Create,
    Update,
    /// get/create/update/deleteのレスポンス
    Response,
    /// listの配列レスポンス
    ListResponse,
}

impl Resource {
    pub const fn key(self) -> &'static str {
        match self {
            Self::Sessions => "sessions",
            Self::People => "people",
            Self::Projects => "projects",
            Self::Reviews => "reviews",
            Self::Knowledge => "knowledgeItems",
            Self::Templates => "templates",
        }
    }

    pub const fn id_prefix(self) -> &'static str {
        match self {
            Self::Sessions => "session",
            Self::People => "person",
            Self::Projects => "project",
            Self::Reviews => "review",
            Self::Knowledge => "knowledge",
            Self::Templates => "template",
        }
    }
}
