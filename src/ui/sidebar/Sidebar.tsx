import { memo, useCallback, useState } from 'react';
import { Icons } from '../../icons';
import { useCurrentView, useManagementSection } from '../../state/selectors';
import { navigateToManagement, setManagementSection } from '../../state/actions';
import type { ManagementSection } from '../../state/store';
import SidebarHeader from './SidebarHeader';
import SidebarTabs, { type SidebarTab } from './SidebarTabs';
import SidebarFooter from './SidebarFooter';
import SessionsTab from './SessionsTab';
import SettingsNav from '../settings/SettingsNav';
import './Sidebar.css';

const MGMT_ITEMS: { id: ManagementSection; label: string; icon: React.ReactNode }[] = [
  { id: 'sessions', label: 'Sessions',    icon: <Icons.Terminal size={14} /> },
  { id: 'mcp',      label: 'MCP Servers', icon: <Icons.Plug size={14} /> },
  { id: 'memory',   label: 'Memory',      icon: <Icons.Memory size={14} /> },
];

export default memo(function Sidebar() {
  const currentView = useCurrentView();
  const activeSection = useManagementSection();
  const [tab, setTab] = useState<SidebarTab>(currentView === 'management' ? 'management' : 'sessions');

  const handleTabChange = useCallback((t: SidebarTab) => {
    setTab(t);
  }, []);

  const handleMgmtItem = useCallback((id: ManagementSection) => {
    setManagementSection(id);
    if (currentView !== 'management') navigateToManagement(id);
  }, [currentView]);

  return (
    <div className="sidebar">
      <SidebarHeader />
      {currentView === 'settings' ? (
        <SettingsNav />
      ) : (
        <>
          <SidebarTabs active={tab} onChange={handleTabChange} />
          <div className="sidebar__content">
            {tab === 'sessions' && <SessionsTab />}
            {tab === 'management' && (
              <div className="settings-nav__list">
                {MGMT_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleMgmtItem(item.id)}
                    className={`settings-nav__item${activeSection === item.id ? ' is-active' : ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <SidebarFooter />
    </div>
  );
});
