import assert from 'node:assert/strict';
import test from 'node:test';
import { findSpecSection, parseSpecDocument } from './lib/spec-document.mjs';

const fixture = `# 製品仕様

- 仕様バージョン: 1.0.0

## 1. 概要

概要本文

## 2. 保存

保存本文
`;

test('仕様のメタデータと章を解析する', () => {
  const document = parseSpecDocument(fixture);

  assert.equal(document.title, '製品仕様');
  assert.equal(document.metadata.仕様バージョン, '1.0.0');
  assert.equal(document.sections.length, 2);
  assert.equal(document.hash.length, 64);
});

test('章名の一部から対象章を取得する', () => {
  const document = parseSpecDocument(fixture);

  assert.equal(findSpecSection(document, '保存')?.body, '保存本文');
  assert.equal(findSpecSection(document, '存在しない章'), undefined);
});
