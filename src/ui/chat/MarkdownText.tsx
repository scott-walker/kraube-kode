import { memo, useCallback } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function InlineCode({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const text = el.textContent ?? '';
    navigator.clipboard.writeText(text);
    const label = el.querySelector('.code-label') as HTMLElement;
    if (label) label.textContent = el.offsetWidth < 80 ? '✓' : '✓ Copied';
    el.classList.add('is-copied');
    setTimeout(() => el.classList.remove('is-copied'), 800);
  }, []);

  return <code {...props} onClick={handleClick}><span className="code-label" />{children}</code>;
}

const components: Components = {
  table: ({ children, ...props }) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  code: ({ children, className, ...props }) => {
    if (className?.startsWith('language-')) {
      return <code className={className} {...props}>{children}</code>;
    }
    return <InlineCode {...props}>{children}</InlineCode>;
  },
};

interface Props {
  content: string;
  className?: string;
}

export default memo(function MarkdownText({ content, className }: Props) {
  return (
    <div className={className ?? 'message__text'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  );
});
