use clap::Parser;
use context_cue_cli::{args::Cli, execute, output};

fn main() {
    let result = execute(Cli::parse());
    match result {
        Ok(value) => {
            println!("{}", output::format(&value));
        }
        Err(error) => {
            eprintln!("{}", output::format_error(&error));
            std::process::exit(error.exit_code());
        }
    }
}
