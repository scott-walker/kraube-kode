import { useState, type ReactNode } from 'react';
import { Icons } from '../../icons';
import './Collapsible.css';

interface Props {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
  badge?: string | number;
}

export default function Collapsible({ title, icon, children, defaultOpen = false, accent = false, badge }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button
        onClick={() => setOpen(!open)}
        className={`collapsible__trigger${accent ? ' collapsible__trigger--accent' : ''}`}
      >
        <span className={`collapsible__chevron${open ? ' collapsible__chevron--open' : ''}`}>
          <Icons.ChevronRight size={12} />
        </span>
        {icon}
        <span className="collapsible__title">{title}</span>
        {badge && <span className="collapsible__badge">{badge}</span>}
      </button>
      <div className={`collapsible__body${open ? ' collapsible__body--open' : ''}`}>
        <div className="collapsible__content">{children}</div>
      </div>
    </div>
  );
}
