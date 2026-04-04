import type { Session, SessionInfo } from '../types';

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export function isProbeSession(info: SessionInfo): boolean {
  return info.firstPrompt === '.' && (!info.summary || info.summary === '.');
}

export function sessionInfoToUI(info: SessionInfo, isActive: boolean): Session {
  const name = info.summary && info.summary !== '.' ? info.summary : 'Untitled';
  const project = info.cwd ? info.cwd.split('/').pop() || info.cwd : '';
  return {
    id: info.sessionId,
    name,
    project,
    time: timeAgo(info.lastModified),
    active: isActive,
  };
}
