import { useMemo } from 'react';
import { useStore } from './store';
import type { AppState } from './store';

const selectIsStreaming = (s: AppState) => {
  const last = s.messages[s.messages.length - 1];
  return last?.role === 'assistant' && last?.streaming === true;
};

export const useTheme           = () => useStore(s => s.theme);
export const useIsStreaming      = () => useStore(selectIsStreaming);
export const useSidebarOpen     = () => useStore(s => s.sidebarOpen);
export const useSettingsOpen    = () => useStore(s => s.settingsOpen);
export const useMessages        = () => useStore(s => s.messages);
export const useSessions         = () => useStore(s => s.sessions);
export const useSessionsLoading  = () => useStore(s => s.sessionsLoading);
export const useActiveSessionId  = () => useStore(s => s.activeSessionId);
export const useMessagesLoading  = () => useStore(s => s.messagesLoading);
export const useAttachedFiles   = () => useStore(s => s.attachedFiles);
export const useDragOver        = () => useStore(s => s.dragOver);
export const useMcpServers      = () => useStore(s => s.mcpServers);
export const useMcpLoading      = () => useStore(s => s.mcpLoading);
export const useMcpSelectedServer = () => {
  const name = useStore(s => s.mcpSelectedServer);
  const servers = useStore(s => s.mcpServers);
  return useMemo(() => {
    if (!name) return null;
    return servers.find(srv => srv.name === name) ?? null;
  }, [name, servers]);
};
export const useMcpServersByScope = () => {
  const servers = useStore(s => s.mcpServers);
  return useMemo(() => {
    const grouped: Record<string, typeof servers> = { project: [], global: [], marketplace: [] };
    for (const srv of servers) {
      (grouped[srv.scope] ??= []).push(srv);
    }
    return grouped;
  }, [servers]);
};
export const useMemories            = () => useStore(s => s.memories);
export const useToolbarModel            = () => useStore(s => s.toolbarModel);
export const useToolbarPermission   = () => useStore(s => s.toolbarPermission);
export const useToolbarEffort       = () => useStore(s => s.toolbarEffort);
export const useCanSend         = () => useStore(s => s.sdkStatus === 'ready' && !selectIsStreaming(s));
export const useSdkStatus        = () => useStore(s => s.sdkStatus);
export const useSdkMessage       = () => useStore(s => s.sdkMessage);
export const useActiveCwd        = () => useStore(s => s.activeCwd);
export const useRecordingState          = () => useStore(s => s.recordingState);
export const useTranscriptionConfigured = () => useStore(s => s.transcriptionConfigured);
