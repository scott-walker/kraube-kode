import { useMemo, useState } from 'react';
import { Icons } from '../../icons';
import { highlightCode, langFromFilename, splitHighlightedLines } from '../../services/syntax';
import './DiffBlock.css';

interface Props {
  filename: string;
  additions: number;
  deletions: number;
  lines: string;
}

function diffLineClass(line: string): string {
  if (line.startsWith('+')) return 'diff-line-add';
  if (line.startsWith('-')) return 'diff-line-remove';
  return 'diff-line-context';
}

export default function DiffBlock({ filename, additions, deletions, lines }: Props) {
  const [open, setOpen] = useState(false);

  const highlightedLines = useMemo(() => {
    if (!open) return [];
    const rawLines = lines.split('\n');
    const codeOnly = rawLines.map(l => l.slice(1));
    const lang = langFromFilename(filename);
    const html = highlightCode(codeOnly.join('\n'), lang);
    const htmlLines = splitHighlightedLines(html);
    return rawLines.map((raw, i) => ({
      prefix: raw[0] ?? ' ',
      cls: diffLineClass(raw),
      html: htmlLines[i] ?? '',
    }));
  }, [open, lines, filename]);

  return (
    <div className={`diff-block${open ? ' diff-block--open' : ''}`}>
      <button className="diff-block__header" onClick={() => setOpen(o => !o)}>
        <span className={`diff-block__chevron${open ? ' diff-block__chevron--open' : ''}`}><Icons.ChevronRight size={12} /></span>
        <Icons.Edit size={12} />
        <span className="diff-block__filename">{filename}</span>
        <span className="diff-block__stats">
          <span className="diff-block__additions">+{additions}</span>{' '}
          <span className="diff-block__deletions">-{deletions}</span>
        </span>
      </button>
      {open && (
        <pre className="diff-block__pre">
          {highlightedLines.map((line, i) => (
            <div key={i} className={line.cls}>
              <span className="diff-line__prefix">{line.prefix}</span>
              <span dangerouslySetInnerHTML={{ __html: line.html }} />
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
