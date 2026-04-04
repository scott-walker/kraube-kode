import type { StreamEvent } from '../types/stream-event';

export interface InitStageInfo {
  stage: string;
  message: string;
}

export interface IClaudePort {
  init(): Promise<void>;
  reinit(settings: { executable: string; configDir: string; permissionMode: string; model: string }): void;
  newSession(cwd: string): void;

  readonly ready: boolean;
  readonly initError: string | null;
  readonly cwd: string;

  stream(prompt: string): AsyncIterable<StreamEvent>;
  abort(): void;
  close(): void;

  listSessions(limit?: number): Promise<Array<{
    sessionId: string;
    summary: string;
    lastModified: number;
    cwd?: string;
    firstPrompt?: string;
    gitBranch?: string;
  }>>;

  deleteSession(sessionId: string): Promise<boolean>;

  getSessionMessages(sessionId: string): Promise<Array<{
    type: string;
    uuid: string;
    session_id: string;
    message: unknown;
  }>>;

  supportedCommands(): Promise<Array<{ name: string; description: string; argumentHint?: string }>>;

  onInitStage(cb: (info: InitStageInfo) => void): () => void;
  onInitReady(cb: () => void): () => void;
  onInitError(cb: (error: string) => void): () => void;
}
