import './TokenCounter.css';

interface Props {
  input: number;
  output: number;
}

export default function TokenCounter({ input, output }: Props) {
  return (
    <div className="token-counter">
      <span>&uarr; {(input / 1000).toFixed(1)}k</span>
      <span>&darr; {(output / 1000).toFixed(1)}k</span>
      <span>&Sigma; {((input + output) / 1000).toFixed(1)}k tokens</span>
    </div>
  );
}
