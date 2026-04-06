import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onConfirmClose: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('window:confirm-close', handler);
    return () => ipcRenderer.removeListener('window:confirm-close', handler);
  },
  confirmCloseResponse: (confirmed: boolean) => ipcRenderer.send('window:confirm-close-response', confirmed),
});

contextBridge.exposeInMainWorld('claude', {
  send: (prompt: string, files?: string[], options?: Record<string, string>) => ipcRenderer.send('claude:send', prompt, files, options),
  abort: () => ipcRenderer.send('claude:abort'),
  getSdkStatus: () => ipcRenderer.invoke('claude:get-sdk-status'),
  listSessions: (limit?: number) => ipcRenderer.invoke('claude:list-sessions', limit),
  getSessionMessages: (sessionId: string) => ipcRenderer.invoke('claude:get-session-messages', sessionId),
  deleteSession: (sessionId: string) => ipcRenderer.invoke('claude:delete-session', sessionId) as Promise<boolean>,
  newSession: () => ipcRenderer.invoke('claude:new-session') as Promise<string | null>,
  resumeSession: (cwd: string) => ipcRenderer.invoke('claude:resume-session', cwd) as Promise<{ instant: boolean }>,
  supportedCommands: () => ipcRenderer.invoke('claude:supported-commands'),
  getCwd: () => ipcRenderer.invoke('claude:get-cwd') as Promise<string>,
  saveTempImage: (bytes: Uint8Array, mimeType: string) =>
    ipcRenderer.invoke('claude:save-temp-image', bytes, mimeType) as Promise<string>,
  readThumbnail: (filePath: string, size: number) =>
    ipcRenderer.invoke('claude:read-thumbnail', filePath, size) as Promise<string | null>,
  pickFiles: () => ipcRenderer.invoke('claude:pick-files') as Promise<string[]>,
  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  respondPermission: (requestId: string, behavior: 'allow' | 'deny', message?: string) =>
    ipcRenderer.send('claude:permission-response', { requestId, behavior, message }),
  respondElicitation: (requestId: string, action: 'accept' | 'decline' | 'cancel', content?: Record<string, unknown>) =>
    ipcRenderer.send('claude:elicitation-response', { requestId, action, content }),

  onEvent: (cb: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('claude:event', cb);
    return () => ipcRenderer.removeListener('claude:event', cb);
  },

  onPermissionRequest: (cb: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('claude:permission-request', cb);
    return () => ipcRenderer.removeListener('claude:permission-request', cb);
  },

  onElicitationRequest: (cb: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('claude:elicitation-request', cb);
    return () => ipcRenderer.removeListener('claude:elicitation-request', cb);
  },

  onInitReady: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('claude:init-ready', handler);
    return () => ipcRenderer.removeListener('claude:init-ready', handler);
  },

  onInitStage: (cb: (event: unknown, data: { stage: string; message: string }) => void) => {
    ipcRenderer.on('claude:init-stage', cb);
    return () => ipcRenderer.removeListener('claude:init-stage', cb);
  },

  onInitError: (cb: (event: unknown, message: string) => void) => {
    ipcRenderer.on('claude:init-error', cb);
    return () => ipcRenderer.removeListener('claude:init-error', cb);
  },
});

contextBridge.exposeInMainWorld('mcp', {
  getServerStatus: () => ipcRenderer.invoke('mcp:server-status'),
  setServers: (servers: unknown) => ipcRenderer.invoke('mcp:set-servers', servers),
  toggleServer: (name: string, enabled: boolean) =>
    ipcRenderer.invoke('mcp:toggle-server', name, enabled),
  reconnectServer: (name: string) => ipcRenderer.invoke('mcp:reconnect-server', name),
});

contextBridge.exposeInMainWorld('settings', {
  load: () => ipcRenderer.invoke('settings:load'),
  save: (settings: unknown) => ipcRenderer.invoke('settings:save', settings),
  loadSessionPrefs: (sessionId: string) => ipcRenderer.invoke('settings:load-session-prefs', sessionId),
  saveSessionPref: (sessionId: string, key: string, value: string) =>
    ipcRenderer.invoke('settings:save-session-pref', sessionId, key, value),
  deleteSessionPrefs: (sessionId: string) => ipcRenderer.invoke('settings:delete-session-prefs', sessionId),
});

contextBridge.exposeInMainWorld('connection', {
  list: () => ipcRenderer.invoke('connection:list'),
  create: (data: unknown) => ipcRenderer.invoke('connection:create', data),
  update: (conn: unknown) => ipcRenderer.invoke('connection:update', conn),
  delete: (id: string) => ipcRenderer.invoke('connection:delete', id),
  setActive: (id: string) => ipcRenderer.invoke('connection:set-active', id) as Promise<{ instant: boolean }>,
  getActive: () => ipcRenderer.invoke('connection:get-active'),
  pickDirectory: () => ipcRenderer.invoke('connection:pick-directory') as Promise<string | null>,
});

const ZOOM_STEP = 0.05;
window.addEventListener('wheel', (e) => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
  ipcRenderer.send('zoom:apply', delta);
}, { passive: false });

contextBridge.exposeInMainWorld('transcription', {
  transcribe: (audioBytes: Uint8Array, mimeType: string) =>
    ipcRenderer.invoke('transcription:transcribe', audioBytes, mimeType),
});
