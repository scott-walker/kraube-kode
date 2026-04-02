import { memo } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  table: ({ children, ...props }) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
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
