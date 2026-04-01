import { Icons } from '../../icons';
import type { Session } from '../../types';

interface Props {
  sessions: Session[];
  activeSession: number;
  onSelect: (id: number) => void;
}

export default function SessionsTab({ sessions, activeSession, onSelect }: Props) {
  return (
    <div>
      <button style={{
        width: '100%', padding: '10px 12px', background: 'var(--accent-dim)',
        border: 'none', borderRadius: 10, cursor: 'pointer', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
        transition: 'all 0.2s ease', marginBottom: 12,
      }}>
        <Icons.Plus size={16} />
        New Session
      </button>
      {sessions.map(s => (
        <button key={s.id} onClick={() => onSelect(s.id)} style={{
          width: '100%', padding: '10px 12px', background: activeSession === s.id ? 'var(--bg-elevated)' : 'transparent',
          border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
          marginBottom: 2, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: s.active ? 12 : 0 }}>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)' }}>{s.project}</span>
            <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginLeft: 'auto' }}>{s.time}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
