import { memo, useMemo } from 'react';
import { useIsStreaming, useSidebarOpen, useSessions, useActiveSessionId, useSdkStatus, useActiveCwd } from '../../state/selectors';
import { setSidebarOpen } from '../../state/actions';
import { sessionInfoToUI } from '../../utils/format';
import Tooltip from '../shared/Tooltip';
import WindowControls from './WindowControls';
import { Icons } from '../../icons';
import logoSvg from '../../../etc/logo.svg';
import './TopBar.css';

export default memo(function TopBar() {
  const isStreaming = useIsStreaming();
  const sidebarOpen = useSidebarOpen();
  const sdkStatus = useSdkStatus();
  const activeCwd = useActiveCwd();
  const sessions = useSessions();
  const activeSessionId = useActiveSessionId();

  const activeSession = useMemo(
    () => sessions.map(s => sessionInfoToUI(s, s.sessionId === activeSessionId)).find(s => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const name = activeSession?.name ?? 'New Session';
  const project = activeCwd ? activeCwd.split('/').pop() || activeCwd : '';

  return (
    <div className="topbar">
      <button className="topbar__toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen
          ? <Icons.Sidebar size={18} />
          : <img src={logoSvg} alt="" width={28} height={28} />
        }
      </button>
      <div className="topbar__session">
        <div className="topbar__session-info">
          <Tooltip text={name}>
            <span className="topbar__session-name">{name}</span>
          </Tooltip>
          {activeCwd && <span className="topbar__session-cwd">{activeCwd}</span>}
        </div>
        {project && (
          <Tooltip text={activeCwd}>
            <span className="topbar__session-project shrink-0">{project}</span>
          </Tooltip>
        )}
      </div>
      <div className="topbar__status">
        {(() => {
          if (sdkStatus === 'initializing') return <>
            <span className="topbar__status-dot topbar__status-dot--initializing" />
            <span className="topbar__status-label">initializing</span>
          </>;
          if (sdkStatus === 'error') return <>
            <span className="topbar__status-dot topbar__status-dot--error" />
            <span className="topbar__status-label">error</span>
          </>;
          const label = isStreaming ? 'streaming' : 'ready';
          return <>
            <span className={`topbar__status-dot topbar__status-dot--${label}`} />
            <span className="topbar__status-label">{label}</span>
          </>;
        })()}
      </div>
      <WindowControls />
    </div>
  );
});
