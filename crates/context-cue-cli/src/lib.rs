pub mod args;
pub mod error;
pub mod input;
pub mod model;
pub mod output;
mod record_contract;
pub mod repository;
pub mod service;
pub mod spec;

use std::path::PathBuf;

use args::{Cli, Command};
use error::CliError;
use output::success;
use repository::WorkspaceRepository;

pub fn execute(cli: Cli) -> Result<serde_json::Value, CliError> {
    match cli.command {
        Command::Spec => Ok(success(spec::markdown())),
        Command::Schema {
            resource,
            operation,
        } => Ok(success(spec::schema(resource, operation))),
        Command::Path => {
            let path = WorkspaceRepository::resolve_path(cli.data_dir, cli.demo)?;
            Ok(success(path.to_string_lossy()))
        }
        command => {
            let path = WorkspaceRepository::resolve_path(cli.data_dir, cli.demo)?;
            execute_workspace_command(path, command)
        }
    }
}

fn execute_workspace_command(
    path: PathBuf,
    command: Command,
) -> Result<serde_json::Value, CliError> {
    let repository = WorkspaceRepository::new(path);
    match command {
        Command::List { resource } => Ok(success(repository.list(resource)?)),
        Command::Get { resource, id } => Ok(success(repository.get(resource, &id)?)),
        Command::Create { resource, input } => {
            let data = input::read_json(&input)?;
            Ok(success(repository.create(resource, data)?))
        }
        Command::Update {
            resource,
            id,
            input,
        } => {
            let data = input::read_json(&input)?;
            Ok(success(repository.update(resource, &id, data)?))
        }
        Command::Delete { resource, id } => Ok(success(repository.delete(resource, &id)?)),
        Command::Path | Command::Schema { .. } | Command::Spec => {
            Err(CliError::Internal("invalid command dispatch".to_owned()))
        }
    }
}
