import { create } from 'zustand';
import type { Message, McpServer, SessionInfo } from '../types';
import type { Theme } from '../theme';

export type SdkStatus = 'initializing' | 'ready' | 'error';
export type RecordingState = 'idle' | 'recording' | 'transcribing';
export type ToolbarPermission = 'default' | 'acceptEdits' | 'plan';
export type ToolbarEffort = 'low' | 'medium' | 'high' | 'max';

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
  // Toolbar (per-session, persisted in session_prefs)
  toolbarModel: string;
  toolbarPermission: ToolbarPermission;
  toolbarEffort: ToolbarEffort;
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
  toolbarModel: 'sonnet',
  toolbarPermission: 'default',
  toolbarEffort: 'high',
  mcpServers: [],
  mcpLoading: false,
  mcpSelectedServer: null,
  memories: [],
}));
