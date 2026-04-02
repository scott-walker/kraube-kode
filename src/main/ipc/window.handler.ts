import { ipcMain, type BrowserWindow } from 'electron';
import type { IClaudePort } from '../../core/ports/claude.port';

export function registerWindowHandlers(
  getWindow: () => BrowserWindow | null,
  claudePort: IClaudePort,
): void {
  ipcMain.on('window:minimize', () => getWindow()?.minimize());

  ipcMain.on('window:maximize', () => {
    const win = getWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });

  ipcMain.on('window:close', () => {
    claudePort.close();
    getWindow()?.close();
  });

  ipcMain.handle('window:isMaximized', () => getWindow()?.isMaximized() ?? false);
}
