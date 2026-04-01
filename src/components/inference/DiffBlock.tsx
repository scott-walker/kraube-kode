import { Icons } from '../../icons';

interface Props {
  filename: string;
  additions: number;
  deletions: number;
  lines: string;
}

export default function DiffBlock({ filename, additions, deletions, lines }: Props) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-code)', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', background: 'var(--bg-code-header)', gap: 8 }}>
        <Icons.Edit size={12} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--fg-tertiary)', fontWeight: 500 }}>{filename}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: 'var(--success)' }}>+{additions}</span>{' '}
          <span style={{ color: 'var(--error)' }}>-{deletions}</span>
        </span>
      </div>
      <pre style={{ padding: '10px 16px', margin: 0, fontSize: 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
        {lines.split('\n').map((line, i) => (
          <div key={i} style={{
            color: line.startsWith('+') ? 'var(--success)' : line.startsWith('-') ? 'var(--error)' : 'var(--fg-code)',
            opacity: line.startsWith('-') ? 0.8 : 1,
          }}>{line}</div>
        ))}
      </pre>
    </div>
  );
}
