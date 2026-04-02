export interface TranscriptionRequest {
  audio: Buffer;
  mimeType: string;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
}

export type TranscriptionProvider = 'openai-whisper';

export interface TranscriptionSettings {
  transcriptionProvider: TranscriptionProvider;
  transcriptionApiKey: string;
  transcriptionLanguage: string;
}

export const DEFAULT_TRANSCRIPTION_SETTINGS: Readonly<TranscriptionSettings> = {
  transcriptionProvider: 'openai-whisper',
  transcriptionApiKey: '',
  transcriptionLanguage: '',
};
