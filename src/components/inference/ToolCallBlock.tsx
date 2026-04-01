import { Icons } from '../../icons';
import PulsingDots from './PulsingDots';
import type { ToolStatus } from '../../types';

interface Props {
  name: string;
  status: ToolStatus;
  detail?: string;
  duration?: string;
}

export default function ToolCallBlock({ name, status, detail, duration }: Props) {
  const isRunning = status === 'running';
  const isError = status === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: 'var(--bg-elevated)', borderRadius: 8,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
      transition: 'all 0.3s ease',
    }}>
      <span style={{ display: 'flex', color: isError ? 'var(--error)' : isRunning ? 'var(--accent)' : 'var(--fg-tertiary)', transition: 'color 0.3s' }}>
        {isRunning ? <span style={{ animation: 'spin 1.5s linear infinite', display: 'flex' }}><Icons.Refresh size={14} /></span>
          : isError ? <Icons.AlertCircle size={14} />
          : <Icons.Check size={14} />}
      </span>
      <span style={{ color: 'var(--fg-primary)', fontWeight: 500 }}>{name}</span>
      {detail && <span style={{ color: 'var(--fg-tertiary)', fontSize: 11 }}>{detail}</span>}
      <span style={{ marginLeft: 'auto', color: 'var(--fg-tertiary)', fontSize: 11 }}>
        {isRunning ? <PulsingDots /> : duration ? `${duration}s` : ''}
      </span>
    </div>
  );
}
