import { useStore } from '../store';
import { processEvent, streamBuffer } from '../stream-processor';
import type { StreamEvent } from '../../types';

export function initIpcBridge(): () => void {
  const cleanupReady = window.claude.onInitReady(() => {
    useStore.setState({ sdkStatus: 'ready', sdkMessage: '', sessionsLoading: true });
    window.claude.listSessions()
      .then(sessions => useStore.setState({ sessions, sessionsLoading: false }))
      .catch(() => useStore.setState({ sessionsLoading: false }));
    window.mcp.getServerStatus()
      .then(mcpServers => {
        console.log('[ipc-bridge] MCP servers loaded:', mcpServers?.length ?? 'null');
        useStore.setState({ mcpServers });
      })
      .catch((err) => console.error('[ipc-bridge] MCP getServerStatus failed:', err));
  });

  const cleanupStage = window.claude.onInitStage((_ev, data) => {
    useStore.setState({ sdkMessage: data.message || data.stage });
  });

  const cleanupError = window.claude.onInitError((_ev, message) => {
    useStore.setState({ sdkStatus: 'error', sdkMessage: message });
  });

  const cleanupEvents = window.claude.onEvent((_ipcEvent, event) => {
    const blocks = streamBuffer.get();
    const result = processEvent(event as StreamEvent, blocks);

    useStore.setState(s => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant' && last.streaming) {
        messages[messages.length - 1] = {
          ...last,
          blocks: [...blocks],
          streaming: !result.done,
          tokens: result.tokens ?? last.tokens,
        };
      }
      return { messages };
    });

    if (result.done) {
      streamBuffer.clear();
      if (result.sessionId) {
        useStore.setState({ activeSessionId: result.sessionId });
        window.claude.listSessions()
          .then(sessions => useStore.setState({ sessions, sessionsLoading: false }))
          .catch(() => {});
      }
    }
  });

  // Load transcription config flag
  window.settings.load()
    .then(s => useStore.setState({ transcriptionConfigured: !!s.transcriptionApiKey }))
    .catch(() => {});

  // On HMR reload, init events already fired — poll current status
  window.claude.getSdkStatus().then(({ status, message }) => {
    if (status === 'ready') {
      useStore.setState({ sdkStatus: 'ready', sdkMessage: '', sessionsLoading: true });
      window.claude.listSessions()
        .then(sessions => useStore.setState({ sessions, sessionsLoading: false }))
        .catch(() => useStore.setState({ sessionsLoading: false }));
      window.mcp.getServerStatus()
        .then(mcpServers => {
          console.log('[ipc-bridge] MCP servers loaded (HMR):', mcpServers?.length ?? 'null');
          useStore.setState({ mcpServers });
        })
        .catch((err) => console.error('[ipc-bridge] MCP getServerStatus failed (HMR):', err));
    } else if (status === 'error') {
      useStore.setState({ sdkStatus: 'error', sdkMessage: message ?? '' });
    }
  }).catch(() => {});

  return () => {
    cleanupReady();
    cleanupStage();
    cleanupError();
    cleanupEvents();
  };
}
