import { Icons } from '../../icons';
import Collapsible from '../Collapsible';
import type { Theme } from '../../theme';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onClose: () => void;
}

export default function SettingsPanel({ theme, onToggleTheme, onClose }: Props) {
  const isDark = theme === 'dark';
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', animation: 'fade-in 0.2s ease' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
      <div style={{
        width: 400, height: '100%', background: 'var(--bg-secondary)', padding: 28,
        overflowY: 'auto', animation: 'slide-up 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Settings</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-tertiary)', display: 'flex' }}>
            <Icons.X size={20} />
          </button>
        </div>

        <Collapsible title="Model" icon={<Icons.Brain size={12} />} defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['claude-opus-4-0626', 'claude-sonnet-4-0514', 'claude-haiku-4-5'].map((m, i) => (
              <button key={m} style={{
                padding: '10px 12px', borderRadius: 8, background: i === 0 ? 'var(--accent-dim)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: i === 0 ? 'var(--accent)' : 'var(--fg-secondary)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                transition: 'all 0.2s ease',
              }}>{m}</button>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Permissions" icon={<Icons.AlertCircle size={12} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
            {['File read', 'File write', 'Bash commands', 'Network access', 'MCP tools'].map((p, i) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{p}</span>
                <div style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: i < 3 ? 'var(--accent)' : 'var(--bg-tertiary)',
                  cursor: 'pointer', padding: 2, transition: 'background 0.3s ease',
                  display: 'flex', alignItems: 'center',
                  justifyContent: i < 3 ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Appearance" icon={<Icons.Eye size={12} />}>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
            {[
              { icon: <Icons.Moon size={18} />, label: 'Dark', active: isDark },
              { icon: <Icons.Sun size={18} />, label: 'Light', active: !isDark },
            ].map(opt => (
              <button key={opt.label} onClick={onToggleTheme} style={{
                flex: 1, padding: '12px', borderRadius: 10,
                background: opt.active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: 'none', cursor: 'pointer',
                color: opt.active ? 'var(--accent)' : 'var(--fg-secondary)',
                fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Loop Settings" icon={<Icons.Loop size={12} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--fg-tertiary)', display: 'block', marginBottom: 6 }}>Max iterations</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[5, 10, 25, 50, '∞'].map(n => (
                  <button key={n} style={{
                    flex: 1, padding: '8px', borderRadius: 8,
                    background: n === 25 ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    border: 'none', cursor: 'pointer',
                    color: n === 25 ? 'var(--accent)' : 'var(--fg-secondary)',
                    fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    transition: 'all 0.2s',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Context" icon={<Icons.Layers size={12} />}>
          <div style={{ fontSize: 12, color: 'var(--fg-tertiary)', lineHeight: 1.6, paddingBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Token usage</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>48.2k / 200k</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '24%', background: 'var(--accent)', borderRadius: 2 }} />
            </div>
          </div>
        </Collapsible>
      </div>
    </div>
  );
}
