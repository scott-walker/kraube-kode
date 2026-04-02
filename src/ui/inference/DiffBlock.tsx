import { useState } from 'react';
import { Icons } from '../../icons';
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

  return (
    <div className="diff-block">
      <button className="diff-block__header" onClick={() => setOpen(o => !o)}>
        <Icons.ChevronRight size={12} className={`diff-block__chevron${open ? ' diff-block__chevron--open' : ''}`} />
        <Icons.Edit size={12} />
        <span className="diff-block__filename">{filename}</span>
        <span className="diff-block__stats">
          <span className="diff-block__additions">+{additions}</span>{' '}
          <span className="diff-block__deletions">-{deletions}</span>
        </span>
      </button>
      {open && (
        <pre className="diff-block__pre">
          {lines.split('\n').map((line, i) => (
            <div key={i} className={diffLineClass(line)}>{line}</div>
          ))}
        </pre>
      )}
    </div>
  );
}
