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
  requestId: string;
  tool: string;
  command: string;
  resolved?: boolean;
  decision?: 'allow' | 'deny';
}

export interface ElicitationData {
  type: 'elicitation';
  requestId: string;
  serverName: string;
  message: string;
  mode?: 'form' | 'url';
  url?: string;
  requestedSchema?: Record<string, unknown>;
  resolved?: boolean;
  decision?: 'accept' | 'decline' | 'cancel';
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
  | ElicitationData
  | SummaryStatsData;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  blocks?: MessageBlock[];
  files?: string[];
  tokens?: { input: number; output: number };
  streaming?: boolean;
}
