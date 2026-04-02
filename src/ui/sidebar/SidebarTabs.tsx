import { memo } from 'react';
import { Icons } from '../../icons';

export type SidebarTab = 'sessions' | 'mcp' | 'memory';

const TABS: { key: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { key: 'sessions', icon: <Icons.Terminal size={14} />, label: 'Sessions' },
  { key: 'mcp',      icon: <Icons.Plug size={14} />,    label: 'MCP' },
  { key: 'memory',   icon: <Icons.Memory size={14} />,  label: 'Memory' },
];

interface Props {
  active: SidebarTab;
  onChange: (tab: SidebarTab) => void;
}

export default memo(function SidebarTabs({ active, onChange }: Props) {
  return (
    <div className="sidebar__tabs">
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`sidebar__tab${active === t.key ? ' is-active' : ''}`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
});
