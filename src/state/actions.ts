import { useStore } from './store';
import type { ToolbarPermission, ToolbarEffort, SettingsSection, ManagementSection } from './store';
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

export function navigateToSettings() {
  useStore.setState({ currentView: 'settings' });
}

export function navigateToChat() {
  useStore.setState({ currentView: 'chat' });
}

export function setSettingsSection(section: SettingsSection) {
  useStore.setState({ settingsSection: section });
}

export function navigateToManagement(section?: ManagementSection) {
  useStore.setState({
    currentView: 'management',
    ...(section ? { managementSection: section } : {}),
  });
}

export function setManagementSection(section: ManagementSection) {
  useStore.setState({ managementSection: section });
}

export function setDragOver(over: boolean) {
  useStore.setState({ dragOver: over });
}

export function pushOverlay() {
  useStore.setState(s => ({ overlayCount: s.overlayCount + 1 }));
}

export function popOverlay() {
  useStore.setState(s => ({ overlayCount: Math.max(0, s.overlayCount - 1) }));
}

// ─── Toolbar ───

const MODEL_CYCLE = ['sonnet', 'opus', 'haiku'];
const PERMISSION_CYCLE: ToolbarPermission[] = ['default', 'acceptEdits', 'plan'];
const EFFORT_CYCLE: ToolbarEffort[] = ['low', 'medium', 'high', 'max'];
const TOOLBAR_DEFAULTS = { toolbarModel: 'sonnet', toolbarPermission: 'default' as ToolbarPermission, toolbarEffort: 'high' as ToolbarEffort };

function persistPref(key: string, value: string) {
  const sessionId = useStore.getState().activeSessionId;
  if (sessionId) window.settings.saveSessionPref(sessionId, key, value);
}

export function cycleModel() {
  useStore.setState(s => {
    const idx = MODEL_CYCLE.indexOf(s.toolbarModel);
    const next = MODEL_CYCLE[(idx + 1) % MODEL_CYCLE.length];
    persistPref('model', next);
    return { toolbarModel: next };
  });
}

export function cyclePermission() {
  useStore.setState(s => {
    const idx = PERMISSION_CYCLE.indexOf(s.toolbarPermission);
    const next = PERMISSION_CYCLE[(idx + 1) % PERMISSION_CYCLE.length];
    persistPref('permission', next);
    return { toolbarPermission: next };
  });
}

export function cycleEffort() {
  useStore.setState(s => {
    const idx = EFFORT_CYCLE.indexOf(s.toolbarEffort);
    const next = EFFORT_CYCLE[(idx + 1) % EFFORT_CYCLE.length];
    persistPref('effort', next);
    return { toolbarEffort: next };
  });
}

export async function loadSessionPrefs(sessionId: string) {
  const prefs = await window.settings.loadSessionPrefs(sessionId);
  useStore.setState({
    toolbarModel: prefs.model ?? TOOLBAR_DEFAULTS.toolbarModel,
    toolbarPermission: (prefs.permission as ToolbarPermission) ?? TOOLBAR_DEFAULTS.toolbarPermission,
    toolbarEffort: (prefs.effort as ToolbarEffort) ?? TOOLBAR_DEFAULTS.toolbarEffort,
  });
}

export function persistCurrentToolbarPrefs(sessionId: string) {
  const s = useStore.getState();
  window.settings.saveSessionPref(sessionId, 'model', s.toolbarModel);
  window.settings.saveSessionPref(sessionId, 'permission', s.toolbarPermission);
  window.settings.saveSessionPref(sessionId, 'effort', s.toolbarEffort);
}

export function resetToolbarToDefaults() {
  useStore.setState(TOOLBAR_DEFAULTS);
}

// ─── Files ───

export function attachFiles(names: string[]) {
  useStore.setState(s => ({ attachedFiles: [...s.attachedFiles, ...names] }));
}

export function removeFile(index: number) {
  useStore.setState(s => ({ attachedFiles: s.attachedFiles.filter((_, i) => i !== index) }));
}

// ─── Sessions ───

const PAGE_SIZE = 30;

export async function loadMoreSessions() {
  const { sessionsLoadingMore, sessionsHasMore, sessionsLimit } = useStore.getState();
  if (sessionsLoadingMore || !sessionsHasMore) return;

  const newLimit = sessionsLimit + PAGE_SIZE;
  useStore.setState({ sessionsLoadingMore: true, sessionsLimit: newLimit });

  try {
    const sessions = await window.claude.listSessions(newLimit);
    useStore.setState({
      sessions,
      sessionsLoadingMore: false,
      sessionsHasMore: sessions.length >= newLimit,
    });
  } catch {
    useStore.setState({ sessionsLoadingMore: false });
  }
}

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
    ...TOOLBAR_DEFAULTS,
  });
}

let resumeTimer: ReturnType<typeof setTimeout> | undefined;

export async function selectSession(sessionId: string) {
  const state = useStore.getState();
  if (sessionId === state.activeSessionId) return;

  const session = state.sessions.find(s => s.sessionId === sessionId);
  const sessionCwd = session?.cwd;

  streamBuffer.clear();
  clearTimeout(resumeTimer);

  useStore.setState({
    activeSessionId: sessionId,
    messages: [],
    messagesLoading: true,
    currentView: 'chat',
    ...(sessionCwd ? { activeCwd: sessionCwd } : {}),
  });

  if (sessionCwd) {
    resumeTimer = setTimeout(async () => {
      if (useStore.getState().activeSessionId !== sessionId) return;
      const { instant } = await window.claude.resumeSession(sessionCwd);
      if (!instant && useStore.getState().activeSessionId === sessionId) {
        useStore.setState({ sdkStatus: 'initializing', sdkMessage: 'Switching project…' });
      }
    }, 150);
  }

  try {
    const [raw] = await Promise.all([
      window.claude.getSessionMessages(sessionId),
      loadSessionPrefs(sessionId),
    ]);
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
  window.settings.deleteSessionPrefs(sessionId);
  useStore.setState(s => {
    const sessions = s.sessions.filter(ses => ses.sessionId !== sessionId);
    const cleared = s.activeSessionId === sessionId;
    return {
      sessions,
      ...(cleared ? { activeSessionId: '', messages: [], messagesLoading: false, ...TOOLBAR_DEFAULTS } : {}),
    };
  });
}

// ─── Chat ───

export function sendMessage(text: string, files: string[]) {
  const state = useStore.getState();
  if (state.sdkStatus !== 'ready') return;

  const userMsg: Message = { role: 'user', content: text, files: files.length > 0 ? files : undefined };
  const initialBlocks: MessageBlock[] = [{ type: 'thinking', phase: 'thinking' }];
  streamBuffer.init(initialBlocks);

  const assistantMsg: Message = { role: 'assistant', content: '', blocks: [...initialBlocks], streaming: true };

  useStore.setState(s => ({
    messages: [...s.messages, userMsg, assistantMsg],
    attachedFiles: [],
  }));

  const queryOptions: Record<string, string> = { model: state.toolbarModel };
  if (state.toolbarPermission !== 'default') queryOptions.permissionMode = state.toolbarPermission;
  if (state.toolbarEffort !== 'high') queryOptions.effortLevel = state.toolbarEffort;

  window.claude.send(text, files, queryOptions);
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
