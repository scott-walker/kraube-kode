import { useState, type ReactNode } from 'react';
import { Icons } from '../icons';

interface Props {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
  badge?: string | number;
}

export default function Collapsible({ title, icon, children, defaultOpen = false, accent = false, badge }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 2 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer',
        color: accent ? 'var(--accent)' : 'var(--fg-secondary)', fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em',
        transition: 'color 0.2s',
      }}>
        <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)', display: 'flex' }}>
          <Icons.ChevronRight size={12} />
        </span>
        {icon}
        <span style={{ textTransform: 'uppercase', fontWeight: 500 }}>{title}</span>
        {badge && <span style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 6,
          padding: '1px 6px', fontSize: 10, fontWeight: 600, marginLeft: 'auto',
        }}>{badge}</span>}
      </button>
      <div style={{
        overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
        maxHeight: open ? 600 : 0, opacity: open ? 1 : 0,
      }}>
        <div style={{ paddingLeft: 20, paddingTop: 4 }}>{children}</div>
      </div>
    </div>
  );
}
