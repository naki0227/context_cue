#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createSpecHash, parseSpecDocument } from './lib/spec-document.mjs';

const specPath = new URL('../docs/SPEC.md', import.meta.url);
const outputPath = new URL(
  '../apps/desktop/src/features/documentation/generated/spec.generated.ts',
  import.meta.url,
);

function buildOutput(markdown) {
  const document = parseSpecDocument(markdown);
  return `// Generated from docs/SPEC.md. Do not edit directly.
export const SPEC_HASH = '${createSpecHash(markdown)}';
export const SPEC_MARKDOWN = ${JSON.stringify(markdown)};
export const SPEC_METADATA = ${JSON.stringify(document.metadata, null, 2)} as const;
`;
}

const markdown = await readFile(specPath, 'utf8');
const expected = buildOutput(markdown);

if (process.argv.includes('--check')) {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== expected) {
    process.stderr.write(
      'SPEC同期エラー: corepack pnpm spec:generate を実行してください。\n',
    );
    process.exitCode = 1;
  }
} else {
  await mkdir(new URL('.', outputPath), { recursive: true });
  await writeFile(outputPath, expected, 'utf8');
}
