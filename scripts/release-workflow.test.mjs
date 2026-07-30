import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = readFileSync(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
);
const desktopCargo = readFileSync(
  new URL('../apps/desktop/src-tauri/Cargo.toml', import.meta.url),
  'utf8',
);

test('installs ALSA headers in quality and Tauri Linux jobs', () => {
  assert.equal(workflow.match(/libasound2-dev/g)?.length, 2);
});

test('only exports signing variables when certificates are available', () => {
  assert.match(workflow, /if \[ -n "\$APPLE_CERTIFICATE_SECRET" \]; then/);
  assert.match(workflow, /if \[ -n "\$WINDOWS_CERTIFICATE_SECRET" \]; then/);

  const actionEnvironment = workflow.match(
    /uses: tauri-apps\/tauri-action@v1\s+env:\s+([\s\S]*?)\s+with:/,
  );
  assert.ok(actionEnvironment);
  assert.doesNotMatch(actionEnvironment[1], /APPLE_|WINDOWS_/);
});

test('keeps CPAL Windows bindings on the Tauri-compatible version', () => {
  assert.match(
    desktopCargo,
    /\[target\.'cfg\(target_os = "windows"\)'\.dependencies\]\s+[\s\S]*windows-core = "=0\.61\.2"/,
  );
});

test('builds native Linux dependencies as position-independent code', () => {
  assert.equal(
    workflow.match(/CFLAGS=-fPIC -ffile-prefix-map=\$GITHUB_WORKSPACE=\./g)
      ?.length,
    2,
  );
  assert.equal(
    workflow.match(/CXXFLAGS=-fPIC -ffile-prefix-map=\$GITHUB_WORKSPACE=\./g)
      ?.length,
    2,
  );
});
