import { Icons } from '../icons';

interface Props {
  name: string;
  onRemove?: () => void;
}

export default function FilePill({ name, onRemove }: Props) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 8px',
      background: 'var(--bg-elevated)', borderRadius: 6, fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-secondary)',
      animation: 'fade-in 0.25s ease',
    }}>
      <Icons.File size={12} />
      <span>{name}</span>
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'flex', padding: 0 }}>
          <Icons.X size={12} />
        </button>
      )}
    </div>
  );
}
