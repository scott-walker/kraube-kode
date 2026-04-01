import { useState } from 'react';
import { Icons } from '../../icons';
import SessionsTab from './SessionsTab';
import McpTab from './McpTab';
import MemoryTab from './MemoryTab';
import type { Theme } from '../../theme';
import type { Session, McpServer } from '../../types';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  sessions: Session[];
  activeSession: number;
  onSelectSession: (id: number) => void;
  mcpServers: McpServer[];
  memories: string[];
}

type Tab = 'sessions' | 'mcp' | 'memory';

export default function Sidebar({ theme, onToggleTheme, onOpenSettings, sessions, activeSession, onSelectSession, mcpServers, memories }: Props) {
  const [tab, setTab] = useState<Tab>('sessions');
  const isDark = theme === 'dark';

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'sessions', icon: <Icons.Terminal size={14} />, label: 'Sessions' },
    { key: 'mcp', icon: <Icons.Plug size={14} />, label: 'MCP' },
    { key: 'memory', icon: <Icons.Memory size={14} />, label: 'Memory' },
  ];

  return (
    <div style={{
      width: 280, minWidth: 280, height: '100%', background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      animation: 'fade-in 0.3s ease', transition: 'background 0.4s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.Terminal size={14} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Claude Code</div>
          <div style={{ fontSize: 11, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}>v1.0.42 — opus-4</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 16px', gap: 2, marginBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px 0', background: tab === t.key ? 'var(--accent-dim)' : 'transparent',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            color: tab === t.key ? 'var(--accent)' : 'var(--fg-tertiary)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            transition: 'all 0.2s ease', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em',
            textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {tab === 'sessions' && <SessionsTab sessions={sessions} activeSession={activeSession} onSelect={onSelectSession} />}
        {tab === 'mcp' && <McpTab servers={mcpServers} />}
        {tab === 'memory' && <MemoryTab memories={memories} />}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onToggleTheme} style={{
          background: 'var(--bg-elevated)', border: 'none', borderRadius: 8,
          width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fg-secondary)', transition: 'all 0.3s ease',
        }}>
          {isDark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
        </button>
        <button onClick={onOpenSettings} style={{
          background: 'var(--bg-elevated)', border: 'none', borderRadius: 8,
          width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fg-secondary)', transition: 'all 0.3s ease',
        }}>
          <Icons.Settings size={16} />
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: 'var(--fg-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}>opus-4-0626</div>
      </div>
    </div>
  );
}
