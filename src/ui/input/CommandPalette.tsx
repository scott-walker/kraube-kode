import { memo, useState, useEffect, useRef, useCallback } from 'react';
import type { SlashCommand } from '../../core/types/ipc-api';
import './CommandPalette.css';

const KIND_LABEL: Record<SlashCommand['kind'], string> = {
  skill: 'skill',
  system: 'system',
  mcp: 'mcp',
};

interface Props {
  filter: string;
  onSelect: (command: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export default memo(function CommandPalette({ filter, onSelect, onClose, anchorRef }: Props) {
  const [commands, setCommands] = useState<SlashCommand[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.claude.supportedCommands()
      .then(raw => {
        const mapped: SlashCommand[] = raw.map((c: { name: string; description: string }) => ({
          name: c.name,
          description: c.description,
          kind: inferKind(c.name),
        }));
        setCommands(mapped);
      })
      .catch(() => {});
  }, []);

  const query = filter.toLowerCase();
  const filtered = commands.filter(c =>
    c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query),
  );

  useEffect(() => { setActiveIndex(0); }, [filter]);

  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filtered.length > 0) {
        e.preventDefault();
        onSelect(filtered[activeIndex]?.name ?? '');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [filtered, activeIndex, onSelect, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  const [pos, setPos] = useState<{ bottom: number; left: number; width: number }>({ bottom: 0, left: 0, width: 0 });
  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ bottom: window.innerHeight - rect.top + 6, left: rect.left, width: rect.width });
  }, [anchorRef]);

  if (filtered.length === 0) return null;

  return (
    <div className="cmd-palette" style={{ bottom: pos.bottom, left: pos.left, width: pos.width }}>
      <div className="cmd-palette__list" ref={listRef}>
        {filtered.map((cmd, i) => (
          <button
            key={cmd.name}
            className={`cmd-palette__item${i === activeIndex ? ' is-active' : ''}`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseDown={e => { e.preventDefault(); onSelect(cmd.name); }}
          >
            <span className={`cmd-palette__kind cmd-palette__kind--${cmd.kind}`}>
              {KIND_LABEL[cmd.kind]}
            </span>
            <span className="cmd-palette__name">/{cmd.name}</span>
            <span className="cmd-palette__desc">{truncate(cmd.description, 60)}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

function inferKind(name: string): SlashCommand['kind'] {
  if (name.includes('(MCP)') || name.includes(':')) return 'mcp';
  const systemCmds = new Set(['compact', 'context', 'cost', 'heapdump', 'init', 'debug', 'extra-usage', 'release-notes']);
  if (systemCmds.has(name)) return 'system';
  return 'skill';
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}
