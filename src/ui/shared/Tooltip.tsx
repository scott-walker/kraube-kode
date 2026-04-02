import { useState, useRef, type ReactNode } from 'react';
import './Tooltip.css';

interface Props {
  text: ReactNode;
  children: ReactNode;
}

export default function Tooltip({ text, children }: Props) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span className="tooltip-wrapper" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && text && <span className="tooltip-bubble">{text}</span>}
    </span>
  );
}
