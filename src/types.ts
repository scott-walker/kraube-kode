export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeAPI {
  stream: (prompt: string) => void;
  onStreamChunk: (cb: (event: unknown, chunk: string) => void) => () => void;
  onStreamEnd: (cb: () => void) => () => void;
  onStreamError: (cb: (event: unknown, error: string) => void) => () => void;
}

declare global {
  interface Window {
    claude: ClaudeAPI;
  }
}
