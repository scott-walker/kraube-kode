import { Icons } from '../../icons';
import PulsingDots from './PulsingDots';
import type { ThinkingPhase } from '../../types';

const phases: Record<ThinkingPhase, { icon: React.ReactNode; label: string; color: string }> = {
  thinking: { icon: <Icons.Brain size={14} />, label: 'Thinking', color: 'var(--accent)' },
  planning: { icon: <Icons.Layers size={14} />, label: 'Planning', color: 'var(--warning)' },
  reading: { icon: <Icons.Eye size={14} />, label: 'Reading files', color: 'var(--info)' },
  searching: { icon: <Icons.Search size={14} />, label: 'Searching codebase', color: 'var(--info)' },
  subagent: { icon: <Icons.Users size={14} />, label: 'Sub-agent working', color: 'var(--success)' },
};

interface Props {
  phase: ThinkingPhase;
  content?: string;
}

export default function ThinkingBlock({ phase, content }: Props) {
  const p = phases[phase] || phases.thinking;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)',
      borderLeft: `2px solid ${p.color}`, marginBottom: 8,
      animation: 'slide-up 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: content ? 6 : 0 }}>
        <span style={{ color: p.color, display: 'flex' }}>{p.icon}</span>
        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: p.color }}>{p.label}</span>
        {!content && <PulsingDots />}
      </div>
      {content && <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-tertiary)', paddingLeft: 22, fontStyle: 'italic' }}>{content}</div>}
    </div>
  );
}
