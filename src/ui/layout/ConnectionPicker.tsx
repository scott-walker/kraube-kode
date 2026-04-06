import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import type { Connection } from '../../types';
import './ConnectionPicker.css';

interface Props {
  connections: Connection[];
  activeId: string;
  statusLabel: string;
  onSwitch: (id: string) => void;
}

const MENU_GAP = 4;

export default memo(function ConnectionPicker({ connections, activeId, statusLabel, onSwitch }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const active = connections.find(c => c.id === activeId);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuStyle({ top: rect.bottom + MENU_GAP, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(updatePosition);
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  const select = (id: string) => { onSwitch(id); setOpen(false); };

  return (
    <div className="conn-picker" ref={ref}>
      <button ref={triggerRef} className={`conn-picker__trigger${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)}>
        <span className={`topbar__status-dot topbar__status-dot--${statusLabel}`} />
        <span className="conn-picker__name">{active?.name ?? 'No connection'}</span>
        <span className="conn-picker__status">{statusLabel}</span>
        <span className={`conn-picker__chevron${open ? ' is-open' : ''}`}>
          <Icons.ChevronRight size={14} />
        </span>
      </button>
      {open && (
        <div ref={menuRef} className="conn-picker__menu" style={menuStyle}>
          {connections.map(c => (
            <button key={c.id} className={`conn-picker__item${c.id === activeId ? ' is-active' : ''}`}
              onClick={() => select(c.id)}>
              {c.name}
            </button>
          ))}
          <div className="conn-picker__divider" />
          <button className="conn-picker__item" onClick={() => select('__manage__')}>
            Manage Connections…
          </button>
        </div>
      )}
    </div>
  );
});
