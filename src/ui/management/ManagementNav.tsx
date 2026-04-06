import { memo } from 'react';
import { Icons } from '../../icons';
import { useManagementSection } from '../../state/selectors';
import { navigateToChat, setManagementSection } from '../../state/actions';
import type { ManagementSection } from '../../state/store';

const NAV_ITEMS: { id: ManagementSection; label: string; icon: React.ReactNode }[] = [
  { id: 'sessions', label: 'Sessions',    icon: <Icons.Terminal size={14} /> },
  { id: 'mcp',      label: 'MCP Servers', icon: <Icons.Plug size={14} /> },
  { id: 'memory',   label: 'Memory',      icon: <Icons.Memory size={14} /> },
];

export default memo(function ManagementNav() {
  const active = useManagementSection();

  return (
    <div className="settings-nav">
      <div className="settings-nav__header">
        <button className="settings-nav__back" onClick={navigateToChat}>
          <Icons.ArrowLeft size={18} />
        </button>
        <span className="settings-nav__title">Management</span>
      </div>

      <div className="settings-nav__list">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setManagementSection(item.id)}
            className={`settings-nav__item${active === item.id ? ' is-active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
});
