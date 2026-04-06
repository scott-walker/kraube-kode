import { memo } from 'react';
import { Icons } from '../../icons';
import { useTheme, useCurrentView } from '../../state/selectors';
import { setSidebarOpen, toggleTheme, navigateToSettings, navigateToManagement, navigateToChat } from '../../state/actions';
import NewSessionButton from '../shared/NewSessionButton';
import logoSvg from '../../../etc/logo.svg';
import './SidebarMini.css';

export default memo(function SidebarMini() {
  const isDark = useTheme() === 'dark';
  const currentView = useCurrentView();
  const toggleSettings = () => currentView === 'settings' ? navigateToChat() : navigateToSettings();
  const toggleManagement = () => currentView === 'management' ? navigateToChat() : navigateToManagement();

  return (
    <div className="sidebar-mini">
      <div className="sidebar-mini__header">
        <img
          className="sidebar-mini__logo"
          src={logoSvg}
          alt=""
          onClick={() => setSidebarOpen(true)}
        />
      </div>
      <div className="sidebar-mini__actions">
        <NewSessionButton />
      </div>
      <div className="flex-1" />
      <div className="sidebar-mini__footer">
        <button className="sidebar-mini__footer-btn" onClick={toggleTheme}>
          {isDark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
        </button>
        <button className="sidebar-mini__footer-btn" onClick={toggleManagement}>
          <Icons.Layers size={16} />
        </button>
        <button className="sidebar-mini__footer-btn" onClick={toggleSettings}>
          <Icons.Settings size={16} />
        </button>
      </div>
    </div>
  );
});
