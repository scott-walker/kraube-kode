import { Icons } from '../../icons';
import './TerminalOutput.css';

export default function TerminalOutput({ output }: { output: string }) {
  return (
    <div className="terminal-output">
      <div className="terminal-output__header">
        <Icons.Terminal size={12} />
        <span className="terminal-output__title">Terminal Output</span>
      </div>
      <pre className="terminal-output__pre">
        {output}
      </pre>
    </div>
  );
}
