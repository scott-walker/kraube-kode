import { memo } from 'react';
import { Icons } from '../../icons';
import { useTheme } from '../../state/selectors';
import { toggleTheme } from '../../state/actions';
import './sections.css';

export default memo(function AppearanceSection() {
  const isDark = useTheme() === 'dark';

  return (
    <>
      <div className="settings-theme-grid">
        {[
          { icon: <Icons.Moon size={18} />, label: 'Dark',  active: isDark },
          { icon: <Icons.Sun size={18} />,  label: 'Light', active: !isDark },
        ].map(opt => (
          <button key={opt.label} onClick={toggleTheme}
            className={`settings-theme-btn${opt.active ? ' is-active' : ''}`}>
            {opt.icon}{opt.label}
          </button>
        ))}
      </div>
    </>
  );
});
