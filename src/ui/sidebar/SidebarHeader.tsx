import { memo } from 'react';
import { useTheme, useOverlayActive } from '../../state/selectors';
import NewSessionButton from '../shared/NewSessionButton';
import logoSvg from '../../../etc/logo.svg';
import bannerDark from '../../assets/brand-banner-dark.svg';
import bannerLight from '../../assets/brand-banner-light.svg';

export default memo(function SidebarHeader() {
  const theme = useTheme();
  const overlayActive = useOverlayActive();
  const banner = (theme === 'dark' || overlayActive) ? bannerDark : bannerLight;

  return (
    <div className="sidebar__header">
      <img className="sidebar__logo" src={logoSvg} alt="" />
      <img
        className="sidebar__brand-banner"
        src={banner}
        alt="Kraube Kode"
      />
      <NewSessionButton tooltipPosition="left" />
    </div>
  );
});
