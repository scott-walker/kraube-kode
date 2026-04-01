import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('claude', {
  stream: (prompt: string) => {
    ipcRenderer.send('claude:stream', prompt);
  },

  onStreamChunk: (cb: (event: unknown, chunk: string) => void) => {
    ipcRenderer.on('claude:stream:chunk', cb);
    return () => {
      ipcRenderer.removeListener('claude:stream:chunk', cb);
    };
  },

  onStreamEnd: (cb: () => void) => {
    const handler = () => cb();
    ipcRenderer.on('claude:stream:end', handler);
    return () => {
      ipcRenderer.removeListener('claude:stream:end', handler);
    };
  },

  onStreamError: (cb: (event: unknown, error: string) => void) => {
    ipcRenderer.on('claude:stream:error', cb);
    return () => {
      ipcRenderer.removeListener('claude:stream:error', cb);
    };
  },
});
