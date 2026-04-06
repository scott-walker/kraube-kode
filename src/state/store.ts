import { create } from 'zustand';
import type { Message, McpServer, SessionInfo, Connection } from '../types';
import type { Theme } from '../theme';

export type SdkStatus = 'initializing' | 'ready' | 'error';
export type RecordingState = 'idle' | 'recording' | 'transcribing';
export type ToolbarPermission = 'default' | 'acceptEdits' | 'plan';
export type ToolbarEffort = 'low' | 'medium' | 'high' | 'max';
export type AppView = 'chat' | 'settings' | 'management';
export type SettingsSection = 'connections' | 'permissions' | 'voice' | 'appearance';
export type ManagementSection = 'sessions' | 'mcp' | 'memory';

export interface AppState {
  // Connections
  connections: Connection[];
  activeConnectionId: string;
  connectionSetupRequired: boolean;
  // SDK
  sdkStatus: SdkStatus;
  sdkMessage: string;
  activeCwd: string;
  // Sessions
  sessions: SessionInfo[];
  sessionsLoading: boolean;
  sessionsLoadingMore: boolean;
  sessionsHasMore: boolean;
  sessionsLimit: number;
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
  currentView: AppView;
  settingsSection: SettingsSection;
  managementSection: ManagementSection;
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
  // Overlays
  overlayCount: number;
  // Misc
  memories: string[];
}

export const useStore = create<AppState>(() => ({
  connections: [],
  activeConnectionId: '',
  connectionSetupRequired: false,
  sdkStatus: 'initializing',
  sdkMessage: 'Warming up SDK session…',
  activeCwd: '',
  sessions: [],
  sessionsLoading: true,
  sessionsLoadingMore: false,
  sessionsHasMore: true,
  sessionsLimit: 30,
  activeSessionId: '',
  messages: [],
  messagesLoading: false,
  recordingState: 'idle',
  transcriptionConfigured: false,
  theme: 'dark',
  sidebarOpen: true,
  currentView: 'chat',
  settingsSection: 'connections',
  managementSection: 'sessions',
  attachedFiles: [],
  dragOver: false,
  toolbarModel: 'sonnet',
  toolbarPermission: 'default',
  toolbarEffort: 'high',
  mcpServers: [],
  mcpLoading: false,
  mcpSelectedServer: null,
  overlayCount: 0,
  memories: [],
}));
