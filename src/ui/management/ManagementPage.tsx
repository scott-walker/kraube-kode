import { memo } from 'react';
import { useManagementSection } from '../../state/selectors';
import SessionsManager from './SessionsManager';
import McpManager from './McpManager';
import MemoryManager from './MemoryManager';
import './ManagementPage.css';

export default memo(function ManagementPage() {
  const section = useManagementSection();

  return (
    <div className="management-page">
      <div className="management-page__content">
        {section === 'sessions' && <SessionsManager />}
        {section === 'mcp'      && <McpManager />}
        {section === 'memory'   && <MemoryManager />}
      </div>
    </div>
  );
});
