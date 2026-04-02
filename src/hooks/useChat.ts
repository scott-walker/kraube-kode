import { useMessages, useIsStreaming, useCanSend } from '../state/selectors';
import { sendMessage, abortStream } from '../state/actions';

export function useChat() {
  const messages = useMessages();
  const isStreaming = useIsStreaming();
  const canSend = useCanSend();
  return { messages, isStreaming, canSend, sendMessage, abortStream };
}
