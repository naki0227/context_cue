import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const releaseRepositoryRoot = join(root, 'distribution', 'release-repository');

function commandLines(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && entry.name === '.git') return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function privateSourceMarkers() {
  const markers = new Set([
    basename(root),
    ...commandLines('git', ['log', '--all', '--format=%an%n%ae']),
  ]);

  for (const remote of commandLines('git', ['remote', '-v'])) {
    const url = remote.split(/\s+/)[1];
    if (!url) continue;
    markers.add(url);
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/i);
    if (match) {
      markers.add(match[1]);
      markers.add(match[2]);
    }
  }

  return [...markers].filter((marker) => marker.length >= 4);
}

export function auditReleaseRepository({
  directory = releaseRepositoryRoot,
  markers = privateSourceMarkers(),
  reportRoot = root,
} = {}) {
  const findings = [];
  const genericPatterns = [
    {
      code: 'absolute-home-path',
      pattern: /(?:\/Users\/|\/home\/|[A-Z]:\\Users\\)/i,
    },
    {
      code: 'email-address',
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    },
    { code: 'commit-sha', pattern: /\b[0-9a-f]{40}\b/i },
  ];

  for (const file of filesUnder(directory)) {
    if (!statSync(file).isFile()) continue;
    const content = readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      for (const marker of markers) {
        if (line.toLocaleLowerCase().includes(marker.toLocaleLowerCase())) {
          findings.push({
            code: 'private-source-reference',
            file: relative(reportRoot, file),
            line: index + 1,
          });
          break;
        }
      }

      for (const { code, pattern } of genericPatterns) {
        if (pattern.test(line)) {
          findings.push({
            code,
            file: relative(reportRoot, file),
            line: index + 1,
          });
        }
      }
    }
  }

  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const findings = auditReleaseRepository();
  if (findings.length > 0) {
    console.error('Release repository audit failed.');
    for (const finding of findings) {
      console.error(`${finding.file}:${finding.line} [${finding.code}]`);
    }
    process.exitCode = 1;
  } else {
    console.log('Release repository audit passed.');
  }
}
