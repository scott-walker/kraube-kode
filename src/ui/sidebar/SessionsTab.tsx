import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useSessions, useSessionsLoading, useSessionsLoadingMore,
  useSessionsHasMore, useActiveSessionId,
} from '../../state/selectors';
import { selectSession, deleteSession, loadMoreSessions, navigateToManagement } from '../../state/actions';
import { sessionInfoToUI } from '../../utils/format';
import PulsingDots from '../inference/PulsingDots';
import ContextMenu, { type ContextMenuItem } from '../shared/ContextMenu';
import ConfirmDialog from '../shared/ConfirmDialog';
import './SessionsTab.css';

interface MenuState { x: number; y: number; sessionId: string }

export default memo(function SessionsTab() {
  const sessions = useSessions();
  const sessionsLoading = useSessionsLoading();
  const loadingMore = useSessionsLoadingMore();
  const hasMore = useSessionsHasMore();
  const activeSessionId = useActiveSessionId();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const uiSessions = useMemo(
    () => sessions
      .map(s => sessionInfoToUI(s, s.sessionId === activeSessionId)),
    [sessions, activeSessionId],
  );

  // Infinite scroll — observe sentinel inside the nearest scrollable ancestor
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const scrollParent = el.closest('.sidebar__content') as HTMLElement | null;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreSessions(); },
      { root: scrollParent, rootMargin: '100px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      {sessionsLoading && uiSessions.length === 0 && (
        <div className="sessions-tab__loading">
          <PulsingDots />
        </div>
      )}
      {!sessionsLoading && uiSessions.length === 0 && (
        <div className="sessions-tab__empty">No sessions yet</div>
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
            {s.project && <span className="session-item__project">{s.project}</span>}
            <span className="session-item__time">{s.time}</span>
          </div>
        </button>
      ))}
      {hasMore && uiSessions.length > 0 && (
        <div ref={sentinelRef} className="sessions-tab__sentinel">
          {loadingMore && <PulsingDots />}
        </div>
      )}
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
