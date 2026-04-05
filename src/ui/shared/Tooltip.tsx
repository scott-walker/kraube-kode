import { useState, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface Props {
  text: ReactNode;
  children: ReactNode;
}

interface TooltipState {
  top: number;
  right: number;
}

export default function Tooltip({ text, children }: Props) {
  const [state, setState] = useState<TooltipState | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setState({ top: rect.top - 8, right: window.innerWidth - rect.right });
      hideTimerRef.current = setTimeout(() => setState(null), 1000);
    }, 500);
  }, []);

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
          className="tooltip-bubble"
          style={{ top: state.top, right: state.right }}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  );
}
