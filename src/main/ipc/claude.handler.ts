import { ipcMain, dialog, type BrowserWindow } from 'electron';
import type { IClaudePort } from '../../core/ports/claude.port';
import type { StreamGuard } from '../services/stream-guard';

export function registerClaudeHandlers(
  getWindow: () => BrowserWindow | null,
  claudePort: IClaudePort,
  streamGuard: StreamGuard,
): void {
  ipcMain.on('claude:send', async (_event, prompt: string) => {
    const wc = getWindow()?.webContents;
    if (!wc) return;

    if (!claudePort.ready) {
      wc.send('claude:event', { type: 'error', message: 'SDK not ready. Wait for initialization or check settings.' });
      return;
    }

    try {
      for await (const event of streamGuard.stream(prompt)) {
        wc.send('claude:event', event);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      wc.send('claude:event', { type: 'error', message });
    }
  });

  ipcMain.on('claude:abort', () => streamGuard.abort());

  ipcMain.handle('claude:get-sdk-status', () => {
    if (claudePort.ready) return { status: 'ready' };
    if (claudePort.initError) return { status: 'error', message: claudePort.initError };
    return { status: 'initializing' };
  });

  ipcMain.handle('claude:list-sessions', () => claudePort.listSessions());

  ipcMain.handle('claude:supported-commands', () => claudePort.supportedCommands());

  ipcMain.handle('claude:get-session-messages', (_event, sessionId: string) =>
    claudePort.getSessionMessages(sessionId),
  );

  ipcMain.handle('claude:delete-session', async (_event, sessionId: string) => {
    const deleted = await claudePort.deleteSession(sessionId);
    return deleted;
  });

  ipcMain.handle('claude:new-session', async () => {
    const win = getWindow();
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: 'Select project directory',
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const cwd = result.filePaths[0];
    claudePort.newSession(cwd);
    return cwd;
  });
}
