import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { useIsStreaming, useAttachedFiles, useTranscriptionConfigured, useActiveSessionId } from '../../state/selectors';
import { sendMessage, attachFiles, removeFile } from '../../state/actions';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useImagePaste } from '../../hooks/useImagePaste';
import Tooltip from '../shared/Tooltip';
import FilePill from '../shared/FilePill';
import InputToolbar from './InputToolbar';
import CommandPalette from './CommandPalette';
import { Icons } from '../../icons';
import './InputArea.css';

const draftsRef = { current: new Map<string, string>() };

export default memo(function InputArea() {
  const isStreaming = useIsStreaming();
  const attachedFiles = useAttachedFiles();
  const sessionId = useActiveSessionId();
  const [text, setTextRaw] = useState('');
  const [cmdOpen, setCmdOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const setText = useCallback((v: string | ((prev: string) => string)) => {
    setTextRaw(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      draftsRef.current.set(sessionId, next);
      return next;
    });
  }, [sessionId]);

  useEffect(() => {
    setTextRaw(draftsRef.current.get(sessionId) ?? '');
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [sessionId]);

  const transcriptionConfigured = useTranscriptionConfigured();

  const cursorSnapshotRef = useRef<{ pos: number; atEnd: boolean }>({ pos: 0, atEnd: true });

  const captureCursorSnapshot = useCallback(() => {
    const el = inputRef.current;
    const pos = el?.selectionStart ?? text.length;
    cursorSnapshotRef.current = { pos, atEnd: pos >= text.length };
  }, [text]);

  const onTranscribed = useCallback((incoming: string) => {
    if (!incoming) return;
    setText(prev => {
      const { pos, atEnd } = cursorSnapshotRef.current;

      // Empty field — just insert as-is
      if (!prev) return incoming;

      // Cursor was in the middle — insert at position, add spaces around if needed
      if (!atEnd) {
        const before = prev.slice(0, pos);
        const after = prev.slice(pos);
        const needSpaceBefore = before.length > 0 && !/\s$/.test(before);
        const needSpaceAfter = after.length > 0 && !/^\s/.test(after);
        return before + (needSpaceBefore ? ' ' : '') + incoming + (needSpaceAfter ? ' ' : '') + after;
      }

      // Cursor was at end — auto-punctuation logic
      const trimmed = prev.trimEnd();
      const lastChar = trimmed[trimmed.length - 1];
      const sentenceEnders = new Set(['.', '!', '?', '…', ':', ';', '。', '？', '！']);

      if (sentenceEnders.has(lastChar)) {
        // Already has punctuation — just add space
        return trimmed + ' ' + incoming;
      }

      // No punctuation — add period and space
      return trimmed + '. ' + incoming;
    });
  }, []);
  const { recordingState, toggle: toggleRecording, cancel: cancelRecording } = useVoiceInput(onTranscribed);

  const micDisabled = !transcriptionConfigured || recordingState === 'transcribing';

  const handleToggleRecording = useCallback(() => {
    if (recordingState === 'idle') captureCursorSnapshot();
    toggleRecording();
  }, [recordingState, captureCursorSnapshot, toggleRecording]);

  const prevRecordingState = useRef(recordingState);
  useEffect(() => {
    if (prevRecordingState.current !== 'idle' && recordingState === 'idle') {
      inputRef.current?.focus();
    }
    prevRecordingState.current = recordingState;
  }, [recordingState]);

  useEffect(() => {
    const isInputElement = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    };

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (!micDisabled) handleToggleRecording();
      }
      if (e.key === 'Escape' && recordingState === 'recording') {
        e.preventDefault();
        cancelRecording();
      }

      // Auto-focus chat input on printable key press
      if (
        e.key.length === 1
        && !e.ctrlKey && !e.metaKey && !e.altKey
        && !isInputElement(document.activeElement)
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [micDisabled, handleToggleRecording, cancelRecording, recordingState]);

  // Command palette: open when text starts with "/" (no spaces yet = still picking command)
  const isSlashTyping = text.startsWith('/') && !text.includes(' ');
  const showPalette = isSlashTyping || (cmdOpen && text === '');
  const slashFilter = isSlashTyping ? text.slice(1) : '';

  const handleSelectCommand = useCallback((name: string) => {
    setText(`/${name} `);
    setCmdOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSlashClick = useCallback(() => {
    setCmdOpen(prev => {
      if (prev || text.startsWith('/')) {
        setText('');
        return false;
      }
      setText('/');
      return true;
    });
    inputRef.current?.focus();
  }, [text]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed, attachedFiles);
    draftsRef.current.delete(sessionId);
    setTextRaw('');
    setCmdOpen(false);
  }, [text, isStreaming, attachedFiles, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showPalette) {
      e.preventDefault();
      setCmdOpen(false);
      setText('');
      return;
    }
    if ((e.key === 'Enter' && e.metaKey) || (e.key === 'Enter' && e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = useImagePaste();

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  return (
    <div className="input-area">
      <div className="input-area__inner">
        {attachedFiles.length > 0 && (
          <div className="input-area__files">
            {attachedFiles.map((f, i) => <FilePill key={i} name={f} onRemove={() => removeFile(i)} />)}
          </div>
        )}
        <div className="input-area__box" ref={boxRef}>
            {showPalette && (
              <CommandPalette
                filter={slashFilter}
                onSelect={handleSelectCommand}
                onClose={() => setCmdOpen(false)}
                anchorRef={boxRef}
              />
            )}
            <div className="input-area__row">
              <button className="input-area__attach-btn" onClick={async () => {
              const paths = await window.claude.pickFiles();
              if (paths.length > 0) attachFiles(paths);
            }}>
              <Icons.Paperclip size={18} />
            </button>
            <Tooltip text="Commands">
              <button onClick={handleSlashClick} className={`input-area__slash-btn${text.startsWith('/') ? ' is-active' : ''}`}>
                <Icons.Slash size={14} />
              </button>
            </Tooltip>
            <div className="input-area__textarea-wrap">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                onPaste={handlePaste}
                placeholder="Ask Claude to code something..."
                rows={1}
                disabled={isStreaming}
                className="input-area__textarea"
              />
            </div>
            <Tooltip text={transcriptionConfigured
              ? <>Voice input <kbd className="tooltip-kbd">Ctrl+/</kbd></>
              : 'Configure transcription in Settings'}>
              <button onClick={handleToggleRecording} disabled={micDisabled}
                className={`input-area__btn input-area__btn--mic${recordingState === 'recording' ? ' is-recording' : ''}${recordingState === 'transcribing' ? ' is-transcribing' : ''}${!transcriptionConfigured ? ' is-disabled' : ''}`}>
                {recordingState === 'transcribing' ? <Icons.Spinner size={18} /> : recordingState === 'recording' ? <Icons.MicActive size={18} /> : <Icons.Mic size={18} />}
              </button>
            </Tooltip>
            <button onClick={handleSubmit}
              className={`input-area__btn input-area__btn--send${text.trim() && recordingState === 'idle' ? ' is-active' : ''}`}>
              <Icons.Send size={16} />
            </button>
          </div>
          <InputToolbar />
        </div>
      </div>
    </div>
  );
});
