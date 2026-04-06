import type { StreamEvent } from './stream-event';
import type { SessionInfo } from './session';
import type { GlobalSettings } from './settings';
import type { Connection } from './connection';
import type { TranscriptionResult } from './transcription';
import type { McpServer, McpServerConfig, McpSetServersResult } from './mcp';
import type { PermissionRequestPayload, ElicitationRequestPayload } from './interactive';

export interface SlashCommand {
  name: string;
  description: string;
  kind: 'skill' | 'system' | 'mcp';
}

export interface ClaudeAPI {
  send: (prompt: string, files?: string[], options?: Record<string, string>) => void;
  abort: () => void;
  getSdkStatus: () => Promise<{ status: 'initializing' | 'ready' | 'error'; message?: string }>;
  listSessions: (limit?: number) => Promise<SessionInfo[]>;
  getSessionMessages: (sessionId: string) => Promise<Array<{
    type: string;
    uuid: string;
    session_id: string;
    message: unknown;
  }>>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  newSession: () => Promise<string | null>;
  resumeSession: (cwd: string) => Promise<{ instant: boolean }>;
  supportedCommands: () => Promise<SlashCommand[]>;
  getCwd: () => Promise<string>;
  saveTempImage: (bytes: Uint8Array, mimeType: string) => Promise<string>;
  readThumbnail: (filePath: string, size: number) => Promise<string | null>;
  pickFiles: () => Promise<string[]>;
  getPathForFile: (file: File) => string;
  respondPermission: (requestId: string, behavior: 'allow' | 'deny', message?: string) => void;
  respondElicitation: (requestId: string, action: 'accept' | 'decline' | 'cancel', content?: Record<string, unknown>) => void;
  onEvent: (cb: (event: unknown, data: StreamEvent) => void) => () => void;
  onPermissionRequest: (cb: (event: unknown, data: PermissionRequestPayload) => void) => () => void;
  onElicitationRequest: (cb: (event: unknown, data: ElicitationRequestPayload) => void) => () => void;
  onInitReady: (cb: () => void) => () => void;
  onInitStage: (cb: (event: unknown, data: { stage: string; message: string }) => void) => () => void;
  onInitError: (cb: (event: unknown, message: string) => void) => () => void;
}

export interface SettingsAPI {
  load: () => Promise<GlobalSettings>;
  save: (settings: GlobalSettings) => Promise<GlobalSettings>;
  loadSessionPrefs: (sessionId: string) => Promise<Record<string, string>>;
  saveSessionPref: (sessionId: string, key: string, value: string) => Promise<void>;
  deleteSessionPrefs: (sessionId: string) => Promise<void>;
}

export interface ConnectionAPI {
  list: () => Promise<Connection[]>;
  create: (data: Omit<Connection, 'id'>) => Promise<Connection>;
  update: (conn: Connection) => Promise<Connection>;
  delete: (id: string) => Promise<void>;
  setActive: (id: string) => Promise<{ instant: boolean }>;
  getActive: () => Promise<Connection | null>;
  pickDirectory: () => Promise<string | null>;
}

export interface WindowControlsAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  onConfirmClose: (cb: () => void) => () => void;
  confirmCloseResponse: (confirmed: boolean) => void;
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
    connection: ConnectionAPI;
    transcription: TranscriptionAPI;
    mcp: McpAPI;
  }
}
