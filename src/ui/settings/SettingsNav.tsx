import { memo } from 'react';
import { Icons } from '../../icons';
import { useSettingsSection } from '../../state/selectors';
import { navigateToChat, setSettingsSection } from '../../state/actions';
import type { SettingsSection } from '../../state/store';
import './SettingsNav.css';

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'connections',  label: 'Connections',  icon: <Icons.Plug size={14} /> },
  { id: 'permissions', label: 'Permissions',  icon: <Icons.AlertCircle size={14} /> },
  { id: 'voice',       label: 'Voice Input',  icon: <Icons.MicSettings size={14} /> },
  { id: 'appearance',  label: 'Appearance',   icon: <Icons.Eye size={14} /> },
];

export default memo(function SettingsNav() {
  const active = useSettingsSection();

  return (
    <div className="settings-nav">
      <div className="settings-nav__header">
        <button className="settings-nav__back" onClick={navigateToChat}>
          <Icons.ArrowLeft size={18} />
        </button>
        <span className="settings-nav__title">Settings</span>
      </div>

      <div className="settings-nav__list">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setSettingsSection(item.id)}
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
