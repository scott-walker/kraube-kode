import { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import './Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MENU_GAP = 4;

export default function Dropdown({ options, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [direction, setDirection] = useState<'down' | 'up'>('down');

  const selected = options.find(o => o.value === value);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 200;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;

    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    setDirection(openUp ? 'up' : 'down');

    const top = openUp
      ? rect.top - menuHeight - MENU_GAP
      : rect.bottom + MENU_GAP;

    setMenuStyle({ top, left: rect.left, minWidth: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;

    // Initial position (deferred so menuRef is mounted)
    requestAnimationFrame(updatePosition);

    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    // Close on external scroll (but not scroll inside the menu itself)
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  return (
    <div className="dropdown" ref={ref}>
      <button ref={triggerRef} className={`dropdown__trigger${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)}>
        <span className={`dropdown__label${!selected ? ' dropdown__label--placeholder' : ''}`}>
          {selected?.label ?? placeholder ?? 'Select…'}
        </span>
        <span className={`dropdown__chevron${open ? ' is-open' : ''}`}>
          <Icons.ChevronRight size={14} />
        </span>
      </button>
      {open && (
        <div
          ref={menuRef}
          className={`dropdown__menu dropdown__menu--${direction}`}
          style={menuStyle}
        >
          {options.map(opt => (
            <button key={opt.value}
              className={`dropdown__item${opt.value === value ? ' is-active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              <span className="dropdown__item-label">{opt.label}</span>
              {opt.hint && <span className="dropdown__item-hint">{opt.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
