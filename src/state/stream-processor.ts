import type { MessageBlock, StreamEvent, ToolCallData } from '../types';
import { diffFromEdit } from '../utils/diff-from-edit';
import { toolDetail } from '../utils/tool-detail';

// ─── Mutable stream buffer (one stream at a time, per architecture §08) ───

let _blocks: MessageBlock[] = [];

export const streamBuffer = {
  get: (): MessageBlock[]  => _blocks,
  init: (initial: MessageBlock[]) => { _blocks = [...initial]; },
  clear: () => { _blocks = []; },
};

// ─── Helpers ───

function markRunningToolsDone(blocks: MessageBlock[]) {
  for (const b of blocks) {
    if (b.type === 'tool_call' && (b as ToolCallData).status === 'running') {
      (b as ToolCallData).status = 'done';
    }
  }
}

function removeActiveThinking(blocks: MessageBlock[]) {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (b.type === 'thinking' && b.phase === 'thinking' && !b.content) {
      blocks.splice(i, 1);
    }
  }
}

// ─── Event processor ───

export type ProcessResult = {
  done: boolean;
  tokens?: { input: number; output: number };
  sessionId?: string;
};

export function processEvent(event: StreamEvent, blocks: MessageBlock[]): ProcessResult {
  switch (event.type) {
    case 'text': {
      const last = blocks[blocks.length - 1];
      if (last?.type === 'text') { last.content += event.text; }
      else { blocks.push({ type: 'text', content: event.text }); }
      markRunningToolsDone(blocks);
      return { done: false };
    }

    case 'tool_use': {
      markRunningToolsDone(blocks);
      removeActiveThinking(blocks);
      if (event.toolName === 'Edit') {
        const diff = diffFromEdit(event.toolInput);
        if (diff) { blocks.push(diff); return { done: false }; }
      }
      blocks.push({ type: 'tool_call', name: event.toolName, detail: toolDetail(event.toolName, event.toolInput), status: 'running' } as ToolCallData);
      return { done: false };
    }

    case 'result': {
      markRunningToolsDone(blocks);
      removeActiveThinking(blocks);
      const stats: string[] = [];
      if (event.numTurns)  stats.push(`${event.numTurns} turns`);
      if (event.usage) {
        stats.push(`${(event.usage.inputTokens / 1000).toFixed(1)}k in`);
        stats.push(`${(event.usage.outputTokens / 1000).toFixed(1)}k out`);
      }
      if (event.durationMs) stats.push(`${(event.durationMs / 1000).toFixed(1)}s`);
      if (event.cost != null) stats.push(`$${event.cost.toFixed(4)}`);
      if (stats.length > 0) blocks.push({ type: 'summary', stats });
      return {
        done: true,
        tokens: event.usage ? { input: event.usage.inputTokens, output: event.usage.outputTokens } : undefined,
        sessionId: event.sessionId,
      };
    }

    case 'error': {
      markRunningToolsDone(blocks);
      removeActiveThinking(blocks);
      blocks.push({ type: 'text', content: `**Error:** ${event.message}` });
      return { done: true };
    }

    case 'task_started': {
      blocks.push({ type: 'thinking', phase: 'subagent', content: event.description });
      return { done: false };
    }

    case 'task_progress': {
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (b.type === 'thinking' && b.phase === 'subagent') { b.content = event.summary || event.description; break; }
      }
      return { done: false };
    }

    case 'task_notification': {
      for (let i = blocks.length - 1; i >= 0; i--) {
        if (blocks[i].type === 'thinking' && (blocks[i] as { phase: string }).phase === 'subagent') { blocks.splice(i, 1); break; }
      }
      if (event.summary) blocks.push({ type: 'text', content: event.summary });
      return { done: false };
    }

    case 'rate_limit': {
      if (event.status === 'rejected') blocks.push({ type: 'text', content: '⏳ Rate limited — waiting for reset…' });
      return { done: false };
    }

    default:
      return { done: false };
  }
}
