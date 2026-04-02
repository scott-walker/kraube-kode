import { useStore } from './store';
import { streamBuffer } from './stream-processor';
import { mapSessionMessages } from '../utils/session-message-mapper';
import type { Message, MessageBlock } from '../types';
import type { Theme } from '../theme';

// ─── UI ───

export function toggleTheme() {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  useStore.setState(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' as Theme }));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching');
    });
  });
}

export function setSidebarOpen(open: boolean) {
  useStore.setState({ sidebarOpen: open });
}

export function setSettingsOpen(open: boolean) {
  useStore.setState({ settingsOpen: open });
}

export function setDragOver(over: boolean) {
  useStore.setState({ dragOver: over });
}

// ─── Files ───

export function attachFiles(names: string[]) {
  useStore.setState(s => ({ attachedFiles: [...s.attachedFiles, ...names] }));
}

export function removeFile(index: number) {
  useStore.setState(s => ({ attachedFiles: s.attachedFiles.filter((_, i) => i !== index) }));
}

// ─── Sessions ───

export async function newSession() {
  const cwd = await window.claude.newSession();
  if (!cwd) return; // user cancelled dialog
  streamBuffer.clear();
  useStore.setState({
    activeSessionId: '',
    messages: [],
    activeCwd: cwd,
    sdkStatus: 'initializing',
    sdkMessage: 'Warming up SDK session…',
  });
}

export async function selectSession(sessionId: string) {
  if (sessionId === useStore.getState().activeSessionId) return;
  streamBuffer.clear();
  useStore.setState({ activeSessionId: sessionId, messages: [], messagesLoading: true });

  try {
    const raw = await window.claude.getSessionMessages(sessionId);
    if (useStore.getState().activeSessionId !== sessionId) return;
    const messages = mapSessionMessages(raw);
    useStore.setState({ messages, messagesLoading: false });
  } catch {
    useStore.setState({ messagesLoading: false });
  }
}

export async function deleteSession(sessionId: string) {
  const deleted = await window.claude.deleteSession(sessionId);
  if (!deleted) return;
  useStore.setState(s => {
    const sessions = s.sessions.filter(ses => ses.sessionId !== sessionId);
    const cleared = s.activeSessionId === sessionId;
    return {
      sessions,
      ...(cleared ? { activeSessionId: '', messages: [], messagesLoading: false } : {}),
    };
  });
}

// ─── Chat ───

export function sendMessage(text: string, files: string[]) {
  if (useStore.getState().sdkStatus !== 'ready') return;

  const userMsg: Message = { role: 'user', content: text, files: files.length > 0 ? files : undefined };
  const initialBlocks: MessageBlock[] = [{ type: 'thinking', phase: 'thinking' }];
  streamBuffer.init(initialBlocks);

  const assistantMsg: Message = { role: 'assistant', content: '', blocks: [...initialBlocks], streaming: true };

  useStore.setState(s => ({
    messages: [...s.messages, userMsg, assistantMsg],
    attachedFiles: [],
  }));

  window.claude.send(text);
}

export function abortStream() {
  window.claude.abort();
  streamBuffer.clear();
  useStore.setState(s => {
    const messages = [...s.messages];
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && last.streaming) {
      messages[messages.length - 1] = { ...last, streaming: false };
    }
    return { messages };
  });
}
