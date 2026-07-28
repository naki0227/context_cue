import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function workspaceVersion(cargoToml) {
  const match = cargoToml.match(
    /\[workspace\.package\][\s\S]*?^version\s*=\s*"([^"]+)"/mu,
  );
  if (!match) {
    throw new Error('Cargo workspace version is missing');
  }
  return match[1];
}

export function validateReleaseMetadata(metadata, tag) {
  const versions = new Set([
    metadata.rootVersion,
    metadata.desktopVersion,
    metadata.tauriVersion,
    metadata.rustVersion,
  ]);
  const errors = [];

  if (versions.size !== 1) {
    errors.push(`version mismatch: ${[...versions].sort().join(', ')}`);
  }

  if (metadata.packageManager !== 'pnpm@11.17.0') {
    errors.push(`unexpected package manager: ${metadata.packageManager}`);
  }

  const [version] = versions;
  if (tag && tag !== `v${version}`) {
    errors.push(`tag ${tag} does not match version v${version}`);
  }

  return errors;
}

export function readReleaseMetadata(root) {
  const rootPackage = readJson(resolve(root, 'package.json'));
  const desktopPackage = readJson(resolve(root, 'apps/desktop/package.json'));
  const tauriConfig = readJson(
    resolve(root, 'apps/desktop/src-tauri/tauri.conf.json'),
  );
  const cargoToml = readFileSync(resolve(root, 'Cargo.toml'), 'utf8');

  return {
    desktopVersion: desktopPackage.version,
    packageManager: rootPackage.packageManager,
    rootVersion: rootPackage.version,
    rustVersion: workspaceVersion(cargoToml),
    tauriVersion: tauriConfig.version,
  };
}

function tagArgument(args) {
  const index = args.indexOf('--tag');
  return index === -1 ? undefined : args[index + 1];
}

function run() {
  const metadata = readReleaseMetadata(process.cwd());
  const errors = validateReleaseMetadata(
    metadata,
    tagArgument(process.argv.slice(2)),
  );

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`Release preflight failed: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Release preflight passed for v${metadata.rootVersion}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
