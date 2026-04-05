import type { StreamEvent } from './stream-event';
import type { SessionInfo } from './session';
import type { AppSettings } from './settings';
import type { TranscriptionResult } from './transcription';
import type { McpServer, McpServerConfig, McpSetServersResult } from './mcp';

export interface SlashCommand {
  name: string;
  description: string;
  kind: 'skill' | 'system' | 'mcp';
}

export interface ClaudeAPI {
  send: (prompt: string, files?: string[], options?: Record<string, string>) => void;
  abort: () => void;
  getSdkStatus: () => Promise<{ status: 'initializing' | 'ready' | 'error'; message?: string }>;
  listSessions: () => Promise<SessionInfo[]>;
  getSessionMessages: (sessionId: string) => Promise<Array<{
    type: string;
    uuid: string;
    session_id: string;
    message: unknown;
  }>>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  newSession: () => Promise<string | null>;
  supportedCommands: () => Promise<SlashCommand[]>;
  getCwd: () => Promise<string>;
  saveTempImage: (bytes: Uint8Array, mimeType: string) => Promise<string>;
  onEvent: (cb: (event: unknown, data: StreamEvent) => void) => () => void;
  onInitReady: (cb: () => void) => () => void;
  onInitStage: (cb: (event: unknown, data: { stage: string; message: string }) => void) => () => void;
  onInitError: (cb: (event: unknown, message: string) => void) => () => void;
}

export interface SettingsAPI {
  load: () => Promise<AppSettings>;
  save: (settings: AppSettings) => Promise<AppSettings>;
  loadSessionPrefs: (sessionId: string) => Promise<Record<string, string>>;
  saveSessionPref: (sessionId: string, key: string, value: string) => Promise<void>;
  deleteSessionPrefs: (sessionId: string) => Promise<void>;
}

export interface WindowControlsAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
}

export interface TranscriptionAPI {
  transcribe: (audioBytes: Uint8Array, mimeType: string) => Promise<TranscriptionResult>;
}

export interface McpAPI {
  getServerStatus: () => Promise<McpServer[]>;
  setServers: (servers: Record<string, McpServerConfig>) => Promise<McpSetServersResult>;
  toggleServer: (name: string, enabled: boolean) => Promise<void>;
  reconnectServer: (name: string) => Promise<void>;
}

declare global {
  interface Window {
    claude: ClaudeAPI;
    windowControls: WindowControlsAPI;
    settings: SettingsAPI;
    transcription: TranscriptionAPI;
    mcp: McpAPI;
  }
}
