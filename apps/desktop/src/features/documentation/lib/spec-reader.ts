export type SpecSection = {
  body: string;
  id: string;
  title: string;
};

export type SpecDocument = {
  sections: SpecSection[];
  title: string;
};

function toSectionId(title: string) {
  return title
    .toLocaleLowerCase('ja')
    .replaceAll(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replaceAll(/^-|-$/g, '');
}

export function parseSpecMarkdown(markdown: string): SpecDocument {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const title =
    lines
      .find((line) => line.startsWith('# '))
      ?.slice(2)
      .trim() ?? '製品仕様書';
  const sections: SpecSection[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].startsWith('## ')) {
      continue;
    }

    const sectionTitle = lines[index].slice(3).trim();
    const body: string[] = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (lines[cursor].startsWith('## ')) {
        break;
      }
      body.push(lines[cursor]);
    }

    sections.push({
      body: body.join('\n').trim(),
      id: toSectionId(sectionTitle),
      title: sectionTitle,
    });
  }

  return { sections, title };
}

export function searchSpecSections(sections: SpecSection[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ja');
  if (!normalizedQuery) {
    return sections;
  }

  return sections.filter((section) =>
    `${section.title}\n${section.body}`
      .toLocaleLowerCase('ja')
      .includes(normalizedQuery),
  );
}
