import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveSessionId } from '../../state/selectors';
import { deleteSession } from '../../state/actions';
import type { SessionInfo } from '../../core/types/session';
import SessionGroupHeader from './SessionGroupHeader';
import SessionRow from './SessionRow';
import SessionDetailModal from './SessionDetailModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import PulsingDots from '../inference/PulsingDots';
import Dropdown from '../shared/Dropdown';
import { Icons } from '../../icons';
import './SessionsManager.css';

type AgeFilter = 'all' | '7d' | '30d' | '90d';
const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '7d',  label: 'Older than 7d' },
  { value: '30d', label: 'Older than 30d' },
  { value: '90d', label: 'Older than 90d' },
];
const AGE_MS: Record<AgeFilter, number> = { all: 0, '7d': 7*86400000, '30d': 30*86400000, '90d': 90*86400000 };

interface Group { project: string; sessions: SessionInfo[] }

function groupByProject(sessions: SessionInfo[]): Group[] {
  const map = new Map<string, SessionInfo[]>();
  for (const s of sessions) {
    const project = s.cwd ? s.cwd.split('/').pop() || s.cwd : 'Unknown';
    (map.get(project) ?? (map.set(project, []), map.get(project)!)).push(s);
  }
  return Array.from(map, ([project, sessions]) => ({ project, sessions }))
    .sort((a, b) => b.sessions.length - a.sessions.length);
}

export default memo(function SessionsManager() {
  const activeSessionId = useActiveSessionId();
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');
  const [detailSession, setDetailSession] = useState<SessionInfo | null>(null);

  useEffect(() => {
    setLoading(true);
    window.claude.listSessions(9999)
      .then(s => { setAllSessions(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const projectDropdownOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of allSessions) {
      const p = s.cwd ? s.cwd.split('/').pop() || s.cwd : 'Unknown';
      counts.set(p, (counts.get(p) ?? 0) + 1);
    }
    const items = Array.from(counts, ([name, count]) => ({ value: name, label: `${name} (${count})` }))
      .sort((a, b) => b.label.localeCompare(a.label));
    return [{ value: 'all', label: 'All projects' }, ...items];
  }, [allSessions]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = AGE_MS[ageFilter];
    const q = search.toLowerCase();
    return allSessions.filter(s => {
      if (cutoff && (now - s.lastModified) < cutoff) return false;
      if (q && !(s.summary?.toLowerCase().includes(q) || s.cwd?.toLowerCase().includes(q))) return false;
      if (projectFilter !== 'all') {
        const p = s.cwd ? s.cwd.split('/').pop() || s.cwd : 'Unknown';
        if (p !== projectFilter) return false;
      }
      return true;
    });
  }, [allSessions, search, ageFilter, projectFilter]);

  const groups = useMemo(() => groupByProject(filtered), [filtered]);
  const allIds = useMemo(() => new Set(filtered.map(s => s.sessionId)), [filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const toggleGroup = useCallback((sessions: SessionInfo[]) => {
    setSelected(prev => {
      const n = new Set(prev);
      const ids = sessions.map(s => s.sessionId);
      const allIn = ids.every(id => n.has(id));
      ids.forEach(id => allIn ? n.delete(id) : n.add(id));
      return n;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(prev => prev.size === allIds.size ? new Set() : new Set(allIds));
  }, [allIds]);

  const handleRowClick = useCallback((id: string, e: React.MouseEvent) => {
    if (e.shiftKey) { toggleOne(id); return; }
    const session = allSessions.find(s => s.sessionId === id);
    if (session) setDetailSession(session);
  }, [toggleOne, allSessions]);

  const handleDetailDeleted = useCallback((id: string) => {
    setAllSessions(prev => prev.filter(s => s.sessionId !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    setDetailSession(null);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = [...selected];
    setDeleting(false);
    for (let i = 0; i < ids.length; i++) {
      setDeleteProgress(`Deleting ${i + 1} / ${ids.length}…`);
      await deleteSession(ids[i]);
    }
    setAllSessions(prev => prev.filter(s => !selected.has(s.sessionId)));
    setSelected(new Set());
    setDeleteProgress('');
  }, [selected]);

  const toggleCollapse = useCallback((project: string) => {
    setCollapsed(prev => { const n = new Set(prev); n.has(project) ? n.delete(project) : n.add(project); return n; });
  }, []);

  if (loading) return <div className="sessions-mgr__loading"><PulsingDots /></div>;

  return (
    <div className="sessions-mgr">
      <div className="sessions-mgr__toolbar">
        <div className="sessions-mgr__search-wrap">
          <Icons.Search size={14} />
          <input className="sessions-mgr__search" placeholder="Search sessions…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dropdown options={projectDropdownOptions} value={projectFilter} onChange={setProjectFilter} />
        <Dropdown options={AGE_OPTIONS} value={ageFilter} onChange={v => setAgeFilter(v as AgeFilter)} />
        <label className="sessions-mgr__select-all">
          <input type="checkbox" checked={selected.size === allIds.size && allIds.size > 0} onChange={toggleAll} />
          All ({filtered.length})
        </label>
        {selected.size > 0 && (
          <button className="sessions-mgr__delete-btn" onClick={() => setDeleting(true)}>
            <Icons.Trash size={14} />
            Delete {selected.size}
          </button>
        )}
        {deleteProgress && <span className="sessions-mgr__progress">{deleteProgress}</span>}
      </div>

      <div className="sessions-mgr__body">
        {groups.map(g => (
          <div key={g.project} className="session-group">
            <SessionGroupHeader
              project={g.project}
              count={g.sessions.length}
              selectedCount={g.sessions.filter(s => selected.has(s.sessionId)).length}
              collapsed={collapsed.has(g.project)}
              onToggleCollapse={() => toggleCollapse(g.project)}
              onToggleSelect={() => toggleGroup(g.sessions)}
            />
            {!collapsed.has(g.project) && g.sessions.map(s => (
              <SessionRow
                key={s.sessionId}
                session={s}
                selected={selected.has(s.sessionId)}
                isActive={s.sessionId === activeSessionId}
                onToggle={() => toggleOne(s.sessionId)}
                onClick={(e) => handleRowClick(s.sessionId, e)}
              />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sessions-mgr__empty">No sessions match the filter</div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title={`Delete ${selected.size} sessions?`}
          message="This action is permanent and cannot be undone."
          confirmLabel={`Delete ${selected.size}`}
          danger
          onConfirm={handleBulkDelete}
          onCancel={() => setDeleting(false)}
        />
      )}
      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          isActive={detailSession.sessionId === activeSessionId}
          onClose={() => setDetailSession(null)}
          onDeleted={handleDetailDeleted}
        />
      )}
    </div>
  );
});
