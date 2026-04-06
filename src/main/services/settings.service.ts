import type { IStoragePort } from '../../core/ports/storage.port';
import type { GlobalSettings } from '../../core/types/settings';
import { DEFAULT_GLOBAL_SETTINGS } from '../../core/types/settings';

export class SettingsService {
  private cache: GlobalSettings;

  constructor(private storage: IStoragePort) {
    this.cache = this.loadFromDb();
  }

  get current(): Readonly<GlobalSettings> {
    return this.cache;
  }

  update(patch: Partial<GlobalSettings>): GlobalSettings {
    const merged: GlobalSettings = { ...this.cache, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      this.storage.setSetting(key, value);
    }
    this.cache = merged;
    return merged;
  }

  private loadFromDb(): GlobalSettings {
    const d = DEFAULT_GLOBAL_SETTINGS;
    return {
      zoomFactor: Number(this.storage.getSetting('zoomFactor', String(d.zoomFactor))),
      activeConnectionId: this.storage.getSetting('activeConnectionId', d.activeConnectionId),
      transcriptionProvider: this.storage.getSetting('transcriptionProvider', d.transcriptionProvider),
      transcriptionApiKey: this.storage.getSetting('transcriptionApiKey', d.transcriptionApiKey),
      transcriptionLanguage: this.storage.getSetting('transcriptionLanguage', d.transcriptionLanguage),
    };
  }
}
