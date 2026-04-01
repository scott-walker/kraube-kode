import { Icons } from '../../icons';
import type { McpServer } from '../../types';

interface Props {
  servers: McpServer[];
}

export default function McpTab({ servers }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 4px 10px', fontWeight: 500 }}>
        Connected Servers
      </div>
      {servers.map(s => (
        <div key={s.name} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
          borderRadius: 10, marginBottom: 2, cursor: 'pointer', transition: 'background 0.2s',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: s.status === 'connected' ? 'var(--success)' : s.status === 'error' ? 'var(--error)' : 'var(--fg-tertiary)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}>{s.tools} tools</div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'flex' }}>
            <Icons.Settings size={14} />
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
        Add MCP Server
      </button>
    </div>
  );
}
