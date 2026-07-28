import { createHash } from 'node:crypto';

const metadataPattern = /^-\s+([^:]+):\s+(.+)$/;
const headingPattern = /^(#{1,6})\s+(.+)$/;

export function createSpecHash(markdown) {
  return createHash('sha256').update(markdown).digest('hex');
}

export function parseSpecDocument(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const metadata = {};
  const sections = [];
  let title = '';

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(headingPattern);
    if (heading?.[1] === '#') {
      title = heading[2].trim();
    }

    const metadataMatch = lines[index].match(metadataPattern);
    if (metadataMatch && sections.length === 0) {
      metadata[metadataMatch[1].trim()] = metadataMatch[2].trim();
    }

    if (heading?.[1] !== '##') {
      continue;
    }

    const body = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (lines[cursor].startsWith('## ')) {
        break;
      }
      body.push(lines[cursor]);
    }

    sections.push({
      body: body.join('\n').trim(),
      title: heading[2].trim(),
    });
  }

  return {
    hash: createSpecHash(markdown),
    markdown,
    metadata,
    sections,
    title,
  };
}

export function findSpecSection(document, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ja');
  if (!normalizedQuery) {
    return undefined;
  }

  return document.sections.find((section) =>
    section.title.toLocaleLowerCase('ja').includes(normalizedQuery),
  );
}
