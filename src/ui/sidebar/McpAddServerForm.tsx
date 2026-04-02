import { memo, useState } from 'react';
import { Icons } from '../../icons';
import { addMcpServer } from '../../state/mcp-actions';
import SegmentedControl from '../shared/SegmentedControl';
import type { McpTransportType, McpServerConfig } from '../../core/types/mcp';
import './McpAddServerForm.css';

interface Props {
  onClose: () => void;
}

const TRANSPORT_SEGMENTS = [
  { value: 'stdio', label: 'stdio' },
  { value: 'http',  label: 'HTTP' },
  { value: 'sse',   label: 'SSE' },
];

function buildConfig(transport: McpTransportType, fields: typeof INITIAL_FIELDS): McpServerConfig {
  if (transport === 'stdio') {
    const args = fields.args.split(',').map(a => a.trim()).filter(Boolean);
    return { command: fields.command, ...(args.length > 0 && { args }) };
  }
  const headers = parseKV(fields.headers);
  return { type: transport, url: fields.url, ...(Object.keys(headers).length > 0 && { headers }) };
}

function parseKV(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const sep = line.indexOf('=');
    if (sep < 1) continue;
    result[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return result;
}

const INITIAL_FIELDS = { command: '', args: '', url: '', headers: '' };

export default memo(function McpAddServerForm({ onClose }: Props) {
  const [name, setName] = useState('');
  const [transport, setTransport] = useState<McpTransportType>('stdio');
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<typeof INITIAL_FIELDS>) => setFields(f => ({ ...f, ...patch }));

  const isValid = name.trim() && (
    transport === 'stdio' ? fields.command.trim() : fields.url.trim()
  );

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');
    const config = buildConfig(transport, fields);
    const result = await addMcpServer(name.trim(), config);
    setSaving(false);
    if (result.success) onClose();
    else setError(result.error ?? 'Failed to add server');
  };

  return (
    <div className="mcp-form">
      <button className="mcp-detail__back-btn" onClick={onClose}>
        <Icons.ArrowLeft size={14} />
        <span>Back</span>
      </button>

      <h3 className="mcp-form__title">Add MCP Server</h3>

      <div className="settings-form__group">
        <div>
          <label className="settings-form__label">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="my-server" className="settings-form__input" />
        </div>

        <div>
          <label className="settings-form__label">Transport</label>
          <SegmentedControl
            options={TRANSPORT_SEGMENTS}
            value={transport}
            onChange={v => setTransport(v as McpTransportType)}
          />
        </div>

        {transport === 'stdio' ? (
          <>
            <div>
              <label className="settings-form__label">Command</label>
              <input value={fields.command} onChange={e => update({ command: e.target.value })}
                placeholder="npx" className="settings-form__input" />
            </div>
            <div>
              <label className="settings-form__label">Arguments</label>
              <input value={fields.args} onChange={e => update({ args: e.target.value })}
                placeholder="-y, @some/mcp-server" className="settings-form__input" />
              <span className="settings-form__hint">Comma-separated</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="settings-form__label">URL</label>
              <input value={fields.url} onChange={e => update({ url: e.target.value })}
                placeholder="https://..." className="settings-form__input" />
            </div>
            <div>
              <label className="settings-form__label">Headers</label>
              <textarea value={fields.headers} onChange={e => update({ headers: e.target.value })}
                placeholder={"Authorization=Bearer token\nX-Custom=value"}
                className="settings-form__input mcp-form__textarea" rows={3} />
              <span className="settings-form__hint">One per line: key=value</span>
            </div>
          </>
        )}
      </div>

      {error && <div className="mcp-detail__error">{error}</div>}

      <div className="mcp-form__actions">
        <button className="mcp-form__cancel-btn" onClick={onClose}>Cancel</button>
        <button className="mcp-form__save-btn" onClick={handleSave} disabled={!isValid || saving}>
          {saving ? 'Adding…' : 'Add Server'}
        </button>
      </div>
    </div>
  );
});
