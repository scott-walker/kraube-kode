import { ipcMain, dialog } from 'electron';
import type { ConnectionService } from '../services/connection.service';
import type { ClaudeConnectorAdapter } from '../adapters/kraube-konnektor.adapter';
import type { Connection } from '../../core/types/connection';

export function registerConnectionHandlers(
  connectionService: ConnectionService,
  claudeAdapter: ClaudeConnectorAdapter,
  getWindow: () => Electron.BrowserWindow | null,
): void {
  ipcMain.handle('connection:list', () => connectionService.list());

  ipcMain.handle('connection:create', (_event, data: Omit<Connection, 'id'>) => {
    const conn = connectionService.create(data);
    return conn;
  });

  ipcMain.handle('connection:update', (_event, conn: Connection) => {
    const updated = connectionService.update(conn);
    const activeId = connectionService.getActiveId();
    if (conn.id === activeId) claudeAdapter.reinit(conn);
    return updated;
  });

  ipcMain.handle('connection:delete', (_event, id: string) => {
    connectionService.delete(id);
  });

  ipcMain.handle('connection:set-active', (_event, id: string) => {
    connectionService.setActiveId(id);
    const conn = connectionService.get(id);
    if (!conn) return { instant: false };
    const result = claudeAdapter.reinit(conn);
    if (result === 'instant') {
      getWindow()?.webContents.send('claude:init-ready');
    }
    return { instant: result === 'instant' };
  });

  ipcMain.handle('connection:get-active', () => connectionService.getActive());

  ipcMain.handle('connection:pick-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select config directory',
    });
    return result.canceled ? null : result.filePaths[0];
  });
}
