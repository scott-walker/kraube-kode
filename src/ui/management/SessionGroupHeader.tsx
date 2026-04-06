import { memo } from 'react';
import { Icons } from '../../icons';

interface Props {
  project: string;
  count: number;
  selectedCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleSelect: () => void;
}

export default memo(function SessionGroupHeader({
  project, count, selectedCount, collapsed, onToggleCollapse, onToggleSelect,
}: Props) {
  const allSelected = selectedCount === count;
  const partial = selectedCount > 0 && !allSelected;

  return (
    <div className="session-group__header">
      <label className="session-group__check" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={allSelected}
          ref={el => { if (el) el.indeterminate = partial; }}
          onChange={onToggleSelect}
        />
      </label>
      <button className="session-group__toggle" onClick={onToggleCollapse}>
        <span className={`session-group__chevron${collapsed ? '' : ' is-open'}`}><Icons.ChevronRight size={14} /></span>
        <span className="session-group__name">{project}</span>
        <span className="session-group__count">{count}</span>
      </button>
    </div>
  );
});
