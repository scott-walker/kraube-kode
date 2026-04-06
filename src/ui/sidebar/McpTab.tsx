import { memo, useState } from 'react';
import { Icons } from '../../icons';
import { useMcpServersByScope, useMcpLoading, useMcpSelectedServer, useSdkStatus } from '../../state/selectors';
import { refreshMcpServers, selectMcpServer } from '../../state/mcp-actions';
import { navigateToManagement } from '../../state/actions';
import McpServerDetail from './McpServerDetail';
import McpAddServerForm from './McpAddServerForm';
import Tooltip from '../shared/Tooltip';
import PulsingDots from '../inference/PulsingDots';
import type { McpServer, McpScope } from '../../core/types/mcp';
import './McpTab.css';

type View = 'list' | 'detail' | 'add';

const SCOPE_META: Record<McpScope, { label: string; icon: typeof Icons.Globe }> = {
  project:     { label: 'Project',     icon: Icons.Folder },
  global:      { label: 'Global',      icon: Icons.Globe },
  marketplace: { label: 'Marketplace', icon: Icons.Store },
};

const SCOPE_ORDER: McpScope[] = ['project', 'global', 'marketplace'];

function ServerRow({ server }: { server: McpServer }) {
  const statusClass = server.status === 'connected' ? 'connected'
    : server.status === 'failed' ? 'failed'
    : server.status === 'pending' ? 'pending'
    : server.status === 'needs-auth' ? 'needs-auth'
    : 'disabled';

  return (
    <button className="mcp-server" onClick={() => selectMcpServer(server.name)}>
      <span className={`mcp-server__dot mcp-server__dot--${statusClass}`} />
      <div className="mcp-server__info">
        <div className="mcp-server__name">{server.name}</div>
        <div className="mcp-server__tools">{server.tools.length} tools</div>
      </div>
      <span className={`mcp-scope-badge mcp-scope-badge--${server.scope}`}>
        {server.scope}
      </span>
    </button>
  );
}

export default memo(function McpTab() {
  const grouped = useMcpServersByScope();
  const loading = useMcpLoading();
  const selected = useMcpSelectedServer();
  const sdkStatus = useSdkStatus();
  const [view, setView] = useState<View>('list');

  if (view === 'add') {
    return <McpAddServerForm onClose={() => setView('list')} />;
  }

  if (selected) {
    return <McpServerDetail server={selected} onBack={() => selectMcpServer(null)} />;
  }

  const hasServers = SCOPE_ORDER.some(s => grouped[s]?.length > 0);
  const showLoader = (sdkStatus === 'initializing' || loading) && !hasServers;

  return (
    <div>
      <button className="sessions-tab__manage" onClick={() => navigateToManagement('mcp')}>
        Manage all servers
      </button>
      <div className="mcp-tab__header">
        <span className="mcp-tab__title">MCP Servers</span>
        <Tooltip text="Add MCP server">
          <button className="mcp-tab__icon-btn" onClick={() => setView('add')}>
            <Icons.Plus size={14} />
          </button>
        </Tooltip>
        <Tooltip text="Refresh servers">
          <button
            className="mcp-tab__icon-btn"
            onClick={refreshMcpServers}
            disabled={loading}
          >
            <Icons.Refresh size={14} />
          </button>
        </Tooltip>
      </div>

      {showLoader && (
        <div className="mcp-tab__loading"><PulsingDots /></div>
      )}

      {SCOPE_ORDER.map(scope => {
        const servers = grouped[scope];
        if (!servers || servers.length === 0) return null;
        const { label, icon: ScopeIcon } = SCOPE_META[scope];
        return (
          <div key={scope} className="mcp-tab__scope-group">
            <div className="mcp-tab__scope-heading">
              <ScopeIcon size={12} />
              <span>{label}</span>
            </div>
            {servers.map(s => <ServerRow key={s.name} server={s} />)}
          </div>
        );
      })}
    </div>
  );
});
