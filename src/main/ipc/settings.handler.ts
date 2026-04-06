import { ipcMain } from 'electron';
import type { SettingsService } from '../services/settings.service';
import type { IStoragePort } from '../../core/ports/storage.port';

export function registerSettingsHandlers(
  settingsService: SettingsService,
  storage: IStoragePort,
): void {
  ipcMain.handle('settings:load', () => settingsService.current);

  ipcMain.handle('settings:save', (_event, newSettings) => {
    return settingsService.update(newSettings);
  });

  ipcMain.handle('settings:load-session-prefs', (_event, sessionId: string) =>
    storage.getSessionPrefs(sessionId),
  );

  ipcMain.handle('settings:save-session-pref', (_event, sessionId: string, key: string, value: string) => {
    storage.setSessionPref(sessionId, key, value);
  });

  ipcMain.handle('settings:delete-session-prefs', (_event, sessionId: string) => {
    storage.deleteSessionPrefs(sessionId);
  });
}
