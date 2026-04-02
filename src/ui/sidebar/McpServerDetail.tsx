import { memo, useState } from 'react';
import { Icons } from '../../icons';
import { toggleMcpServer, reconnectMcpServer, removeMcpServer } from '../../state/mcp-actions';
import Collapsible from '../shared/Collapsible';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { McpServer } from '../../core/types/mcp';
import './McpServerDetail.css';

interface Props {
  server: McpServer;
  onBack: () => void;
}

export default memo(function McpServerDetail({ server, onBack }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isEnabled = server.status !== 'disabled';

  return (
    <div className="mcp-detail">
      <div className="mcp-detail__sticky-header">
        <button className="mcp-detail__back-btn" onClick={onBack}>
          <Icons.ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      <div className="mcp-detail__header">
        <h3 className="mcp-detail__name">{server.name}</h3>
        <span className={`mcp-scope-badge mcp-scope-badge--${server.scope}`}>{server.scope}</span>
      </div>

      <div className="mcp-detail__status">
        <span className={`mcp-server__dot mcp-server__dot--${server.status === 'connected' ? 'connected' : server.status === 'failed' ? 'failed' : server.status === 'pending' ? 'pending' : server.status === 'needs-auth' ? 'needs-auth' : 'disabled'}`} />
        <span className="mcp-detail__status-text">{server.status}</span>
      </div>

      {server.error && (
        <div className="mcp-detail__error">{server.error}</div>
      )}

      {server.serverInfo && (
        <div className="mcp-detail__info">
          <span className="mcp-detail__info-label">Server</span>
          <span>{server.serverInfo.name} v{server.serverInfo.version}</span>
        </div>
      )}

      <div className="mcp-detail__actions">
        <button
          className="mcp-detail__action-btn"
          onClick={() => toggleMcpServer(server.name, !isEnabled)}
          title={isEnabled ? 'Disable' : 'Enable'}
        >
          {isEnabled ? <Icons.ToggleRight size={16} /> : <Icons.ToggleLeft size={16} />}
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
        <button
          className="mcp-detail__action-btn"
          onClick={() => reconnectMcpServer(server.name)}
          title="Reconnect"
        >
          <Icons.Power size={14} />
          Reconnect
        </button>
        <button
          className="mcp-detail__action-btn mcp-detail__action-btn--danger"
          onClick={() => setConfirmRemove(true)}
          title="Remove"
        >
          <Icons.Trash size={14} />
          Remove
        </button>
      </div>

      {server.tools.length > 0 && (
        <Collapsible title="Tools" icon={<Icons.Terminal size={12} />} badge={server.tools.length} defaultOpen>
          <div className="mcp-detail__tools">
            {server.tools.map(tool => (
              <div key={tool.name} className="mcp-detail__tool">
                <div className="mcp-detail__tool-name">{tool.name}</div>
                {tool.description && <div className="mcp-detail__tool-desc">{tool.description}</div>}
                {tool.annotations && (
                  <div className="mcp-detail__tool-badges">
                    {tool.annotations.readOnly && <span className="mcp-tool-badge mcp-tool-badge--read-only">read-only</span>}
                    {tool.annotations.destructive && <span className="mcp-tool-badge mcp-tool-badge--destructive">destructive</span>}
                    {tool.annotations.openWorld && <span className="mcp-tool-badge mcp-tool-badge--open-world">open-world</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="Remove MCP Server"
          message={`Remove "${server.name}" from active servers?`}
          confirmLabel="Remove"
          danger
          onConfirm={() => { removeMcpServer(server.name); onBack(); }}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
    </div>
  );
});
