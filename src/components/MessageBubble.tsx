import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  return (
    <div className={`message message-${message.role}`}>
      <div className="message-label">
        {message.role === 'user' ? 'You' : 'Claude'}
      </div>
      <div className="message-content">
        {message.role === 'user' ? (
          <p>{message.content}</p>
        ) : (
          <Markdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                return inline ? (
                  <code className={className} {...props}>{children}</code>
                ) : (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {message.content}
          </Markdown>
        )}
      </div>
    </div>
  );
}
