import { useState, useCallback } from 'react';
import { darkTheme, lightTheme, type Theme } from './theme';
import Sidebar from './components/sidebar/Sidebar';
import TopBar from './components/TopBar';
import ChatView from './components/ChatView';
import InputArea from './components/input/InputArea';
import SettingsPanel from './components/settings/SettingsPanel';
import { Icons } from './icons';
import type { Message, Session, McpServer } from './types';

const demoSessions: Session[] = [
  { id: 0, name: 'Convervox Frontend', project: '~/convervox', time: '2m ago', active: true },
  { id: 1, name: 'Fix auth middleware', project: '~/api-server', time: '1h ago', active: false },
  { id: 2, name: 'Database migration', project: '~/backend', time: '3h ago', active: false },
  { id: 3, name: 'README update', project: '~/claude-connector', time: 'yesterday', active: false },
];

const demoMcpServers: McpServer[] = [
  { name: 'filesystem', status: 'connected', tools: 12 },
  { name: 'github', status: 'connected', tools: 8 },
  { name: 'postgres', status: 'disconnected', tools: 5 },
  { name: 'notion', status: 'connected', tools: 16 },
  { name: 'browser', status: 'error', tools: 3 },
];

const demoMemories = [
  'Prefers TypeScript strict mode',
  'Uses pnpm as package manager',
  'Convention: kebab-case for file names',
  'Runs tests before commit',
  'Purple accent #6c5ce7 for Convervox',
];

const demoMessages: Message[] = [
  {
    role: 'user',
    content: 'Refactor the voice pipeline to use WebRTC instead of WebSocket for real-time audio streaming. The current implementation has latency issues. Also update the tests.',
    files: ['voice-pipeline.ts', 'rtc-config.json'],
  },
  {
    role: 'assistant',
    content: '',
    tokens: { input: 12400, output: 3200 },
    blocks: [
      { type: 'thinking', phase: 'thinking', content: 'I need to refactor the voice pipeline from WebSocket to WebRTC. Let me first understand the current architecture by reading the relevant files.' },
      { type: 'thinking', phase: 'reading', content: 'Reading voice-pipeline.ts, rtc-config.json, and the test files to understand the current implementation...' },
      { type: 'thinking', phase: 'planning', content: 'Plan: 1) Create RTCPeerConnection wrapper 2) Replace WS message handlers with data channels 3) Add ICE candidate handling 4) Update codec negotiation 5) Migrate tests' },
      { type: 'tool_call', name: 'Read', detail: 'src/voice/pipeline.ts', status: 'done', duration: '0.2' },
      { type: 'tool_call', name: 'Read', detail: 'src/voice/ws-handler.ts', status: 'done', duration: '0.1' },
      { type: 'tool_call', name: 'Search', detail: 'WebRTC references in codebase', status: 'done', duration: '0.8' },
      { type: 'tool_call', name: 'Read', detail: 'tests/voice-pipeline.test.ts', status: 'done', duration: '0.2' },
      { type: 'text', content: "I've analyzed the current voice pipeline. The WebSocket implementation buffers audio chunks at 20ms intervals before sending, which introduces ~60-80ms of latency. Here's the WebRTC refactor:" },
      {
        type: 'code', filename: 'src/voice/rtc-pipeline.ts', language: 'typescript',
        code: `export class RTCVoicePipeline {
  private pc: RTCPeerConnection;
  private audioChannel: RTCDataChannel;
  private mediaStream: MediaStream;

  constructor(config: RTCConfig) {
    this.pc = new RTCPeerConnection({
      iceServers: config.iceServers,
      iceCandidatePoolSize: 10,
    });
    this.setupDataChannel();
  }

  private setupDataChannel() {
    this.audioChannel = this.pc.createDataChannel('audio', {
      ordered: false,
      maxRetransmits: 0,
    });
  }

  async connect(offer: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }
}`,
      },
      { type: 'diff', filename: 'src/voice/pipeline.ts', additions: 42, deletions: 28, lines: '- const oldFunction = () => {\n-   return null;\n- }\n+ const newFunction = async () => {\n+   const result = await fetchData();\n+   return result;\n+ }' },
      { type: 'tool_call', name: 'Write', detail: 'src/voice/rtc-pipeline.ts', status: 'done', duration: '0.3' },
      { type: 'tool_call', name: 'Edit', detail: 'src/voice/pipeline.ts', status: 'done', duration: '0.2' },
      { type: 'tool_call', name: 'Write', detail: 'tests/rtc-pipeline.test.ts', status: 'done', duration: '0.4' },
      { type: 'thinking', phase: 'subagent', content: 'Running sub-agent to verify test coverage and fix any import issues...' },
      { type: 'tool_call', name: 'Bash', detail: 'pnpm test --filter voice', status: 'done', duration: '3.4' },
      {
        type: 'terminal',
        output: `✓ RTCVoicePipeline › creates peer connection (4ms)
✓ RTCVoicePipeline › establishes data channel (12ms)
✓ RTCVoicePipeline › handles ICE candidates (8ms)
✓ RTCVoicePipeline › streams audio chunks (23ms)
✓ RTCVoicePipeline › reconnects on failure (15ms)

Tests: 5 passed, 5 total
Time:  3.2s`,
      },
      { type: 'loop_progress', current: 5, total: 5, label: 'Test iterations' },
      { type: 'text', content: 'All 5 tests pass. The refactored pipeline uses WebRTC data channels with `ordered: false` and `maxRetransmits: 0` for minimal latency. Expected latency improvement: ~60ms → ~15ms.' },
      { type: 'summary', stats: ['3 files modified', '1 file created', '+42 lines', '-28 lines', '5/5 tests pass'] },
    ],
  },
  {
    role: 'assistant',
    content: '',
    blocks: [
      { type: 'text', content: "I'd like to commit these changes. Here's what I'll run:" },
      { type: 'approval', tool: 'Bash', command: 'git add -A && git commit -m "refactor: migrate voice pipeline to WebRTC"' },
    ],
  },
  {
    role: 'assistant',
    content: '',
    streaming: true,
    blocks: [
      { type: 'thinking', phase: 'thinking' },
      { type: 'tool_call', name: 'Read', detail: 'src/voice/codec-negotiator.ts', status: 'running' },
    ],
  },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(0);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const themeVars = theme === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const handleSend = useCallback((text: string, files: string[]) => {
    const userMsg: Message = { role: 'user', content: text, files: files.length > 0 ? files : undefined };
    const assistantMsg: Message = { role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setAttachedFiles([]);
    setIsStreaming(true);

    const cleanupChunk = window.claude.onStreamChunk((_event: unknown, chunk: string) => {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + chunk };
        return updated;
      });
    });

    const cleanupEnd = window.claude.onStreamEnd(() => {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, streaming: false };
        return updated;
      });
      setIsStreaming(false);
      cleanupChunk();
      cleanupEnd();
      cleanupError();
    });

    const cleanupError = window.claude.onStreamError((_event: unknown, error: string) => {
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + `\n\n**Error:** ${error}`, streaming: false };
        return updated;
      });
      setIsStreaming(false);
      cleanupChunk();
      cleanupEnd();
      cleanupError();
    });

    window.claude.stream(text);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...files.map(f => f.name)]);
  }, []);

  return (
    <div style={{
      ...themeVars,
      width: '100%', height: '100vh', display: 'flex',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: 'var(--bg-primary)', color: 'var(--fg-primary)', overflow: 'hidden',
      transition: 'background 0.4s ease, color 0.4s ease',
    } as React.CSSProperties}>
      {sidebarOpen && (
        <Sidebar
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
          sessions={demoSessions}
          activeSession={activeSession}
          onSelectSession={setActiveSession}
          mcpServers={demoMcpServers}
          memories={demoMemories}
        />
      )}

      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {dragOver && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', animation: 'fade-in 0.15s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: 'var(--accent)' }}>
              <Icons.Paperclip size={48} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>Drop files to attach</span>
            </div>
          </div>
        )}

        <TopBar session={demoSessions[activeSession]} onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <ChatView messages={messages} />
        <InputArea
          onSend={handleSend}
          disabled={isStreaming}
          attachedFiles={attachedFiles}
          onAttachFiles={files => setAttachedFiles(prev => [...prev, ...files])}
          onRemoveFile={i => setAttachedFiles(prev => prev.filter((_, j) => j !== i))}
        />
      </div>

      {settingsOpen && (
        <SettingsPanel
          theme={theme}
          onToggleTheme={toggleTheme}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
