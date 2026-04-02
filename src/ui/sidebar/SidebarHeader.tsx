import { memo } from 'react';
import { Icons } from '../../icons';

export default memo(function SidebarHeader() {
  return (
    <div className="sidebar__header">
      <div className="sidebar__logo">
        <Icons.Terminal size={14} />
      </div>
      <div>
        <div className="sidebar__brand-name">Kraube Kode</div>
        <div className="sidebar__brand-version">v1.0.42 — opus-4</div>
      </div>
    </div>
  );
});
