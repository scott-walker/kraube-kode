import { memo } from 'react';
import { Icons } from '../../icons';
import { newSession } from '../../state/actions';
import { useTheme } from '../../state/selectors';
import logoSvg from '../../../etc/logo.svg';
import bannerDark from '../../assets/brand-banner-dark.svg';
import bannerLight from '../../assets/brand-banner-light.svg';

export default memo(function SidebarHeader() {
  const theme = useTheme();
  const banner = theme === 'dark' ? bannerDark : bannerLight;

  return (
    <div className="sidebar__header">
      <img className="sidebar__logo" src={logoSvg} alt="" />
      <img
        className="sidebar__brand-banner"
        src={banner}
        alt="Kraube Kode"
      />
      <button
        className="sidebar__open-project-btn"
        onClick={newSession}
      >
        <Icons.Folder size={16} />
      </button>
    </div>
  );
});
