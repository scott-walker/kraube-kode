import { Icons } from '../../icons';

export default function TerminalOutput({ output }: { output: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg-code)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', background: 'var(--bg-code-header)', gap: 8 }}>
        <Icons.Terminal size={12} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--fg-tertiary)', fontWeight: 500 }}>Terminal Output</span>
      </div>
      <pre style={{ padding: '10px 16px', margin: 0, fontSize: 12, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg-code)' }}>
        {output}
      </pre>
    </div>
  );
}
