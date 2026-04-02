import { ipcMain } from 'electron';
import type { ITranscriptionPort } from '../../core/ports/transcription.port';
import type { SettingsService } from '../services/settings.service';

export function registerTranscriptionHandlers(
  getAdapter: () => ITranscriptionPort,
  settingsService: SettingsService,
): void {
  ipcMain.handle('transcription:transcribe', async (_event, audioBytes: Uint8Array, mimeType: string) => {
    const settings = settingsService.current;
    const adapter = getAdapter();

    return adapter.transcribe({
      audio: Buffer.from(audioBytes),
      mimeType,
      language: settings.transcriptionLanguage || undefined,
    });
  });
}
