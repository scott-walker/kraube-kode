import type { TranscriptionProvider } from './transcription';
import { DEFAULT_TRANSCRIPTION_SETTINGS } from './transcription';

export type PermissionModeOption = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';

export interface GlobalSettings {
  zoomFactor: number;
  activeConnectionId: string;
  transcriptionProvider: TranscriptionProvider;
  transcriptionApiKey: string;
  transcriptionLanguage: string;
}

export const DEFAULT_GLOBAL_SETTINGS: Readonly<GlobalSettings> = {
  zoomFactor: 1.75,
  activeConnectionId: '',
  ...DEFAULT_TRANSCRIPTION_SETTINGS,
};
