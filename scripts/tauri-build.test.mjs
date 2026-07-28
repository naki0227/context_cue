import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compilerPathFlags, encodedRustFlags } from './tauri-build.mjs';

test('adds a workspace remap without exposing it as a separate argument', () => {
  assert.equal(
    encodedRustFlags(undefined, '/workspace/project', '/cargo/home'),
    '--remap-path-prefix=/workspace/project=.\u001f--remap-path-prefix=/cargo/home=.cargo',
  );
});

test('preserves existing encoded flags', () => {
  assert.equal(
    encodedRustFlags(
      '-C\u001fdebuginfo=0',
      '/workspace/project',
      '/cargo/home',
    ),
    '-C\u001fdebuginfo=0\u001f--remap-path-prefix=/workspace/project=.\u001f--remap-path-prefix=/cargo/home=.cargo',
  );
});

test('adds a compiler path remap for native dependencies', () => {
  assert.equal(
    compilerPathFlags('-O2', '/workspace/project'),
    '-O2 -ffile-prefix-map=/workspace/project=.',
  );
});
