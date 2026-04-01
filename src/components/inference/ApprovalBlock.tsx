import { Icons } from '../../icons';

interface Props {
  tool: string;
  command: string;
  onApprove: () => void;
  onDeny: () => void;
  onAlwaysAllow?: () => void;
}

const btnBase = {
  padding: '7px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
  transition: 'opacity 0.2s',
} as const;

export default function ApprovalBlock({ tool, command, onApprove, onDeny, onAlwaysAllow }: Props) {
  return (
    <div style={{
      padding: 16, borderRadius: 12, background: 'var(--bg-elevated)',
      borderLeft: '2px solid var(--warning)', animation: 'slide-up 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icons.AlertCircle size={16} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>Permission Required</span>
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--fg-secondary)',
        padding: '8px 12px', background: 'var(--bg-code)', borderRadius: 8, marginBottom: 12,
      }}>
        <span style={{ color: 'var(--fg-tertiary)' }}>{tool}:</span> {command}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onApprove} style={{ ...btnBase, background: 'var(--accent)', color: '#fff' }}>Allow</button>
        <button onClick={onDeny} style={{ ...btnBase, background: 'var(--bg-tertiary)', color: 'var(--fg-secondary)' }}>Deny</button>
        <button onClick={onAlwaysAllow} style={{ ...btnBase, marginLeft: 'auto', background: 'var(--bg-tertiary)', color: 'var(--fg-tertiary)', fontWeight: 500 }}>Always allow</button>
      </div>
    </div>
  );
}
