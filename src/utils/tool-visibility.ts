const HIDDEN_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Agent']);

export function isToolVisible(name: string): boolean {
  return !HIDDEN_TOOLS.has(name);
}
