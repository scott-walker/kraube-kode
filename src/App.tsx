import { useState, useCallback } from 'react';
import ChatView from './components/ChatView';
import InputBar from './components/InputBar';
import type { Message } from './types';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    const cleanup = window.claude.onStreamChunk((_event: unknown, chunk: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + chunk };
        return updated;
      });
    });

    const cleanupEnd = window.claude.onStreamEnd(() => {
      setIsStreaming(false);
      cleanup();
      cleanupEnd();
    });

    const cleanupError = window.claude.onStreamError((_event: unknown, error: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + `\n\n**Error:** ${error}` };
        return updated;
      });
      setIsStreaming(false);
      cleanup();
      cleanupEnd();
      cleanupError();
    });

    window.claude.stream(text);
  }, []);

  return (
    <div className="app">
      <ChatView messages={messages} />
      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
