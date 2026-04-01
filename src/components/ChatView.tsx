import { useEffect, useRef } from 'react';
import { Icons } from '../icons';
import FilePill from './FilePill';
import ThinkingBlock from './inference/ThinkingBlock';
import ToolCallBlock from './inference/ToolCallBlock';
import CodeBlock from './inference/CodeBlock';
import DiffBlock from './inference/DiffBlock';
import TerminalOutput from './inference/TerminalOutput';
import LoopProgress from './inference/LoopProgress';
import ApprovalBlock from './inference/ApprovalBlock';
import TokenCounter from './inference/TokenCounter';
import TypingBar from './inference/TypingBar';
import PulsingDots from './inference/PulsingDots';
import type { Message, MessageBlock } from '../types';

function renderBlock(block: MessageBlock, key: number) {
  switch (block.type) {
    case 'thinking':
      return <ThinkingBlock key={key} phase={block.phase} content={block.content} />;
    case 'tool_call':
      return <ToolCallBlock key={key} name={block.name} status={block.status} detail={block.detail} duration={block.duration} />;
    case 'code':
      return <CodeBlock key={key} code={block.code} language={block.language} filename={block.filename} />;
    case 'diff':
      return <DiffBlock key={key} filename={block.filename} additions={block.additions} deletions={block.deletions} lines={block.lines} />;
    case 'terminal':
      return <TerminalOutput key={key} output={block.output} />;
    case 'loop_progress':
      return <LoopProgress key={key} current={block.current} total={block.total} label={block.label} />;
    case 'approval':
      return <ApprovalBlock key={key} tool={block.tool} command={block.command} onApprove={() => {}} onDeny={() => {}} />;
    case 'text':
      return (
        <div key={key} style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fg-primary)' }}
          dangerouslySetInnerHTML={{
            __html: block.content.replace(
              /`([^`]+)`/g,
              '<code style="font-family: \'JetBrains Mono\', monospace; font-size: 13px; background: var(--bg-elevated); padding: 1px 6px; border-radius: 4px;">$1</code>'
            ),
          }}
        />
      );
    case 'summary':
      return (
        <div key={key} style={{
          display: 'flex', gap: 24, padding: '12px 0', marginTop: 4,
          fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-tertiary)',
        }}>
          {block.stats.map((s, i) => {
            const color = s.startsWith('+') ? 'var(--success)' : s.startsWith('-') ? 'var(--error)' : undefined;
            return <span key={i} style={color ? { color } : undefined}>{s}</span>;
          })}
        </div>
      );
    default:
      return null;
  }
}

function groupToolCalls(blocks: MessageBlock[]): (MessageBlock | MessageBlock[])[] {
  const result: (MessageBlock | MessageBlock[])[] = [];
  let toolGroup: MessageBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'tool_call') {
      toolGroup.push(block);
    } else {
      if (toolGroup.length > 0) {
        result.push(toolGroup);
        toolGroup = [];
      }
      result.push(block);
    }
  }
  if (toolGroup.length > 0) result.push(toolGroup);
  return result;
}

interface Props {
  messages: Message[];
}

export default function ChatView({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '60vh', opacity: 0.4,
          }}>
            <Icons.Terminal size={48} />
            <h2 style={{ fontSize: 18, fontWeight: 500, marginTop: 16 }}>Kraube Kode</h2>
            <p style={{ fontSize: 13, color: 'var(--fg-tertiary)' }}>Start a conversation with Claude</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 32, animation: 'slide-up 0.3s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: msg.role === 'user' ? 'var(--bg-elevated)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: msg.role === 'user' ? 'var(--fg-secondary)' : undefined,
              }}>
                {msg.role === 'user' ? 'Y' : <Icons.Zap size={12} />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{msg.role === 'user' ? 'You' : 'Claude'}</span>
              {msg.role === 'assistant' && msg.streaming && (
                <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ animation: 'spin 2s linear infinite', display: 'inline-flex' }}><Icons.Refresh size={11} /></span>
                  streaming
                </span>
              )}
              {msg.role === 'assistant' && msg.tokens && <TokenCounter input={msg.tokens.input} output={msg.tokens.output} />}
            </div>

            {/* Body */}
            <div style={{ paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* User: plain text + files */}
              {msg.role === 'user' && (
                <>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--fg-primary)' }}>{msg.content}</div>
                  {msg.files && msg.files.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {msg.files.map((f, j) => <FilePill key={j} name={f} />)}
                    </div>
                  )}
                </>
              )}

              {/* Assistant: blocks */}
              {msg.role === 'assistant' && msg.blocks && (
                <>
                  {groupToolCalls(msg.blocks).map((item, j) => {
                    if (Array.isArray(item)) {
                      return (
                        <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {item.map((block, k) => renderBlock(block, k))}
                        </div>
                      );
                    }
                    return renderBlock(item, j);
                  })}
                </>
              )}

              {/* Assistant: plain text fallback (streaming text without blocks) */}
              {msg.role === 'assistant' && !msg.blocks && msg.content && (
                <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--fg-primary)' }}>{msg.content}</div>
              )}

              {/* Streaming indicators */}
              {msg.streaming && (
                <>
                  {(!msg.blocks || msg.blocks.length === 0) && <ThinkingBlock phase="thinking" />}
                  <TypingBar active={true} />
                </>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
