import { memo, useCallback } from 'react';
import { useToolbarModel, useToolbarPermission, useToolbarEffort } from '../../state/selectors';
import { cycleModel, cyclePermission, cycleEffort } from '../../state/actions';
import type { ToolbarPermission, ToolbarEffort } from '../../state/store';
import Tooltip from '../shared/Tooltip';
import { Icons } from '../../icons';

const MODEL_LABELS: Record<string, string> = {
  sonnet: 'Sonnet',
  opus: 'Opus',
  haiku: 'Haiku',
};

const MODEL_TIPS: Record<string, string> = {
  sonnet: 'Balanced speed and quality',
  opus: 'Most capable, slower',
  haiku: 'Fastest, lightweight tasks',
};

const PERMISSION_LABELS: Record<ToolbarPermission, string> = {
  default: 'Default',
  acceptEdits: 'Accept Edits',
  plan: 'Plan Mode',
};

const PERMISSION_TIPS: Record<ToolbarPermission, string> = {
  default: 'Ask before tool use',
  acceptEdits: 'Auto-approve file edits',
  plan: 'Read-only, no modifications',
};

const EFFORT_LABELS: Record<ToolbarEffort, string> = {
  low: 'Quick',
  medium: 'Normal',
  high: 'Deep',
  max: 'Max',
};

const EFFORT_TIPS: Record<ToolbarEffort, string> = {
  low: 'Fast, minimal thinking',
  medium: 'Balanced speed and depth',
  high: 'Thorough reasoning',
  max: 'Maximum thinking budget',
};

export default memo(function InputToolbar() {
  const model = useToolbarModel();
  const permission = useToolbarPermission();
  const effort = useToolbarEffort();

  const handleModel = useCallback(() => cycleModel(), []);
  const handlePermission = useCallback(() => cyclePermission(), []);
  const handleEffort = useCallback(() => cycleEffort(), []);

  return (
    <div className="input-area__toolbar">
      <Tooltip text={MODEL_TIPS[model] ?? model}>
        <button onClick={handleModel} className="input-area__opt-btn is-active">
          <Icons.Brain size={12} />
          {MODEL_LABELS[model] ?? model}
        </button>
      </Tooltip>
      <Tooltip text={PERMISSION_TIPS[permission]}>
        <button
          onClick={handlePermission}
          className={`input-area__opt-btn${permission !== 'default' ? ' is-active' : ''}`}
        >
          <Icons.Check size={12} />
          {PERMISSION_LABELS[permission]}
        </button>
      </Tooltip>
      <Tooltip text={EFFORT_TIPS[effort]}>
        <button
          onClick={handleEffort}
          className={`input-area__opt-btn${effort !== 'high' ? ' is-active' : ''}`}
        >
          <Icons.Zap size={10} />
          {EFFORT_LABELS[effort]}
        </button>
      </Tooltip>
      <span className="input-area__hint">Ctrl+Enter to send</span>
    </div>
  );
});
