import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

type Position = 'right' | 'left';

interface Props {
  text: ReactNode;
  children: ReactNode;
  position?: Position;
}

interface TooltipState {
  top: number;
  left?: number;
  right?: number;
}

export default function Tooltip({ text, children, position = 'right' }: Props) {
  const [state, setState] = useState<TooltipState | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const pos: TooltipState = position === 'left'
        ? { top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + 8 }
        : { top: rect.top + rect.height / 2, left: rect.right + 8 };
      setState(pos);
      hideTimerRef.current = setTimeout(() => setState(null), 1000);
    }, 500);
  }, [position]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(hideTimerRef.current);
    setState(null);
  }, []);

  return (
    <span className="tooltip-wrapper" ref={wrapperRef} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {state && text && createPortal(
        <span
          className={`tooltip-bubble${position === 'left' ? ' tooltip-bubble--left' : ''}`}
          style={{ top: state.top, left: state.left, right: state.right }}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  );
}
