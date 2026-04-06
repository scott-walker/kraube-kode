import { Icons } from '../../icons';
import { resolveElicitation } from '../../state/actions';
import './ElicitationBlock.css';

interface Props {
  requestId: string;
  serverName: string;
  message: string;
  mode?: 'form' | 'url';
  url?: string;
  resolved?: boolean;
  decision?: 'accept' | 'decline' | 'cancel';
}

function handleAccept(requestId: string) {
  window.claude.respondElicitation(requestId, 'accept');
  resolveElicitation(requestId, 'accept');
}

function handleDecline(requestId: string) {
  window.claude.respondElicitation(requestId, 'decline');
  resolveElicitation(requestId, 'decline');
}

function handleCancel(requestId: string) {
  window.claude.respondElicitation(requestId, 'cancel');
  resolveElicitation(requestId, 'cancel');
}

export default function ElicitationBlock({ requestId, serverName, message, mode, url, resolved, decision }: Props) {
  const statusLabel = resolved
    ? decision === 'accept' ? 'Accepted' : decision === 'decline' ? 'Declined' : 'Cancelled'
    : 'Input Requested';

  return (
    <div className={`elicitation-block ${resolved ? 'elicitation-block--resolved' : ''}`}>
      <div className="elicitation-block__header">
        <Icons.AlertCircle size={16} />
        <span className="elicitation-block__title">{statusLabel}</span>
        <span className="elicitation-block__server">{serverName}</span>
      </div>
      <div className="elicitation-block__message">{message}</div>
      {mode === 'url' && url && (
        <a className="elicitation-block__url" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      )}
      {!resolved && (
        <div className="elicitation-block__actions">
          <button onClick={() => handleAccept(requestId)} className="elicitation-block__btn elicitation-block__btn--accept">Accept</button>
          <button onClick={() => handleDecline(requestId)} className="elicitation-block__btn elicitation-block__btn--decline">Decline</button>
          <button onClick={() => handleCancel(requestId)} className="elicitation-block__btn elicitation-block__btn--cancel">Cancel</button>
        </div>
      )}
    </div>
  );
}
