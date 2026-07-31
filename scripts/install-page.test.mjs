import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = readFileSync(
  new URL(
    '../distribution/release-repository/install/index.html',
    import.meta.url,
  ),
  'utf8',
);
const readme = readFileSync(
  new URL('../distribution/release-repository/README.md', import.meta.url),
  'utf8',
);
const pagesWorkflow = readFileSync(
  new URL(
    '../distribution/release-repository/.github/workflows/pages.yml',
    import.meta.url,
  ),
  'utf8',
);
const rootPage = readFileSync(
  new URL('../distribution/release-repository/index.html', import.meta.url),
  'utf8',
);

test('public install button opens the device-aware install page', () => {
  assert.match(readme, /https:\/\/enludus\.github\.io\/How-to-talk\/install\//);
  assert.match(readme, /新規導入か更新かを判断/);
});

test('repository Pages root redirects to the install page', () => {
  assert.match(rootPage, /content="0; url=\.\/install\/"/);
  assert.match(rootPage, /href="\.\/install\/"/);
});

test('install page resolves only stable public installer assets', () => {
  for (const filename of [
    'How-to-Talk-macOS-Apple-Silicon.dmg',
    'How-to-Talk-macOS-Intel.dmg',
    'How-to-Talk-Windows-x64-Setup.exe',
    'How-to-Talk-Linux-x64.AppImage',
  ]) {
    assert.match(page, new RegExp(filename.replaceAll('.', '\\.')));
  }
  assert.match(
    page,
    /https:\/\/api\.github\.com\/repos\/\$\{repository\}\/releases/,
  );
  assert.doesNotMatch(page, /analytics|localStorage|document\.cookie/i);
});

test('install page supports versioned assets from releases before v0.1.5', () => {
  assert.match(page, /macArm: \/_aarch64\\\.dmg\$\/i/);
  assert.match(page, /macIntel: \/_x64\\\.dmg\$\/i/);
  assert.match(page, /windows: \/_x64-setup\\\.exe\$\/i/);
  assert.match(page, /linux: \/_amd64\\\.AppImage\$\/i/);
  assert.match(page, /available\.get\(filename\) \?\? legacyAsset/);
});

test('release repository deploys the static page with minimal permissions', () => {
  assert.match(pagesWorkflow, /- "index\.html"/);
  assert.match(pagesWorkflow, /pages: write/);
  assert.match(pagesWorkflow, /id-token: write/);
  assert.match(pagesWorkflow, /contents: read/);
  assert.doesNotMatch(pagesWorkflow, /contents: write/);
});
