import { Icons } from '../../icons';

interface Props {
  current: number;
  total: number;
  label: string;
}

export default function LoopProgress({ current, total, label }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
      background: 'var(--bg-elevated)', borderRadius: 8,
    }}>
      <span style={{ display: 'flex', color: 'var(--accent)', animation: 'spin 2s linear infinite' }}>
        <Icons.Loop size={14} />
      </span>
      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-secondary)' }}>{label}</span>
      <div style={{ flex: 1, height: 3, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: 'var(--accent)', borderRadius: 2,
          width: `${(current / total) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)' }}>{current}/{total}</span>
    </div>
  );
}
