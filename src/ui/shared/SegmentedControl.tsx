import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import './SegmentedControl.css';

export interface SegmentOption {
  value: string;
  label: string;
}

interface Props {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({ options, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const idx = options.findIndex(o => o.value === value);
    const btn = container.children[idx + 1] as HTMLElement | undefined;
    if (!btn) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [options, value]);

  useLayoutEffect(updateIndicator, [updateIndicator]);

  return (
    <div className="segmented" ref={containerRef}>
      <div className="segmented__indicator" style={{ left: indicator.left, width: indicator.width }} />
      {options.map(opt => (
        <button
          key={opt.value}
          className={`segmented__option${opt.value === value ? ' is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
