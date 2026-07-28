import {
  parseSpecMarkdown,
  searchSpecSections,
} from '@/features/documentation/lib/spec-reader';

const fixture = `# 製品仕様

## 1. 概要

会話を支援します。

## 2. 保存

ローカルへ保存します。
`;

describe('spec reader', () => {
  it('Markdownから章を読み取る', () => {
    const document = parseSpecMarkdown(fixture);

    expect(document.title).toBe('製品仕様');
    expect(document.sections).toHaveLength(2);
    expect(document.sections[1]?.id).toBe('2-保存');
  });

  it('章名と本文を検索する', () => {
    const { sections } = parseSpecMarkdown(fixture);

    expect(searchSpecSections(sections, 'ローカル')).toHaveLength(1);
    expect(searchSpecSections(sections, '不一致')).toHaveLength(0);
    expect(searchSpecSections(sections, '')).toHaveLength(2);
  });
});
