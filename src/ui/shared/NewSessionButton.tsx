import { memo } from 'react';
import { Icons } from '../../icons';
import { newSession } from '../../state/actions';
import Tooltip from './Tooltip';
import './NewSessionButton.css';

interface Props {
  tooltip?: boolean;
  tooltipPosition?: 'left' | 'right';
}

export default memo(function NewSessionButton({
  tooltip = true,
  tooltipPosition = 'right',
}: Props) {
  const button = (
    <button className="new-session-btn" onClick={newSession}>
      <Icons.Plus size={12} />
    </button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip text="New Session" position={tooltipPosition}>
      {button}
    </Tooltip>
  );
});
