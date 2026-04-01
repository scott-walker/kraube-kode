import { Icons } from '../icons';
import type { Session } from '../types';

interface Props {
  session: Session;
  onToggleSidebar: () => void;
}

export default function TopBar({ session, onToggleSidebar }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 12,
      flexShrink: 0, minHeight: 52,
    }}>
      <button onClick={onToggleSidebar} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--fg-tertiary)', display: 'flex', transition: 'color 0.2s',
      }}>
        <Icons.Sidebar size={18} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{session.name}</span>
        <span style={{
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)',
          background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4,
        }}>{session.project}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)' }}>connected</span>
      </div>
    </div>
  );
}
