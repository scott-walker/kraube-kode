import { create } from 'zustand';
import type { Message, McpServer, SessionInfo } from '../types';
import type { Theme } from '../theme';

export type SdkStatus = 'initializing' | 'ready' | 'error';
export type RecordingState = 'idle' | 'recording' | 'transcribing';

export interface AppState {
  // SDK
  sdkStatus: SdkStatus;
  sdkMessage: string;
  activeCwd: string;
  // Sessions
  sessions: SessionInfo[];
  sessionsLoading: boolean;
  activeSessionId: string;
  // Chat
  messages: Message[];
  messagesLoading: boolean;
  // Voice
  recordingState: RecordingState;
  transcriptionConfigured: boolean;
  // UI
  theme: Theme;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  attachedFiles: string[];
  dragOver: boolean;
  // MCP
  mcpServers: McpServer[];
  mcpLoading: boolean;
  mcpSelectedServer: string | null;
  // Misc
  memories: string[];
}

export const useStore = create<AppState>(() => ({
  sdkStatus: 'initializing',
  sdkMessage: 'Warming up SDK session…',
  activeCwd: '',
  sessions: [],
  sessionsLoading: true,
  activeSessionId: '',
  messages: [],
  messagesLoading: false,
  recordingState: 'idle',
  transcriptionConfigured: false,
  theme: 'dark',
  sidebarOpen: true,
  settingsOpen: false,
  attachedFiles: [],
  dragOver: false,
  mcpServers: [],
  mcpLoading: false,
  mcpSelectedServer: null,
  memories: [],
}));
