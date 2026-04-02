import { memo, useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SidebarTabs, { type SidebarTab } from './SidebarTabs';
import SidebarFooter from './SidebarFooter';
import SessionsTab from './SessionsTab';
import McpTab from './McpTab';
import MemoryTab from './MemoryTab';
import './Sidebar.css';

export default memo(function Sidebar() {
  const [tab, setTab] = useState<SidebarTab>('sessions');

  return (
    <div className="sidebar">
      <SidebarHeader />
      <SidebarTabs active={tab} onChange={setTab} />
      <div className="sidebar__content">
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'mcp'      && <McpTab />}
        {tab === 'memory'   && <MemoryTab />}
      </div>
      <SidebarFooter />
    </div>
  );
});
