import type { TranscriptionProvider } from './transcription';
import { DEFAULT_TRANSCRIPTION_SETTINGS } from './transcription';

export type PermissionModeOption = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';

export interface AppSettings {
  executable: string;
  configDir: string;
  permissionMode: PermissionModeOption;
  model: string;
  zoomFactor: number;
  transcriptionProvider: TranscriptionProvider;
  transcriptionApiKey: string;
  transcriptionLanguage: string;
}

export const DEFAULT_SETTINGS: Readonly<AppSettings> = {
  executable: 'claude',
  configDir: '',
  permissionMode: 'default',
  model: 'sonnet',
  zoomFactor: 1.25,
  ...DEFAULT_TRANSCRIPTION_SETTINGS,
};
