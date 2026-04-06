import type { ReactElement } from 'react';
import MarkdownText from './MarkdownText';
import ThinkingBlock from '../inference/ThinkingBlock';
import ToolCallBlock from '../inference/ToolCallBlock';
import CodeBlock from '../inference/CodeBlock';
import DiffBlock from '../inference/DiffBlock';
import TerminalOutput from '../inference/TerminalOutput';
import LoopProgress from '../inference/LoopProgress';
import ApprovalBlock from '../inference/ApprovalBlock';
import ElicitationBlock from '../inference/ElicitationBlock';
import type { MessageBlock } from '../../types';

type BlockRenderer<T extends MessageBlock> = (block: T, key: number) => ReactElement | null;
type RendererMap = { [K in MessageBlock['type']]: BlockRenderer<Extract<MessageBlock, { type: K }>> };

const blockRegistry: RendererMap = {
  thinking:     (b, k) => <ThinkingBlock key={k} phase={b.phase} content={b.content} />,
  tool_call:    (b, k) => <ToolCallBlock key={k} name={b.name} status={b.status} detail={b.detail} duration={b.duration} />,
  code:         (b, k) => <CodeBlock key={k} code={b.code} language={b.language} filename={b.filename} />,
  diff:         (b, k) => <DiffBlock key={k} filename={b.filename} additions={b.additions} deletions={b.deletions} lines={b.lines} />,
  terminal:     (b, k) => <TerminalOutput key={k} output={b.output} />,
  loop_progress:(b, k) => <LoopProgress key={k} current={b.current} total={b.total} label={b.label} />,
  approval:     (b, k) => <ApprovalBlock key={k} requestId={b.requestId} tool={b.tool} command={b.command} resolved={b.resolved} decision={b.decision} />,
  elicitation:  (b, k) => <ElicitationBlock key={k} requestId={b.requestId} serverName={b.serverName} message={b.message} mode={b.mode} url={b.url} resolved={b.resolved} decision={b.decision} />,
  text:         (b, k) => <MarkdownText key={k} content={b.content} />,
  summary:      (b, k) => (
    <div key={k} className="message__summary">
      {b.stats.map((s, i) => {
        const mod = s.startsWith('+') ? 'message__summary-stat--positive'
                  : s.startsWith('-') ? 'message__summary-stat--negative' : undefined;
        return <span key={i} className={mod}>{s}</span>;
      })}
    </div>
  ),
};

export function renderBlock(block: MessageBlock, key: number): ReactElement | null {
  const renderer = blockRegistry[block.type] as BlockRenderer<MessageBlock>;
  return renderer(block, key);
}

export function groupToolCalls(blocks: MessageBlock[]): (MessageBlock | MessageBlock[])[] {
  const result: (MessageBlock | MessageBlock[])[] = [];
  let toolGroup: MessageBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'tool_call') {
      toolGroup.push(block);
    } else {
      if (toolGroup.length > 0) { result.push(toolGroup); toolGroup = []; }
      result.push(block);
    }
  }
  if (toolGroup.length > 0) result.push(toolGroup);
  return result;
}
