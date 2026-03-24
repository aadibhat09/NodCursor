import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  return (
    /^#{1,6}\s+/.test(trimmed)
    || /^```/.test(trimmed)
    || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
    || /^\s*[-*+]\s+/.test(line)
    || /^\s*\d+\.\s+/.test(line)
    || /^>\s?/.test(trimmed)
    || (trimmed.includes('|'))
  );
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  const tryMatchAt = (source: string, start: number) => {
    const segment = source.slice(start);
    const patterns: Array<{ type: 'link' | 'code' | 'bold' | 'italic'; regex: RegExp }> = [
      { type: 'link', regex: /^\[([^\]]+)\]\(([^)]+)\)/ },
      { type: 'code', regex: /^`([^`]+)`/ },
      { type: 'bold', regex: /^\*\*([^*]+)\*\*/ },
      { type: 'italic', regex: /^\*([^*]+)\*/ }
    ];

    for (const pattern of patterns) {
      const match = segment.match(pattern.regex);
      if (match) {
        return { ...pattern, match };
      }
    }

    return null;
  };

  while (cursor < text.length) {
    let nextIndex = -1;
    for (const marker of ['[', '`', '*']) {
      const found = text.indexOf(marker, cursor);
      if (found !== -1 && (nextIndex === -1 || found < nextIndex)) {
        nextIndex = found;
      }
    }

    if (nextIndex === -1) {
      nodes.push(text.slice(cursor));
      break;
    }

    if (nextIndex > cursor) {
      nodes.push(text.slice(cursor, nextIndex));
      cursor = nextIndex;
    }

    const token = tryMatchAt(text, cursor);
    if (!token) {
      nodes.push(text[cursor]);
      cursor += 1;
      continue;
    }

    const tokenKey = `${keyPrefix}-tok-${tokenIndex++}`;
    const [full, capture1, capture2] = token.match;

    if (token.type === 'link') {
      const href = capture2;
      const isExternal = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={tokenKey}
          href={href}
          className="text-app-accent underline underline-offset-2 hover:text-app-accentStrong"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer noopener' : undefined}
        >
          {capture1}
        </a>
      );
    } else if (token.type === 'code') {
      nodes.push(
        <code key={tokenKey} className="rounded bg-app-bg/60 px-1 py-0.5 font-mono text-[0.9em] text-app-text">
          {capture1}
        </code>
      );
    } else if (token.type === 'bold') {
      nodes.push(<strong key={tokenKey} className="font-semibold text-app-text">{capture1}</strong>);
    } else {
      nodes.push(<em key={tokenKey}>{capture1}</em>);
    }

    cursor += full.length;
  }

  return nodes;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const language = trimmed.replace(/^```/, '').trim();
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;

      blocks.push(
        <div key={`code-${index}`} className="overflow-auto rounded-lg border border-app-accent/20 bg-app-bg/70 p-3">
          {language ? <p className="mb-2 text-[11px] uppercase tracking-wide text-app-subtle">{language}</p> : null}
          <pre className="whitespace-pre text-xs leading-6 text-app-text">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      const title = headingMatch[2];
      const headingClass =
        depth === 1 ? 'text-2xl font-bold text-app-text'
        : depth === 2 ? 'text-xl font-semibold text-app-text'
        : depth === 3 ? 'text-lg font-semibold text-app-text'
        : 'text-base font-semibold text-app-text';

      blocks.push(
        <h2 key={`h-${index}`} className={headingClass}>
          {parseInline(title, `h-${index}`)}
        </h2>
      );
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} className="border-app-accent/20" />);
      index += 1;
      continue;
    }

    if (trimmed.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const header = splitTableRow(lines[index]);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push(
        <div key={`tbl-${index}`} className="overflow-auto rounded-lg border border-app-accent/20">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-app-panelAlt text-app-text">
                {header.map((cell, cellIndex) => (
                  <th key={`th-${cellIndex}`} className="border-b border-app-accent/20 px-3 py-2 text-left font-semibold">
                    {parseInline(cell, `th-${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`tr-${rowIndex}`} className="odd:bg-app-panelAlt/50">
                  {row.map((cell, cellIndex) => (
                    <td key={`td-${rowIndex}-${cellIndex}`} className="border-t border-app-accent/10 px-3 py-2 align-top text-app-subtle">
                      {parseInline(cell, `td-${index}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, '').trim());
        index += 1;
      }

      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-6 text-sm">
          {items.map((item, itemIndex) => (
            <li key={`uli-${itemIndex}`}>{parseInline(item, `ul-${index}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, '').trim());
        index += 1;
      }

      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-6 text-sm">
          {items.map((item, itemIndex) => (
            <li key={`oli-${itemIndex}`}>{parseInline(item, `ol-${index}-${itemIndex}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }

      blocks.push(
        <blockquote key={`bq-${index}`} className="border-l-4 border-app-accent/40 bg-app-panelAlt/60 px-3 py-2 text-sm italic">
          {parseInline(quoteLines.join(' '), `bq-${index}`)}
        </blockquote>
      );
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-app-subtle">
        {parseInline(paragraphLines.join(' '), `p-${index}`)}
      </p>
    );
  }

  return <div className="space-y-4">{blocks}</div>;
}
