import type { IStoragePort } from '../../core/ports/storage.port';
import type { AppSettings } from '../../core/types/settings';
import { DEFAULT_SETTINGS } from '../../core/types/settings';

export class SettingsService {
  private cache: AppSettings;

  constructor(private storage: IStoragePort) {
    this.cache = this.loadFromDb();
  }

  get current(): Readonly<AppSettings> {
    return this.cache;
  }

  update(patch: Partial<AppSettings>): AppSettings {
    const merged: AppSettings = { ...this.cache, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      this.storage.setSetting(key, value);
    }
    this.cache = merged;
    return merged;
  }

  private loadFromDb(): AppSettings {
    return {
      executable: this.storage.getSetting('executable', DEFAULT_SETTINGS.executable),
      configDir: this.storage.getSetting('configDir', DEFAULT_SETTINGS.configDir),
      permissionMode: this.storage.getSetting('permissionMode', DEFAULT_SETTINGS.permissionMode),
      model: this.storage.getSetting('model', DEFAULT_SETTINGS.model),
      zoomFactor: Number(this.storage.getSetting('zoomFactor', String(DEFAULT_SETTINGS.zoomFactor))),
      transcriptionProvider: this.storage.getSetting('transcriptionProvider', DEFAULT_SETTINGS.transcriptionProvider),
      transcriptionApiKey: this.storage.getSetting('transcriptionApiKey', DEFAULT_SETTINGS.transcriptionApiKey),
      transcriptionLanguage: this.storage.getSetting('transcriptionLanguage', DEFAULT_SETTINGS.transcriptionLanguage),
    };
  }
}
