import { useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { useRecordingState } from '../state/selectors';

export function useVoiceInput(onTranscribed: (text: string) => void) {
  const recordingState = useRecordingState();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: getSupportedMime() });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        await transcribe(blob, recorder.mimeType, onTranscribed);
      };

      mediaRef.current = recorder;
      recorder.start();
      useStore.setState({ recordingState: 'recording' });
    } catch {
      useStore.setState({ recordingState: 'idle' });
    }
  }, [onTranscribed]);

  const stop = useCallback(() => {
    const recorder = mediaRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      mediaRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    const recorder = mediaRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
      mediaRef.current = null;
      chunksRef.current = [];
      useStore.setState({ recordingState: 'idle' });
    }
  }, []);

  const toggle = useCallback(() => {
    if (recordingState === 'recording') stop();
    else if (recordingState === 'idle') start();
  }, [recordingState, start, stop]);

  return { recordingState, toggle, cancel };
}

function getSupportedMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? 'audio/webm';
}

async function transcribe(blob: Blob, mimeType: string, onResult: (text: string) => void) {
  useStore.setState({ recordingState: 'transcribing' });
  try {
    const buffer = await blob.arrayBuffer();
    const result = await window.transcription.transcribe(new Uint8Array(buffer), mimeType.split(';')[0]);
    if (result.text) onResult(result.text);
  } catch (err) {
    console.error('Transcription failed:', err);
  } finally {
    useStore.setState({ recordingState: 'idle' });
  }
}
