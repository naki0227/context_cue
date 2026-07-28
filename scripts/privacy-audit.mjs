import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/gu;

const CONTENT_RULES = [
  {
    code: 'absolute-home-path',
    pattern:
      /(?:\/Users\/[^/\s]+|\/home\/[^/\s]+|[A-Za-z]:\\Users\\[^\\\s]+)/gu,
  },
  {
    code: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gu,
  },
  {
    code: 'github-token',
    pattern: /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/gu,
  },
  {
    code: 'cloud-api-key',
    pattern:
      /(?:AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9_-]{20,})/gu,
  },
  {
    code: 'phone-number',
    pattern: /(?:\+81[- ]?|0)\d{1,4}[- ]\d{1,4}[- ]\d{3,4}/gu,
  },
  {
    code: 'postal-code',
    pattern: /(?<!\d)〒?\d{3}-\d{4}(?!\d|[- ]\d)/gu,
  },
];

const FORBIDDEN_FILE_PATTERN =
  /(?:^|\/)(?:\.env(?:\..+)?|id_(?:rsa|ed25519)|credentials(?:\..+)?|workspace-state[^/]*\.json)$|\.pem$|\.key$|\.p12$|\.pfx$/iu;

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

export function isReservedEmailDomain(domain) {
  const normalized = domain.toLowerCase();
  return (
    normalized === 'example.com' ||
    normalized === 'example.net' ||
    normalized === 'example.org' ||
    normalized.endsWith('.example') ||
    normalized.endsWith('.invalid') ||
    normalized.endsWith('.test') ||
    normalized.endsWith('.localhost') ||
    normalized === 'users.noreply.github.com'
  );
}

export function auditText(path, text) {
  const findings = [];

  for (const rule of CONTENT_RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      findings.push({
        code: rule.code,
        line: lineNumber(text, match.index ?? 0),
        path,
      });
    }
  }

  for (const match of text.matchAll(EMAIL_PATTERN)) {
    const looksLikeImageDensity = /^\d+x\d+@\d+x\.png$/u.test(match[0]);
    if (!looksLikeImageDensity && !isReservedEmailDomain(match[1])) {
      findings.push({
        code: 'non-reserved-email',
        line: lineNumber(text, match.index ?? 0),
        path,
      });
    }
  }

  return findings;
}

function searchableText(buffer) {
  return buffer.includes(0) ? '' : buffer.toString('utf8');
}

export function auditPaths(root, paths) {
  const findings = [];

  for (const path of paths) {
    if (FORBIDDEN_FILE_PATTERN.test(path) && path !== '.env.example') {
      findings.push({ code: 'sensitive-filename', line: 1, path });
    }

    const buffer = readFileSync(resolve(root, path));
    findings.push(...auditText(path, searchableText(buffer)));
  }

  return findings.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.line - right.line ||
      left.code.localeCompare(right.code),
  );
}

export function trackedAndCandidatePaths(root) {
  const output = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root },
  );

  return output.toString('utf8').split('\0').filter(Boolean);
}

function run() {
  const root = process.cwd();
  const findings = auditPaths(root, trackedAndCandidatePaths(root));

  if (findings.length === 0) {
    console.log('Privacy audit passed.');
    return;
  }

  console.error(`Privacy audit found ${findings.length} issue(s):`);
  for (const finding of findings) {
    console.error(`${finding.path}:${finding.line} [${finding.code}]`);
  }
  process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
