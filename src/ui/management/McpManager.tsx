import { memo, useMemo, useState } from 'react';
import { Icons } from '../../icons';
import Dropdown from '../shared/Dropdown';
import { useMcpServers, useMcpLoading, useSdkStatus } from '../../state/selectors';
import { refreshMcpServers, reconnectMcpServer, toggleMcpServer } from '../../state/mcp-actions';
import McpServerRow from './McpServerRow';
import PulsingDots from '../inference/PulsingDots';
import type { McpScope, McpStatus } from '../../core/types/mcp';
import './McpManager.css';

type StatusFilter = 'all' | McpStatus;
type ScopeFilter = 'all' | McpScope;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',        label: 'All statuses' },
  { value: 'connected',  label: 'Connected' },
  { value: 'failed',     label: 'Failed' },
  { value: 'error',      label: 'Error' },
  { value: 'disabled',   label: 'Disabled' },
  { value: 'pending',    label: 'Pending' },
  { value: 'needs-auth', label: 'Needs auth' },
];

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: 'all',         label: 'All scopes' },
  { value: 'project',     label: 'Project' },
  { value: 'global',      label: 'Global' },
  { value: 'marketplace', label: 'Marketplace' },
];

export default memo(function McpManager() {
  const servers = useMcpServers();
  const loading = useMcpLoading();
  const sdkStatus = useSdkStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return servers.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (scopeFilter !== 'all' && s.scope !== scopeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [servers, search, statusFilter, scopeFilter]);

  const failedCount = useMemo(() => servers.filter(s => s.status === 'failed').length, [servers]);

  const reconnectAllFailed = async () => {
    const failed = servers.filter(s => s.status === 'failed');
    for (const s of failed) await reconnectMcpServer(s.name);
  };

  const disableAllInScope = async (scope: McpScope) => {
    const targets = servers.filter(s => s.scope === scope && s.status !== 'disabled');
    for (const s of targets) await toggleMcpServer(s.name, false);
  };

  const showLoader = (sdkStatus === 'initializing' || loading) && servers.length === 0;

  return (
    <div className="mcp-mgr">
      <div className="mcp-mgr__toolbar">
        <div className="sessions-mgr__search-wrap">
          <Icons.Search size={14} />
          <input className="sessions-mgr__search" placeholder="Search servers…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dropdown options={STATUS_OPTIONS} value={statusFilter} onChange={v => setStatusFilter(v as StatusFilter)} />
        <Dropdown options={SCOPE_OPTIONS} value={scopeFilter} onChange={v => setScopeFilter(v as ScopeFilter)} />
        <button className="mcp-mgr__action-btn" onClick={refreshMcpServers} disabled={loading}>
          <Icons.Refresh size={14} />
          Refresh
        </button>
        {failedCount > 0 && (
          <button className="mcp-mgr__action-btn mcp-mgr__action-btn--warn" onClick={reconnectAllFailed}>
            <Icons.Power size={14} />
            Reconnect failed ({failedCount})
          </button>
        )}
        {scopeFilter !== 'all' && (
          <button className="mcp-mgr__action-btn" onClick={() => disableAllInScope(scopeFilter as McpScope)}>
            <Icons.ToggleLeft size={14} />
            Disable all {scopeFilter}
          </button>
        )}
      </div>

      {showLoader && <div className="sessions-mgr__loading"><PulsingDots /></div>}

      <div className="mcp-mgr__body">
        <div className="mcp-mgr__count">{filtered.length} server{filtered.length !== 1 ? 's' : ''}</div>
        {filtered.map(s => <McpServerRow key={s.name} server={s} />)}
        {filtered.length === 0 && !showLoader && (
          <div className="sessions-mgr__empty">No servers match the filter</div>
        )}
      </div>
    </div>
  );
});
