import { Icons } from '../../icons';
import PulsingDots from './PulsingDots';
import type { ThinkingPhase } from '../../types';
import './ThinkingBlock.css';

const PHASE_LABELS: Record<ThinkingPhase, { icon: React.ReactNode; label: string }> = {
  thinking: { icon: <Icons.Brain size={14} />,   label: 'Thinking' },
  planning: { icon: <Icons.Layers size={14} />,  label: 'Planning' },
  reading:  { icon: <Icons.Eye size={14} />,     label: 'Reading files' },
  searching:{ icon: <Icons.Search size={14} />,  label: 'Searching codebase' },
  subagent: { icon: <Icons.Users size={14} />,   label: 'Sub-agent working' },
};

interface Props {
  phase: ThinkingPhase;
  content?: string;
}

export default function ThinkingBlock({ phase, content }: Props) {
  const p = PHASE_LABELS[phase] || PHASE_LABELS.thinking;
  return (
    <div className="thinking-block" data-phase={phase}>
      <div className={`thinking-block__header${content ? ' thinking-block__header--with-content' : ''}`}>
        <span className="thinking-block__icon">{p.icon}</span>
        <span className="thinking-block__label">{p.label}</span>
        {!content && <PulsingDots />}
      </div>
      {content && <div className="thinking-block__content">{content}</div>}
    </div>
  );
}
