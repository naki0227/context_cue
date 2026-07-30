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
const publishWorkflow = readFileSync(
  new URL('../.github/workflows/publish-beta-release.yml', import.meta.url),
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

test('uploads CLI assets to the isolated release repository', () => {
  const cliUpload = workflow.match(
    /uses: softprops\/action-gh-release@v3\s+with:\s+([\s\S]*?)\s+files:/,
  );
  assert.ok(cliUpload);
  assert.match(
    cliUpload[1],
    /token: \$\{\{ secrets\.RELEASE_REPOSITORY_TOKEN \}\}/,
  );
  assert.match(cliUpload[1], /repository: enludus\/How-to-talk/);
  assert.doesNotMatch(cliUpload[1], /GITHUB_REPOSITORY/);
});

test('publishes unsigned builds as a beta with scoped trust guidance', () => {
  assert.match(workflow, /prerelease: true/);
  assert.match(
    workflow,
    /このReleaseは、動作確認とフィードバック収集を目的としたベータ版です/,
  );
  assert.match(workflow, /「プライバシーとセキュリティ」を開きます/);
  assert.match(workflow, /SmartScreenの「WindowsによってPCが保護されました」/);
  assert.match(workflow, /保護設定を無効化せず/);
  assert.doesNotMatch(workflow, /xattr|spctl --master-disable/);
});

test('publishes a beta only through an explicit guarded workflow', () => {
  assert.match(publishWorkflow, /workflow_dispatch:/);
  assert.doesNotMatch(publishWorkflow, /^\s+(push|schedule):/m);
  assert.match(publishWorkflow, /SMOKE_TESTED.*!= "true"/s);
  assert.match(publishWorkflow, /CONFIRMATION.*!= "publish \$RELEASE_TAG"/s);
  assert.match(publishWorkflow, /\.draft == true/);
  assert.match(publishWorkflow, /\.prerelease == true/);
  assert.match(publishWorkflow, /endswith\("\.dmg"\)/);
  assert.match(publishWorkflow, /endswith\("\.msi"\)/);
  assert.match(publishWorkflow, /endswith\("\.AppImage"\)/);
  assert.match(publishWorkflow, /endswith\("\.sha256"\).*length >= 4/s);
  assert.match(publishWorkflow, /-F draft=false/);
  assert.match(publishWorkflow, /-F prerelease=true/);
  assert.match(
    publishWorkflow,
    /GH_TOKEN: \$\{\{ secrets\.RELEASE_REPOSITORY_TOKEN \}\}/,
  );
});
