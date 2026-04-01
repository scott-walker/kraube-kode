import { Icons } from '../../icons';

interface Props {
  memories: string[];
}

export default function MemoryTab({ memories }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 4px 10px', fontWeight: 500 }}>
        Project Memory
      </div>
      {memories.map((m, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
          borderRadius: 8, marginBottom: 2, fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.5,
        }}>
          <span style={{ color: 'var(--fg-tertiary)', flexShrink: 0, paddingTop: 2 }}>•</span>
          <span style={{ flex: 1 }}>{m}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'flex', flexShrink: 0, opacity: 0.5 }}>
            <Icons.X size={12} />
          </button>
        </div>
      ))}
      <button style={{
        width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)',
        border: 'none', borderRadius: 10, cursor: 'pointer', color: 'var(--fg-secondary)',
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500,
        transition: 'all 0.2s ease', marginTop: 10,
      }}>
        <Icons.Plus size={14} />
        Add Memory
      </button>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 4px 10px', fontWeight: 500 }}>
          CLAUDE.md
        </div>
        <div style={{
          padding: '10px 12px', borderRadius: 10, background: 'var(--bg-elevated)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--fg-tertiary)', lineHeight: 1.6,
        }}>
          # Convervox Project<br />
          Stack: React + Vite + TailwindCSS<br />
          API: REST + WebSocket<br />
          Voice: ElevenLabs + Whisper
        </div>
        <button style={{
          marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontSize: 12, fontWeight: 500, padding: '4px 0',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icons.Edit size={12} />
          Edit CLAUDE.md
        </button>
      </div>
    </div>
  );
}
