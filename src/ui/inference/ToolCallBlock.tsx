import { Icons } from '../../icons';
import PulsingDots from './PulsingDots';
import type { ToolStatus } from '../../types';
import './ToolCallBlock.css';

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
    <div className="tool-call" data-status={status}>
      <span className="tool-call__icon">
        {isRunning
          ? <span className="flex animate-spin-fast"><Icons.Refresh size={14} /></span>
          : isError
            ? <Icons.AlertCircle size={14} />
            : <Icons.Check size={14} />}
      </span>
      <span className="tool-call__name">{name}</span>
      {detail && <span className="tool-call__detail">{detail}</span>}
      <span className="tool-call__status">
        {isRunning ? <PulsingDots /> : duration ? `${duration}s` : ''}
      </span>
    </div>
  );
}
