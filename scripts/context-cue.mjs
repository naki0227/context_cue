#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { findSpecSection, parseSpecDocument } from './lib/spec-document.mjs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const specPath = new URL('../docs/SPEC.md', import.meta.url);

function printUsage() {
  process.stdout.write(`Context Cue CLI

Usage:
  corepack pnpm spec
  corepack pnpm spec -- --list
  corepack pnpm spec -- --section <章名>
  corepack pnpm spec -- --json

Commands:
  spec  製品仕様書を表示します
`);
}

async function printSpec(args) {
  const markdown = await readFile(specPath, 'utf8');
  const document = parseSpecDocument(markdown);

  if (args.includes('--json')) {
    process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
    return;
  }

  if (args.includes('--list')) {
    process.stdout.write(
      `${document.sections.map((section) => section.title).join('\n')}\n`,
    );
    return;
  }

  const sectionIndex = args.indexOf('--section');
  if (sectionIndex >= 0) {
    const query = args[sectionIndex + 1] ?? '';
    const section = findSpecSection(document, query);
    if (!section) {
      process.stderr.write(`一致する章がありません: ${query}\n`);
      process.exitCode = 2;
      return;
    }
    process.stdout.write(`## ${section.title}\n\n${section.body}\n`);
    return;
  }

  process.stdout.write(markdown);
}

const [command = 'spec', ...args] = process.argv.slice(2);
if (command === 'spec') {
  await printSpec(args);
} else if (command === '--help' || command === 'help') {
  printUsage();
} else {
  process.stderr.write(
    `未対応のコマンドです: ${command}\nRepository: ${repositoryRoot}\n`,
  );
  printUsage();
  process.exitCode = 2;
}
