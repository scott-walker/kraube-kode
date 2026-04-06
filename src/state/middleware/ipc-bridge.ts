import { useStore } from '../store';
import { processEvent, streamBuffer } from '../stream-processor';
import { persistCurrentToolbarPrefs } from '../actions';
import { loadConnections } from '../connection-actions';
import type { StreamEvent } from '../../types';
import type { PermissionRequestPayload, ElicitationRequestPayload } from '../../core/types/interactive';
import { toolDetail } from '../../utils/tool-detail';

export function initIpcBridge(): () => void {
  // Load connections first — determines if setup is required
  loadConnections().then(() => {
    const { connectionSetupRequired } = useStore.getState();
    if (connectionSetupRequired) {
      useStore.setState({ sdkStatus: 'initializing', sdkMessage: '', sessionsLoading: false });
    }
  }).catch(() => {});

  const cleanupReady = window.claude.onInitReady(() => {
    const limit = useStore.getState().sessionsLimit;
    useStore.setState({ sdkStatus: 'ready', sdkMessage: '', sessionsLoading: true });
    window.claude.getCwd()
      .then(cwd => { if (cwd) useStore.setState({ activeCwd: cwd }); })
      .catch(() => {});
    window.claude.listSessions(limit)
      .then(sessions => useStore.setState({ sessions, sessionsLoading: false, sessionsHasMore: sessions.length >= limit }))
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
    const typed = event as StreamEvent;

    if (typed.type === 'system' && typed.subtype === 'init') {
      const cwd = (typed.data as Record<string, unknown>).cwd;
      if (typeof cwd === 'string' && cwd) useStore.setState({ activeCwd: cwd });
      return;
    }

    const blocks = streamBuffer.get();
    const result = processEvent(typed, blocks);

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
        const prevId = useStore.getState().activeSessionId;
        useStore.setState({ activeSessionId: result.sessionId });
        // Persist toolbar prefs for new sessions (first message assigns sessionId)
        if (!prevId) persistCurrentToolbarPrefs(result.sessionId);
        const lim = useStore.getState().sessionsLimit;
        window.claude.listSessions(lim)
          .then(sessions => useStore.setState({ sessions, sessionsLoading: false, sessionsHasMore: sessions.length >= lim }))
          .catch(() => {});
      }
    }
  });

  const cleanupPermission = window.claude.onPermissionRequest((_ev, data) => {
    const payload = data as PermissionRequestPayload;
    const detail = toolDetail(payload.toolName, payload.input) ?? JSON.stringify(payload.input).slice(0, 120);
    const block = { type: 'approval' as const, requestId: payload.requestId, tool: payload.toolName, command: detail };

    useStore.setState(s => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') {
        const blocks = [...(last.blocks ?? []), block];
        messages[messages.length - 1] = { ...last, blocks };
      } else {
        messages.push({ role: 'assistant', content: '', blocks: [block], streaming: true });
      }
      return { messages };
    });

    streamBuffer.get().push(block);
  });

  const cleanupElicitation = window.claude.onElicitationRequest((_ev, data) => {
    const payload = data as ElicitationRequestPayload;
    const block = {
      type: 'elicitation' as const,
      requestId: payload.requestId,
      serverName: payload.serverName,
      message: payload.message,
      mode: payload.mode,
      url: payload.url,
      requestedSchema: payload.requestedSchema,
    };

    useStore.setState(s => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') {
        const blocks = [...(last.blocks ?? []), block];
        messages[messages.length - 1] = { ...last, blocks };
      } else {
        messages.push({ role: 'assistant', content: '', blocks: [block], streaming: true });
      }
      return { messages };
    });

    streamBuffer.get().push(block);
  });

  // Load transcription config flag
  window.settings.load()
    .then(s => useStore.setState({ transcriptionConfigured: !!s.transcriptionApiKey }))
    .catch(() => {});

  // On HMR reload, init events already fired — poll current status
  window.claude.getSdkStatus().then(({ status, message }) => {
    if (status === 'ready') {
      const hmrLimit = useStore.getState().sessionsLimit;
      useStore.setState({ sdkStatus: 'ready', sdkMessage: '', sessionsLoading: true });
      window.claude.getCwd()
        .then(cwd => { if (cwd) useStore.setState({ activeCwd: cwd }); })
        .catch(() => {});
      window.claude.listSessions(hmrLimit)
        .then(sessions => useStore.setState({ sessions, sessionsLoading: false, sessionsHasMore: sessions.length >= hmrLimit }))
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
    cleanupPermission();
    cleanupElicitation();
  };
}
