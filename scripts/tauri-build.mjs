import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const FLAG_SEPARATOR = '\u001f';

export function encodedRustFlags(
  existing,
  workspaceRoot,
  cargoHome = resolve(homedir(), '.cargo'),
) {
  const remaps = [
    `--remap-path-prefix=${workspaceRoot}=.`,
    `--remap-path-prefix=${cargoHome}=.cargo`,
  ].join(FLAG_SEPARATOR);
  return existing ? `${existing}${FLAG_SEPARATOR}${remaps}` : remaps;
}

export function compilerPathFlags(existing, workspaceRoot) {
  const remap = `-ffile-prefix-map=${workspaceRoot}=.`;
  return existing ? `${existing} ${remap}` : remap;
}

function run() {
  const compilerFlags =
    process.platform === 'win32'
      ? {}
      : {
          CFLAGS: compilerPathFlags(process.env.CFLAGS, process.cwd()),
          CMAKE_C_FLAGS: compilerPathFlags(
            process.env.CMAKE_C_FLAGS,
            process.cwd(),
          ),
          CMAKE_CXX_FLAGS: compilerPathFlags(
            process.env.CMAKE_CXX_FLAGS,
            process.cwd(),
          ),
          CXXFLAGS: compilerPathFlags(process.env.CXXFLAGS, process.cwd()),
        };
  const result = spawnSync(
    'corepack',
    ['pnpm', '--filter', 'desktop', 'tauri', 'build'],
    {
      env: {
        ...process.env,
        ...compilerFlags,
        CARGO_ENCODED_RUSTFLAGS: encodedRustFlags(
          process.env.CARGO_ENCODED_RUSTFLAGS,
          process.cwd(),
        ),
      },
      stdio: 'inherit',
    },
  );

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
