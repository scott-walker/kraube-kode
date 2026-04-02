import type { Message, MessageBlock } from '../core/types/message';
import { isToolVisible } from './tool-visibility';
import { diffFromEdit } from './diff-from-edit';

interface RawContentBlock {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: string;
}

interface RawSessionEntry {
  type: string;
  message: {
    role: 'user' | 'assistant';
    content: string | RawContentBlock[];
  };
}

const HIDDEN_TAGS = /^<(system-reminder|local-command)/;
const TASK_TAG = /^<task-notification>/;
const COMMAND_TAG = /^<command-name>/;

function isHiddenSystem(text: string): boolean {
  return HIDDEN_TAGS.test(text.trim());
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  return re.exec(xml)?.[1]?.trim() ?? '';
}

function parseTaskNotification(_text: string): MessageBlock | null {
  return null;
}

function parseCommand(text: string): string | null {
  const name = extractTag(text, 'command-name');
  return name || null;
}

function mapContentBlocks(blocks: RawContentBlock[]): { text: string; messageBlocks: MessageBlock[] } {
  let text = '';
  const messageBlocks: MessageBlock[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'text':
        text += block.text ?? '';
        messageBlocks.push({ type: 'text', content: block.text ?? '' });
        break;
      case 'tool_use': {
        const name = block.name ?? 'unknown';
        if (name === 'Edit') {
          const diff = diffFromEdit(block.input ?? {});
          if (diff) { messageBlocks.push(diff); break; }
        }
        if (isToolVisible(name)) {
          messageBlocks.push({
            type: 'tool_call',
            name,
            detail: toolDetail(name, block.input ?? {}),
            status: 'done',
          });
        }
        break;
      }
      case 'tool_result':
        break;
    }
  }

  return { text, messageBlocks };
}

function toolDetail(name: string, input: Record<string, unknown>): string | undefined {
  const truncate = (s: string | undefined) => s && s.length > 60 ? s.slice(0, 60) + '…' : s;
  switch (name) {
    case 'Read': case 'Write': case 'Edit': return input.file_path as string | undefined;
    case 'Bash':   return truncate(input.command as string | undefined);
    case 'Grep':   return input.pattern as string | undefined;
    case 'Glob':   return input.pattern as string | undefined;
    case 'Agent':  return input.description as string | undefined;
    default:       return undefined;
  }
}

function tryParseSystemText(text: string, messages: Message[]): boolean {
  const trimmed = text.trim();

  if (isHiddenSystem(trimmed)) return true;

  if (TASK_TAG.test(trimmed)) {
    const block = parseTaskNotification(trimmed);
    if (block) {
      const prev = messages[messages.length - 1];
      if (prev?.role === 'assistant' && prev.blocks) {
        prev.blocks.push(block);
      } else {
        messages.push({ role: 'assistant', content: '', blocks: [block] });
      }
    }
    return true;
  }

  if (COMMAND_TAG.test(trimmed)) {
    const cmd = parseCommand(trimmed);
    if (cmd) {
      messages.push({ role: 'user', content: cmd.startsWith('/') ? cmd : `/${cmd}` });
    }
    return true;
  }

  return false;
}

export function mapSessionMessages(raw: unknown[]): Message[] {
  const messages: Message[] = [];

  for (const item of raw) {
    const entry = item as RawSessionEntry;
    if (entry.type !== 'human' && entry.type !== 'user' && entry.type !== 'assistant') continue;
    const msg = entry.message;
    if (!msg?.role) continue;

    if (typeof msg.content === 'string') {
      if (!msg.content.trim()) continue;
      if (msg.role === 'user' && tryParseSystemText(msg.content, messages)) continue;
      messages.push({ role: msg.role, content: msg.content });
    } else if (Array.isArray(msg.content)) {
      if (msg.role === 'user' && msg.content.every((b: RawContentBlock) => b.type === 'tool_result')) continue;
      if (msg.role === 'user' && msg.content.every((b: RawContentBlock) =>
        b.type === 'tool_result' || (b.type === 'text' && (isHiddenSystem(b.text?.trim() ?? '') || TASK_TAG.test(b.text?.trim() ?? ''))),
      )) {
        for (const b of msg.content) {
          if (b.type === 'text' && TASK_TAG.test(b.text?.trim() ?? '')) {
            tryParseSystemText(b.text!, messages);
          }
        }
        continue;
      }
      const { text, messageBlocks } = mapContentBlocks(msg.content);
      if (!text.trim() && messageBlocks.length === 0) continue;
      messages.push({
        role: msg.role,
        content: text,
        blocks: messageBlocks.length > 0 ? messageBlocks : undefined,
      });
    }
  }

  return messages;
}
