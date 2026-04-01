import { useState, useRef, useCallback } from 'react';
import { Icons } from '../../icons';
import FilePill from '../FilePill';

interface Props {
  onSend: (text: string, files: string[]) => void;
  disabled: boolean;
  attachedFiles: string[];
  onAttachFiles: (files: string[]) => void;
  onRemoveFile: (index: number) => void;
}

export default function InputArea({ onSend, disabled, attachedFiles, onAttachFiles, onRemoveFile }: Props) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, attachedFiles);
    setText('');
  }, [text, disabled, attachedFiles, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && e.metaKey) || (e.key === 'Enter' && e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div style={{ flexShrink: 0, padding: '0 24px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {attachedFiles.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, paddingLeft: 4 }}>
            {attachedFiles.map((f, i) => (
              <FilePill key={i} name={f} onRemove={() => onRemoveFile(i)} />
            ))}
          </div>
        )}

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: '4px',
          transition: 'background 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <label style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--fg-tertiary)', borderRadius: 12,
              transition: 'color 0.2s', flexShrink: 0,
            }}>
              <Icons.Paperclip size={18} />
              <input type="file" multiple style={{ display: 'none' }} onChange={e => {
                const files = Array.from(e.target.files || []);
                onAttachFiles(files.map(f => f.name));
              }} />
            </label>

            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Ask Claude to code something..."
              rows={1}
              disabled={disabled}
              style={{
                flex: 1, background: 'transparent', border: 'none', resize: 'none',
                fontSize: 14, color: 'var(--fg-primary)', padding: '10px 4px',
                fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.5,
                minHeight: 40, maxHeight: 160, outline: 'none',
              }}
            />

            <button
              onClick={() => setRecording(!recording)}
              style={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: recording ? 'var(--accent)' : 'transparent',
                border: 'none', borderRadius: 12, cursor: 'pointer',
                color: recording ? '#fff' : 'var(--fg-tertiary)',
                transition: 'all 0.3s ease', flexShrink: 0,
                animation: recording ? 'mic-pulse 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {recording ? <Icons.MicActive size={18} /> : <Icons.Mic size={18} />}
            </button>

            <button onClick={handleSubmit} style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: text.trim() ? 'var(--accent)' : 'transparent',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              color: text.trim() ? '#fff' : 'var(--fg-tertiary)',
              transition: 'all 0.3s ease', flexShrink: 0,
            }}>
              <Icons.Send size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 4px', gap: 4 }}>
            {[
              { label: 'Auto-approve', icon: <Icons.Check size={12} />, active: false },
              { label: 'Loop mode', icon: <Icons.Loop size={12} />, active: true },
              { label: 'Verbose', icon: <Icons.Eye size={12} />, active: false },
            ].map((opt, i) => (
              <button key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                background: opt.active ? 'var(--accent-dim)' : 'transparent',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                color: opt.active ? 'var(--accent)' : 'var(--fg-tertiary)',
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                transition: 'all 0.2s ease',
              }}>
                {opt.icon}
                {opt.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)',
              opacity: 0.6,
            }}>
              Ctrl+Enter to send • Shift+Enter for newline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
