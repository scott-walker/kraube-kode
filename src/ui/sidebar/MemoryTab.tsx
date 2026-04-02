import { memo } from 'react';
import { Icons } from '../../icons';
import { useMemories } from '../../state/selectors';
import './MemoryTab.css';

export default memo(function MemoryTab() {
  const memories = useMemories();
  return (
    <div>
      <div className="memory-tab__section-label">Project Memory</div>
      {memories.map((m, i) => (
        <div key={i} className="memory-item">
          <span className="memory-item__bullet">•</span>
          <span className="memory-item__text">{m}</span>
          <button className="memory-item__delete-btn"><Icons.X size={12} /></button>
        </div>
      ))}
      <button className="memory-tab__add-btn">
        <Icons.Plus size={14} />
        Add Memory
      </button>
      <div className="memory-tab__claude-md">
        <div className="memory-tab__section-label">CLAUDE.md</div>
        <div className="memory-tab__md-content">
          # Convervox Project<br />
          Stack: React + Vite + TailwindCSS<br />
          API: REST + WebSocket<br />
          Voice: ElevenLabs + Whisper
        </div>
        <button className="memory-tab__edit-btn">
          <Icons.Edit size={12} />
          Edit CLAUDE.md
        </button>
      </div>
    </div>
  );
});
