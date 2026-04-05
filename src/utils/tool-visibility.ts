const HIDDEN_TOOLS = new Set([
  'Read', 'Grep', 'Glob', 'Agent',
  'ToolSearch',
  'TaskCreate', 'TaskUpdate', 'TaskGet', 'TaskList', 'TaskStop', 'TaskOutput',
]);

export function isToolVisible(name: string): boolean {
  return !HIDDEN_TOOLS.has(name);
}
