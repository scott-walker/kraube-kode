import { useState } from 'react';
import { Icons } from '../../icons';
import './CodeBlock.css';

interface Props {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language, filename }: Props) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block">
      <div className="code-block__header">
        <Icons.Code size={12} />
        <span className="code-block__filename">
          {filename || language}
        </span>
        <button
          onClick={handleCopy}
          className={`code-block__copy-btn${copied ? ' code-block__copy-btn--copied' : ''}`}
        >
          {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
        </button>
      </div>
      <pre className="code-block__pre">{code}</pre>
    </div>
  );
}
