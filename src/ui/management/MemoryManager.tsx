import { memo, useCallback, useMemo, useState } from 'react';
import { Icons } from '../../icons';
import { useMemories } from '../../state/selectors';
import { useStore } from '../../state/store';
import ConfirmDialog from '../shared/ConfirmDialog';
import './MemoryManager.css';

export default memo(function MemoryManager() {
  const memories = useMemories();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return memories
      .map((m, i) => ({ text: m, index: i }))
      .filter(({ text }) => !q || text.toLowerCase().includes(q));
  }, [memories, search]);

  const toggleOne = useCallback((idx: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  }, []);

  const toggleAll = useCallback(() => {
    const allIdxs = new Set(filtered.map(f => f.index));
    setSelected(prev => prev.size === allIdxs.size ? new Set() : allIdxs);
  }, [filtered]);

  const startEdit = useCallback((idx: number, text: string) => {
    setEditing(idx);
    setEditText(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (editing === null) return;
    useStore.setState(s => {
      const m = [...s.memories];
      m[editing] = editText;
      return { memories: m };
    });
    setEditing(null);
  }, [editing, editText]);

  const handleBulkDelete = useCallback(() => {
    useStore.setState(s => ({
      memories: s.memories.filter((_, i) => !selected.has(i)),
    }));
    setSelected(new Set());
    setDeleting(false);
  }, [selected]);

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    useStore.setState(s => ({ memories: [...s.memories, newText.trim()] }));
    setNewText('');
    setAdding(false);
  }, [newText]);

  return (
    <div className="mem-mgr">
      <div className="mem-mgr__toolbar">
        <div className="sessions-mgr__search-wrap">
          <Icons.Search size={14} />
          <input className="sessions-mgr__search" placeholder="Search memories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <label className="sessions-mgr__select-all">
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
          All ({filtered.length})
        </label>
        {selected.size > 0 && (
          <button className="sessions-mgr__delete-btn" onClick={() => setDeleting(true)}>
            <Icons.Trash size={14} />
            Delete {selected.size}
          </button>
        )}
        <button className="mcp-mgr__action-btn" onClick={() => setAdding(true)}>
          <Icons.Plus size={14} />
          Add
        </button>
      </div>

      {adding && (
        <div className="mem-mgr__add-form">
          <input
            className="mem-mgr__edit-input"
            placeholder="New memory entry…"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <button className="mem-mgr__save-btn" onClick={handleAdd} disabled={!newText.trim()}>Add</button>
          <button className="mem-mgr__cancel-btn" onClick={() => { setAdding(false); setNewText(''); }}>Cancel</button>
        </div>
      )}

      <div className="mem-mgr__body">
        {filtered.map(({ text, index }) => (
          <div key={index} className={`mem-mgr__row${selected.has(index) ? ' is-selected' : ''}`}>
            <label className="session-row__check" onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={selected.has(index)} onChange={() => toggleOne(index)} />
            </label>
            {editing === index ? (
              <div className="mem-mgr__edit-wrap">
                <input
                  className="mem-mgr__edit-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                  autoFocus
                />
                <button className="mem-mgr__save-btn" onClick={saveEdit}>Save</button>
                <button className="mem-mgr__cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            ) : (
              <span className="mem-mgr__text" onDoubleClick={() => startEdit(index, text)}>{text}</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="sessions-mgr__empty">
            {memories.length === 0 ? 'No memories yet' : 'No memories match the search'}
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title={`Delete ${selected.size} memories?`}
          message="This action cannot be undone."
          confirmLabel={`Delete ${selected.size}`}
          danger
          onConfirm={handleBulkDelete}
          onCancel={() => setDeleting(false)}
        />
      )}
    </div>
  );
});
