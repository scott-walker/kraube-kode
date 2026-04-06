import { memo, useCallback, useState } from 'react';
import { Icons } from '../../icons';
import { timeAgo } from '../../utils/format';
import { deleteSession } from '../../state/actions';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { SessionInfo } from '../../core/types/session';
import './SessionDetailModal.css';

interface Props {
  session: SessionInfo;
  isActive: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default memo(function SessionDetailModal({ session, isActive, onClose, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const name = session.summary && session.summary !== '.' ? session.summary : 'Untitled';
  const project = session.cwd ? session.cwd.split('/').pop() || session.cwd : 'Unknown';

  const handleDelete = useCallback(async () => {
    await deleteSession(session.sessionId);
    onDeleted(session.sessionId);
  }, [session.sessionId, onDeleted]);

  return (
    <div className="session-modal__overlay" onClick={onClose}>
      <div className="session-modal" onClick={e => e.stopPropagation()}>
        <div className="session-modal__header">
          <h3 className="session-modal__title">{name}</h3>
          <button className="session-modal__close" onClick={onClose}>
            <Icons.X size={18} />
          </button>
        </div>

        <div className="session-modal__meta">
          <MetaRow label="Session ID" value={session.sessionId} mono />
          <MetaRow label="Project" value={project} />
          {session.cwd && <MetaRow label="Working directory" value={session.cwd} mono />}
          {session.gitBranch && <MetaRow label="Git branch" value={session.gitBranch} mono />}
          <MetaRow label="Last modified" value={`${formatDate(session.lastModified)} (${timeAgo(session.lastModified)})`} />
          {session.firstPrompt && <MetaRow label="First prompt" value={session.firstPrompt} />}
          {isActive && <MetaRow label="Status" value="Active session" accent />}
        </div>

        <div className="session-modal__actions">
          <button className="session-modal__delete-btn" onClick={() => setConfirmDelete(true)}>
            <Icons.Trash size={14} />
            Delete session
          </button>
        </div>

        {confirmDelete && (
          <ConfirmDialog
            title="Delete session?"
            message="This session will be permanently deleted. This cannot be undone."
            confirmLabel="Delete"
            danger
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  );
});

function MetaRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className="session-modal__row">
      <span className="session-modal__label">{label}</span>
      <span className={`session-modal__value${mono ? ' session-modal__value--mono' : ''}${accent ? ' session-modal__value--accent' : ''}`}>
        {value}
      </span>
    </div>
  );
}
