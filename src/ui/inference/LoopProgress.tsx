import { Icons } from '../../icons';
import './LoopProgress.css';

interface Props {
  current: number;
  total: number;
  label: string;
}

export default function LoopProgress({ current, total, label }: Props) {
  const pct = (current / total) * 100;
  return (
    <div className="loop-progress">
      <span className="loop-progress__icon animate-spin">
        <Icons.Loop size={14} />
      </span>
      <span className="loop-progress__label">{label}</span>
      <div className="loop-progress__track">
        <div className="loop-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="loop-progress__count">{current}/{total}</span>
    </div>
  );
}
