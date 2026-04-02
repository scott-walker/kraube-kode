import { memo, useCallback, useMemo, useState } from 'react';
import { Icons } from '../../icons';
import { useSessions, useSessionsLoading, useActiveSessionId } from '../../state/selectors';
import { newSession, selectSession, deleteSession } from '../../state/actions';
import { sessionInfoToUI } from '../../utils/format';
import PulsingDots from '../inference/PulsingDots';
import ContextMenu, { type ContextMenuItem } from '../shared/ContextMenu';
import ConfirmDialog from '../shared/ConfirmDialog';
import './SessionsTab.css';

interface MenuState { x: number; y: number; sessionId: string }

export default memo(function SessionsTab() {
  const sessions = useSessions();
  const sessionsLoading = useSessionsLoading();
  const activeSessionId = useActiveSessionId();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const uiSessions = useMemo(
    () => sessions
      .map(s => sessionInfoToUI(s, s.sessionId === activeSessionId)),
    [sessions, activeSessionId],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, sessionId });
  }, []);

  const menuItems: ContextMenuItem[] = menu ? [
    { label: 'Delete Session', danger: true, onClick: () => setDeleteTarget(menu.sessionId) },
  ] : [];

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteSession(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget]);

  return (
    <div>
      <div className="sessions-tab__sticky-header">
        <button onClick={newSession} className="sessions-tab__new-btn">
          <Icons.Plus size={16} />
          New Session
        </button>
      </div>
      {sessionsLoading && uiSessions.length === 0 && (
        <div className="sessions-tab__loading">
          <PulsingDots />
        </div>
      )}
      {uiSessions.map(s => (
        <button
          key={s.id}
          onClick={() => selectSession(s.id)}
          onContextMenu={(e) => handleContextMenu(e, s.id)}
          className={`session-item${activeSessionId === s.id ? ' is-active' : ''}${menu?.sessionId === s.id ? ' is-context-target' : ''}`}
        >
          <div className="session-item__title-row">
            {s.active && <span className="session-item__active-dot" />}
            <span className="session-item__name">{s.name}</span>
          </div>
          <div className={`session-item__meta${s.active ? ' session-item__meta--indented' : ''}`}>
            <span className="session-item__time">{s.time}</span>
          </div>
        </button>
      ))}
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Session"
          message="This session will be permanently deleted. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
});
