import type { ITranscriptionPort } from '../../core/ports/transcription.port';
import type { TranscriptionRequest, TranscriptionResult } from '../../core/types/transcription';

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

const MIME_TO_EXT: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
};

export class OpenAIWhisperAdapter implements ITranscriptionPort {
  readonly name = 'openai-whisper';

  constructor(private getApiKey: () => string) {}

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured');

    const ext = MIME_TO_EXT[request.mimeType] ?? 'webm';
    const blob = new Blob([request.audio], { type: request.mimeType });

    const form = new FormData();
    form.append('file', blob, `recording.${ext}`);
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json');
    if (request.language) form.append('language', request.language);

    const res = await fetch(WHISPER_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Whisper API error ${res.status}: ${body}`);
    }

    const json = await res.json();
    return {
      text: json.text ?? '',
      language: json.language ?? '',
      duration: json.duration ?? 0,
    };
  }
}
