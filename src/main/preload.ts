import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
});

contextBridge.exposeInMainWorld('claude', {
  send: (prompt: string) => ipcRenderer.send('claude:send', prompt),
  abort: () => ipcRenderer.send('claude:abort'),
  getSdkStatus: () => ipcRenderer.invoke('claude:get-sdk-status'),
  listSessions: () => ipcRenderer.invoke('claude:list-sessions'),
  getSessionMessages: (sessionId: string) => ipcRenderer.invoke('claude:get-session-messages', sessionId),
  deleteSession: (sessionId: string) => ipcRenderer.invoke('claude:delete-session', sessionId) as Promise<boolean>,
  newSession: () => ipcRenderer.invoke('claude:new-session') as Promise<string | null>,
  supportedCommands: () => ipcRenderer.invoke('claude:supported-commands'),
  getCwd: () => ipcRenderer.invoke('claude:get-cwd') as Promise<string>,

  onEvent: (cb: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('claude:event', cb);
    return () => ipcRenderer.removeListener('claude:event', cb);
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
});

contextBridge.exposeInMainWorld('transcription', {
  transcribe: (audioBytes: Uint8Array, mimeType: string) =>
    ipcRenderer.invoke('transcription:transcribe', audioBytes, mimeType),
});
