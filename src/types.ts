// ─── Session ───
export interface Session {
  id: number;
  name: string;
  project: string;
  time: string;
  active: boolean;
}

// ─── MCP ───
export type McpStatus = 'connected' | 'disconnected' | 'error';

export interface McpServer {
  name: string;
  status: McpStatus;
  tools: number;
}

// ─── Messages ───
export type ThinkingPhase = 'thinking' | 'planning' | 'reading' | 'searching' | 'subagent';
export type ToolStatus = 'running' | 'done' | 'error';

export interface ThinkingBlockData {
  type: 'thinking';
  phase: ThinkingPhase;
  content?: string;
}

export interface ToolCallData {
  type: 'tool_call';
  name: string;
  detail?: string;
  status: ToolStatus;
  duration?: string;
}

export interface CodeBlockData {
  type: 'code';
  code: string;
  language?: string;
  filename?: string;
}

export interface DiffBlockData {
  type: 'diff';
  filename: string;
  additions: number;
  deletions: number;
  lines: string;
}

export interface TerminalOutputData {
  type: 'terminal';
  output: string;
}

export interface LoopProgressData {
  type: 'loop_progress';
  current: number;
  total: number;
  label: string;
}

export interface TextBlockData {
  type: 'text';
  content: string;
}

export interface ApprovalData {
  type: 'approval';
  tool: string;
  command: string;
}

export interface SummaryStatsData {
  type: 'summary';
  stats: string[];
}

export type MessageBlock =
  | ThinkingBlockData
  | ToolCallData
  | CodeBlockData
  | DiffBlockData
  | TerminalOutputData
  | LoopProgressData
  | TextBlockData
  | ApprovalData
  | SummaryStatsData;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  blocks?: MessageBlock[];
  files?: string[];
  tokens?: { input: number; output: number };
  streaming?: boolean;
}

// ─── IPC ───
export interface ClaudeAPI {
  stream: (prompt: string) => void;
  onStreamChunk: (cb: (event: unknown, chunk: string) => void) => () => void;
  onStreamEnd: (cb: () => void) => () => void;
  onStreamError: (cb: (event: unknown, error: string) => void) => () => void;
}

declare global {
  interface Window {
    claude: ClaudeAPI;
  }
}
