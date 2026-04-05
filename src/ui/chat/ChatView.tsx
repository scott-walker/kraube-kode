import { memo } from 'react';
import { useMessages, useMessagesLoading } from '../../state/selectors';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { Icons } from '../../icons';
import MessageBubble from './MessageBubble';
import EmptyState from './EmptyState';
import CopyButton from './CopyButton';
import PulsingDots from '../inference/PulsingDots';
import './ChatView.css';

export default memo(function ChatView() {
  const messages = useMessages();
  const messagesLoading = useMessagesLoading();
  const bottomRef = useAutoScroll(messages);

  return (
    <div className="chat-view">
      <div className="chat-view__inner">
        {messagesLoading && messages.length === 0 && (
          <div className="chat-view__loading">
            <PulsingDots />
          </div>
        )}
        {!messagesLoading && messages.length === 0 && <EmptyState />}
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const showSep = prev && prev.role !== msg.role;
          return (
            <div key={i}>
              {showSep && (
                <div className="chat-view__separator">
                  <div className="chat-view__separator-row">
                    <span className={`chat-view__separator-label${msg.role === 'assistant' ? ' chat-view__separator-label--ai' : ''}`}>
                      {msg.role === 'user'
                        ? <><Icons.Prompt size={12} /> YOU</>
                        : <><Icons.Sparkle size={12} /> KRAUBE</>
                      }
                    </span>
                    <CopyButton text={prev.content ?? ''} />
                  </div>
                  <hr className="chat-view__separator-line" />
                </div>
              )}
              <MessageBubble message={msg} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
});
