import { memo, useState, useEffect } from 'react';
import { Icons } from '../../icons';
import Tooltip from './Tooltip';
import './FilePill.css';

const IMAGE_EXTS = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

interface Props {
  name: string;
  onRemove?: () => void;
}

export default memo(function FilePill({ name, onRemove }: Props) {
  const displayName = name.includes('/') ? name.split('/').pop()! : name;
  const isImage = IMAGE_EXTS.test(name);
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    window.claude.readThumbnail(name, 48).then(url => {
      if (!cancelled && url) setThumb(url);
    });
    return () => { cancelled = true; };
  }, [name, isImage]);

  if (thumb) {
    return (
      <div className="file-pill file-pill--image">
        <Tooltip text={displayName}>
          <img src={thumb} alt={displayName} className="file-pill__thumb" />
        </Tooltip>
        {onRemove && (
          <button onClick={onRemove} className="file-pill__remove">
            <span className="file-pill__remove-circle"><Icons.X size={10} /></span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="file-pill">
      <Icons.File size={12} />
      <span>{displayName}</span>
      {onRemove && (
        <button onClick={onRemove} className="file-pill__remove">
          <span className="file-pill__remove-circle"><Icons.X size={10} /></span>
        </button>
      )}
    </div>
  );
});
