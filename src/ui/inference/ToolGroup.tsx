import { useState } from 'react';
import { Icons } from '../../icons';
import { renderBlock } from '../chat/MessageBlocks';
import type { MessageBlock } from '../../types';
import './ToolGroup.css';

interface Props {
  blocks: MessageBlock[];
}

function summarize(blocks: MessageBlock[]): string {
  const counts: Record<string, number> = {};
  for (const b of blocks) {
    if (b.type === 'tool_call') counts[b.name] = (counts[b.name] || 0) + 1;
  }
  return Object.entries(counts).map(([name, n]) => n > 1 ? `${name} x${n}` : name).join(', ');
}

export default function ToolGroup({ blocks }: Props) {
  const [open, setOpen] = useState(false);
  const hasRunning = blocks.some(b => b.type === 'tool_call' && b.status === 'running');

  if (hasRunning || blocks.length === 1) {
    return <div className="tool-group">{blocks.map((b, k) => renderBlock(b, k))}</div>;
  }

  return (
    <div className="tool-group">
      <button className="tool-group__toggle" onClick={() => setOpen(o => !o)}>
        <Icons.ChevronRight size={12} className={`tool-group__chevron${open ? ' tool-group__chevron--open' : ''}`} />
        <span className="tool-group__count">{blocks.length} tools</span>
        <span className="tool-group__summary">{summarize(blocks)}</span>
      </button>
      {open && (
        <div className="tool-group__items">
          {blocks.map((b, k) => renderBlock(b, k))}
        </div>
      )}
    </div>
  );
}
