import { memo, useMemo } from 'react';
import { Icons } from '../../icons';
import TokenCounter from '../inference/TokenCounter';
import TypingBar from '../inference/TypingBar';
import ThinkingBlock from '../inference/ThinkingBlock';
import FilePill from '../shared/FilePill';
import MarkdownText from './MarkdownText';
import { renderBlock, groupToolCalls } from './MessageBlocks';
import ToolGroup from '../inference/ToolGroup';
import type { Message } from '../../types';
import './MessageBubble.css';

interface Props { message: Message; }

export default memo(function MessageBubble({ message: msg }: Props) {
  const grouped = useMemo(
    () => msg.blocks ? groupToolCalls(msg.blocks) : null,
    [msg.blocks],
  );

  const isCommand = msg.role === 'user' && msg.content.startsWith('/');

  return (
    <div className={`message ${msg.role === 'user' && !isCommand ? 'message--user' : ''}`}>
      {msg.role === 'assistant' && (msg.streaming || msg.tokens) && (
        <div className="message__meta">
          {msg.streaming && (
            <span className="message__streaming-badge">
              <span className="animate-spin-fast flex"><Icons.Refresh size={11} /></span>
              streaming
            </span>
          )}
          {msg.tokens && (
            <TokenCounter input={msg.tokens.input} output={msg.tokens.output} />
          )}
        </div>
      )}

      <div className="message__body">
        {msg.role === 'user' && (
          <>
            {isCommand
              ? <span className="message__command">{msg.content}</span>
              : <div className="message__text">{msg.content}</div>
            }
            {msg.files && msg.files.length > 0 && (
              <div className="message__files">
                {msg.files.map((f, j) => <FilePill key={j} name={f} />)}
              </div>
            )}
          </>
        )}

        {msg.role === 'assistant' && grouped && grouped.map((item, j) => {
          if (Array.isArray(item)) {
            return <ToolGroup key={j} blocks={item} />;
          }
          return renderBlock(item, j);
        })}

        {msg.role === 'assistant' && !msg.blocks && msg.content && (
          <MarkdownText content={msg.content} />
        )}

        {msg.streaming && (
          <>
            {(!msg.blocks || msg.blocks.length === 0) && <ThinkingBlock phase="thinking" />}
            <TypingBar active={true} />
          </>
        )}
      </div>
    </div>
  );
});
