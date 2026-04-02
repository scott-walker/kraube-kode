import { useMemo } from 'react';
import { useSessions, useActiveSessionId } from '../state/selectors';
import { newSession, selectSession } from '../state/actions';
import { sessionInfoToUI } from '../utils/format';

export function useSession() {
  const sessions = useSessions();
  const activeSessionId = useActiveSessionId();
  const uiSessions = useMemo(
    () => sessions.map(s => sessionInfoToUI(s, s.sessionId === activeSessionId)),
    [sessions, activeSessionId],
  );
  const activeUISession = uiSessions.find(s => s.id === activeSessionId) ?? null;
  return { sessions: uiSessions, activeSessionId, activeUISession, newSession, selectSession };
}
