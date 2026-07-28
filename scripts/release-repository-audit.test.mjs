import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { auditReleaseRepository } from './release-repository-audit.mjs';

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'release-repository-audit-'));
  for (const [path, content] of Object.entries(files)) {
    const file = join(root, path);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, content);
  }
  return root;
}

test('accepts an isolated public release repository', () => {
  const root = fixture({
    'README.md': '# Product\n\nDownload from the latest public release.',
    '.git/logs/HEAD': 'private-source person@example.invalid',
  });

  assert.deepEqual(
    auditReleaseRepository({
      directory: root,
      markers: ['private-source'],
      reportRoot: root,
    }),
    [],
  );
});

test('rejects private source references and identifying metadata', () => {
  const root = fixture({
    'README.md': [
      'private-source',
      'person@example.invalid',
      ['', 'Users', 'developer', 'project'].join('/'),
      '0123456789abcdef0123456789abcdef01234567',
    ].join('\n'),
  });

  assert.deepEqual(
    auditReleaseRepository({
      directory: root,
      markers: ['private-source'],
      reportRoot: root,
    }).map((finding) => finding.code),
    [
      'private-source-reference',
      'email-address',
      'absolute-home-path',
      'commit-sha',
    ],
  );
});
