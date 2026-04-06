import { memo, useCallback, useMemo } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { highlightCode } from '../../services/syntax';

function copyAndFlash(el: HTMLElement) {
  const text = el.textContent ?? '';
  navigator.clipboard.writeText(text);
  const label = el.querySelector('.code-label') as HTMLElement;
  if (label) label.textContent = el.offsetWidth < 80 ? '\u2713' : '\u2713 Copied';
  el.classList.add('is-copied');
  setTimeout(() => el.classList.remove('is-copied'), 800);
}

function InlineCode({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    copyAndFlash(e.currentTarget);
  }, []);

  return <code {...props} onClick={handleClick}><span className="code-label" />{children}</code>;
}

function PreBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLPreElement>) => {
    const code = e.currentTarget.querySelector('code');
    if (code) copyAndFlash(code);
  }, []);

  return <pre {...props} onClick={handleClick}>{children}</pre>;
}

function HighlightedCode({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const lang = className?.replace('language-', '');
  const code = String(children).replace(/\n$/, '');
  const html = useMemo(() => highlightCode(code, lang), [code, lang]);

  return <code className={className} {...props} dangerouslySetInnerHTML={{ __html: html }} />;
}

const components: Components = {
  table: ({ children, ...props }) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  pre: PreBlock as Components['pre'],
  code: ({ children, className, ...props }) => {
    if (className?.startsWith('language-')) {
      return <HighlightedCode className={className} {...props}>{children}</HighlightedCode>;
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
