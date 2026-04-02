import { ipcMain } from 'electron';
import type { SettingsService } from '../services/settings.service';

export function registerSettingsHandlers(
  settingsService: SettingsService,
  onSettingsChanged: () => void,
): void {
  ipcMain.handle('settings:load', () => settingsService.current);

  ipcMain.handle('settings:save', (_event, newSettings) => {
    const result = settingsService.update(newSettings);
    onSettingsChanged();
    return result;
  });
}
