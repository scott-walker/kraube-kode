import { memo } from 'react';
import { timeAgo } from '../../utils/format';
import type { SessionInfo } from '../../core/types/session';

interface Props {
  session: SessionInfo;
  selected: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export default memo(function SessionRow({ session, selected, isActive, onToggle, onClick }: Props) {
  const name = session.summary && session.summary !== '.' ? session.summary : 'Untitled';

  return (
    <div className={`session-row${selected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`} onClick={onClick}>
      <label className="session-row__check" onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onToggle} />
      </label>
      <span className="session-row__name">{name}</span>
      {session.gitBranch && <span className="session-row__branch">{session.gitBranch}</span>}
      <span className="session-row__time">{timeAgo(session.lastModified)}</span>
      {isActive && <span className="session-row__active-dot" />}
    </div>
  );
});
