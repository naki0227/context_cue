import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateReleaseMetadata } from './release-preflight.mjs';

const validMetadata = {
  desktopVersion: '0.1.0',
  packageManager: 'pnpm@11.17.0',
  rootVersion: '0.1.0',
  rustVersion: '0.1.0',
  tauriVersion: '0.1.0',
};

test('accepts aligned versions and tag', () => {
  assert.deepEqual(validateReleaseMetadata(validMetadata, 'v0.1.0'), []);
});

test('rejects mismatched versions and tags', () => {
  const errors = validateReleaseMetadata(
    { ...validMetadata, desktopVersion: '0.2.0' },
    'v0.3.0',
  );

  assert.equal(errors.length, 2);
});

test('rejects a package manager that differs from CI', () => {
  const errors = validateReleaseMetadata({
    ...validMetadata,
    packageManager: 'pnpm@10.0.0',
  });

  assert.deepEqual(errors, ['unexpected package manager: pnpm@10.0.0']);
});
