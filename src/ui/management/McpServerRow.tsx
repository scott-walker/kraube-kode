import { memo, useState } from 'react';
import { Icons } from '../../icons';
import { toggleMcpServer, reconnectMcpServer } from '../../state/mcp-actions';
import type { McpServer } from '../../core/types/mcp';
import './McpManager.css';

const STATUS_CLASS: Record<string, string> = {
  connected: 'connected', failed: 'failed', error: 'failed', pending: 'pending',
  'needs-auth': 'needs-auth', disabled: 'disabled',
};

export default memo(function McpServerRow({ server }: { server: McpServer }) {
  const [expanded, setExpanded] = useState(false);
  const isEnabled = server.status !== 'disabled';

  return (
    <div className="mcp-mgr-row">
      <button className="mcp-mgr-row__main" onClick={() => setExpanded(!expanded)}>
        <span className={`mcp-mgr-row__dot mcp-mgr-row__dot--${STATUS_CLASS[server.status] ?? 'disabled'}`} />
        <span className="mcp-mgr-row__name">{server.name}</span>
        <span className={`mcp-scope-badge mcp-scope-badge--${server.scope}`}>{server.scope}</span>
        <span className="mcp-mgr-row__tools">{server.tools.length} tools</span>
        {server.serverInfo && (
          <span className="mcp-mgr-row__version">v{server.serverInfo.version}</span>
        )}
        <span className="mcp-mgr-row__actions" onClick={e => e.stopPropagation()}>
          <button
            className="mcp-mgr-row__action"
            title={isEnabled ? 'Disable' : 'Enable'}
            onClick={() => toggleMcpServer(server.name, !isEnabled)}
          >
            {isEnabled ? <Icons.ToggleRight size={14} /> : <Icons.ToggleLeft size={14} />}
          </button>
          <button
            className="mcp-mgr-row__action"
            title="Reconnect"
            onClick={() => reconnectMcpServer(server.name)}
          >
            <Icons.Power size={14} />
          </button>
        </span>
        <span className={`mcp-mgr-row__chevron${expanded ? ' is-open' : ''}`}>
          <Icons.ChevronRight size={14} />
        </span>
      </button>

      {server.error && <div className="mcp-mgr-row__error">{server.error}</div>}

      {expanded && server.tools.length > 0 && (
        <div className="mcp-mgr-row__tool-list">
          {server.tools.map(tool => (
            <div key={tool.name} className="mcp-mgr-tool">
              <span className="mcp-mgr-tool__name">{tool.name}</span>
              {tool.description && <span className="mcp-mgr-tool__desc">{tool.description}</span>}
              {tool.annotations && (
                <span className="mcp-mgr-tool__badges">
                  {tool.annotations.readOnly && <span className="mcp-tool-badge mcp-tool-badge--read-only">read-only</span>}
                  {tool.annotations.destructive && <span className="mcp-tool-badge mcp-tool-badge--destructive">destructive</span>}
                  {tool.annotations.openWorld && <span className="mcp-tool-badge mcp-tool-badge--open-world">open-world</span>}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
