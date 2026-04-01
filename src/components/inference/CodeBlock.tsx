import { useState } from 'react';
import { Icons } from '../../icons';

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
    <div style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-code)', marginTop: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 14px',
        background: 'var(--bg-code-header)', gap: 8,
      }}>
        <Icons.Code size={12} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--fg-tertiary)', fontWeight: 500 }}>
          {filename || language}
        </span>
        <button onClick={handleCopy} style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
          color: copied ? 'var(--success)' : 'var(--fg-tertiary)', display: 'flex',
          transition: 'color 0.2s', padding: 2,
        }}>
          {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
        </button>
      </div>
      <pre style={{
        padding: '14px 16px', margin: 0, fontSize: 12.5, lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-code)',
        overflowX: 'auto',
      }}>{code}</pre>
    </div>
  );
}
