import { Icons } from '../../icons';
import './ApprovalBlock.css';

interface Props {
  tool: string;
  command: string;
  onApprove: () => void;
  onDeny: () => void;
  onAlwaysAllow?: () => void;
}

export default function ApprovalBlock({ tool, command, onApprove, onDeny, onAlwaysAllow }: Props) {
  return (
    <div className="approval-block">
      <div className="approval-block__header">
        <Icons.AlertCircle size={16} />
        <span className="approval-block__title">Permission Required</span>
      </div>
      <div className="approval-block__command">
        <span className="approval-block__tool-name">{tool}:</span> {command}
      </div>
      <div className="approval-block__actions">
        <button onClick={onApprove} className="approval-block__btn approval-block__btn--approve">Allow</button>
        <button onClick={onDeny} className="approval-block__btn approval-block__btn--deny">Deny</button>
        <button onClick={onAlwaysAllow} className="approval-block__btn approval-block__btn--always">Always allow</button>
      </div>
    </div>
  );
}
