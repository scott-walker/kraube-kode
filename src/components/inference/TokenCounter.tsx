interface Props {
  input: number;
  output: number;
}

export default function TokenCounter({ input, output }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      color: 'var(--fg-tertiary)', padding: '6px 0',
    }}>
      <span>↑ {(input / 1000).toFixed(1)}k</span>
      <span>↓ {(output / 1000).toFixed(1)}k</span>
      <span>Σ {((input + output) / 1000).toFixed(1)}k tokens</span>
    </div>
  );
}
