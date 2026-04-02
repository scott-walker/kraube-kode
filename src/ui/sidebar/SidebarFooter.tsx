import { memo } from 'react';
import { Icons } from '../../icons';
import { useTheme } from '../../state/selectors';
import { toggleTheme, setSettingsOpen } from '../../state/actions';

export default memo(function SidebarFooter() {
  const isDark = useTheme() === 'dark';
  return (
    <div className="sidebar__footer">
      <button className="sidebar__footer-btn" onClick={toggleTheme}>
        {isDark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
      </button>
      <button className="sidebar__footer-btn" onClick={() => setSettingsOpen(true)}>
        <Icons.Settings size={16} />
      </button>
      <div className="flex-1" />
      <div className="sidebar__footer-version">opus-4-0626</div>
    </div>
  );
});
