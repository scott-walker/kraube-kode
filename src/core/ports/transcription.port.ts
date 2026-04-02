import type { TranscriptionRequest, TranscriptionResult } from '../types/transcription';

export interface ITranscriptionPort {
  readonly name: string;
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResult>;
}
