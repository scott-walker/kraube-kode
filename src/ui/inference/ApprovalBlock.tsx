import { Icons } from '../../icons';
import { resolveApproval } from '../../state/actions';
import './ApprovalBlock.css';

interface Props {
  requestId: string;
  tool: string;
  command: string;
  resolved?: boolean;
  decision?: 'allow' | 'deny';
}

function handleApprove(requestId: string) {
  window.claude.respondPermission(requestId, 'allow');
  resolveApproval(requestId, 'allow');
}

function handleDeny(requestId: string) {
  window.claude.respondPermission(requestId, 'deny', 'User denied');
  resolveApproval(requestId, 'deny');
}

function handleAlwaysAllow(requestId: string) {
  window.claude.respondPermission(requestId, 'allow');
  resolveApproval(requestId, 'allow');
}

export default function ApprovalBlock({ requestId, tool, command, resolved, decision }: Props) {
  return (
    <div className={`approval-block ${resolved ? 'approval-block--resolved' : ''}`}>
      <div className="approval-block__header">
        <Icons.AlertCircle size={16} />
        <span className="approval-block__title">
          {resolved ? (decision === 'allow' ? 'Allowed' : 'Denied') : 'Permission Required'}
        </span>
      </div>
      <div className="approval-block__command">
        <span className="approval-block__tool-name">{tool}:</span> {command}
      </div>
      {!resolved && (
        <div className="approval-block__actions">
          <button onClick={() => handleApprove(requestId)} className="approval-block__btn approval-block__btn--approve">Allow</button>
          <button onClick={() => handleDeny(requestId)} className="approval-block__btn approval-block__btn--deny">Deny</button>
          <button onClick={() => handleAlwaysAllow(requestId)} className="approval-block__btn approval-block__btn--always">Always allow</button>
        </div>
      )}
    </div>
  );
}
