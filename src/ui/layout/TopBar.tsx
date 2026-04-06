import { memo, useMemo } from 'react';
import { useIsStreaming, useSidebarOpen, useSessions, useActiveSessionId, useSdkStatus, useActiveCwd, useCurrentView, useSettingsSection, useManagementSection, useConnections, useActiveConnection } from '../../state/selectors';
import type { SettingsSection, ManagementSection } from '../../state/store';
import { setSidebarOpen, navigateToSettings, setSettingsSection } from '../../state/actions';
import { switchConnection } from '../../state/connection-actions';
import { sessionInfoToUI } from '../../utils/format';
import ConnectionPicker from './ConnectionPicker';
import Tooltip from '../shared/Tooltip';
import WindowControls from './WindowControls';
import { Icons } from '../../icons';
import './TopBar.css';

const SECTION_LABELS: Record<SettingsSection, string> = {
  connections: 'Connections',
  permissions: 'Permissions',
  voice: 'Voice Input',
  appearance: 'Appearance',
};

const MANAGEMENT_LABELS: Record<ManagementSection, string> = {
  sessions: 'Session Management',
  mcp: 'MCP Server Management',
  memory: 'Memory Management',
};

export default memo(function TopBar() {
  const isStreaming = useIsStreaming();
  const sidebarOpen = useSidebarOpen();
  const sdkStatus = useSdkStatus();
  const activeCwd = useActiveCwd();
  const sessions = useSessions();
  const activeSessionId = useActiveSessionId();
  const currentView = useCurrentView();
  const settingsSection = useSettingsSection();
  const managementSection = useManagementSection();
  const connections = useConnections();
  const activeConn = useActiveConnection();

  const activeSession = useMemo(
    () => sessions.map(s => sessionInfoToUI(s, s.sessionId === activeSessionId)).find(s => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const connOptions = useMemo(() => {
    const opts = connections.map(c => ({ value: c.id, label: c.name }));
    opts.push({ value: '__manage__', label: 'Manage Connections…' });
    return opts;
  }, [connections]);

  const handleConnChange = (value: string) => {
    if (value === '__manage__') {
      navigateToSettings();
      setSettingsSection('connections');
    } else {
      switchConnection(value);
    }
  };

  const statusLabel = sdkStatus === 'initializing' ? 'initializing'
    : sdkStatus === 'error' ? 'error'
    : isStreaming ? 'streaming' : 'ready';
  const name = activeSession?.name ?? 'New Session';
  const project = activeCwd ? activeCwd.split('/').pop() || activeCwd : '';
  const parentPath = activeCwd ? activeCwd.slice(0, activeCwd.lastIndexOf('/') + 1) : '';

  return (
    <div className="topbar">
      {sidebarOpen && (
        <button className="topbar__toggle-btn" onClick={() => setSidebarOpen(false)}>
          <Icons.Sidebar size={18} />
        </button>
      )}
      <div className="topbar__session">
        {currentView === 'settings' ? (
          <span className="topbar__session-name">{SECTION_LABELS[settingsSection]}</span>
        ) : currentView === 'management' ? (
          <span className="topbar__session-name">{MANAGEMENT_LABELS[managementSection]}</span>
        ) : (
          <>
            <div className="topbar__session-info">
              <Tooltip text={name}>
                <span className="topbar__session-name">{name}</span>
              </Tooltip>
              <div className="topbar__session-path">
                {parentPath && <span className="topbar__session-cwd">{parentPath}</span>}
                {project && (
                  <Tooltip text={activeCwd}>
                    <span className="topbar__session-project shrink-0">{project}</span>
                  </Tooltip>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {connections.length > 0 && (
        <ConnectionPicker
          connections={connections}
          activeId={activeConn?.id ?? ''}
          statusLabel={statusLabel}
          onSwitch={handleConnChange}
        />
      )}
      <WindowControls />
    </div>
  );
});
