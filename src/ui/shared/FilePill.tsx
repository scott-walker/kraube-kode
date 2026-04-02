import { memo } from 'react';
import { Icons } from '../../icons';
import './FilePill.css';

interface Props {
  name: string;
  onRemove?: () => void;
}

export default memo(function FilePill({ name, onRemove }: Props) {
  return (
    <div className="file-pill">
      <Icons.File size={12} />
      <span>{name}</span>
      {onRemove && (
        <button onClick={onRemove} className="file-pill__remove">
          <Icons.X size={12} />
        </button>
      )}
    </div>
  );
});
