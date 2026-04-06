import { memo } from 'react';
import { Icons } from '../../icons';
import { useTheme, useCurrentView } from '../../state/selectors';
import { toggleTheme, navigateToSettings, navigateToChat } from '../../state/actions';

declare const __APP_VERSION__: string;

export default memo(function SidebarFooter() {
  const isDark = useTheme() === 'dark';
  const currentView = useCurrentView();
  const toggleSettings = () => currentView === 'settings' ? navigateToChat() : navigateToSettings();
  return (
    <div className="sidebar__footer">
      <button className="sidebar__footer-btn" onClick={toggleTheme}>
        {isDark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
      </button>
      <button className="sidebar__footer-btn" onClick={toggleSettings}>
        <Icons.Settings size={16} />
      </button>
      <div className="flex-1" />
      <div className="sidebar__footer-version">v{__APP_VERSION__}</div>
      <button className="sidebar__footer-update" onClick={() => {}}>
        <Icons.Refresh size={12} />
      </button>
    </div>
  );
});
