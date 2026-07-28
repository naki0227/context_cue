import type { ReactNode } from 'react';

type SpecSectionContentProps = {
  body: string;
};

function isListLine(line: string) {
  return /^(- |\d+\. )/.test(line);
}

function renderLines(body: string) {
  const lines = body.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3);
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push(
        <pre className="spec-code" key={`code-${index}`}>
          {language ? <span>{language}</span> : null}
          <code>{code.join('\n')}</code>
        </pre>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(<h3 key={`heading-${index}`}>{line.slice(4)}</h3>);
      index += 1;
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (
        index < lines.length &&
        isListLine(lines[index].trim()) &&
        /^\d+\. /.test(lines[index].trim()) === ordered
      ) {
        items.push(lines[index].trim().replace(/^(- |\d+\. )/, ''));
        index += 1;
      }
      const children = items.map((item) => <li key={item}>{item}</li>);
      blocks.push(
        ordered ? (
          <ol key={`list-${index}`}>{children}</ol>
        ) : (
          <ul key={`list-${index}`}>{children}</ul>
        ),
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('### ') &&
      !lines[index].trim().startsWith('```') &&
      !isListLine(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{paragraph.join(' ')}</p>);
  }

  return blocks;
}

export function SpecSectionContent({ body }: SpecSectionContentProps) {
  return <div className="spec-section-content">{renderLines(body)}</div>;
}
