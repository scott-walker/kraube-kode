export function toolDetail(name: string, input: Record<string, unknown>): string | undefined {
  const truncate = (s: string | undefined, max = 60) =>
    s && s.length > max ? s.slice(0, max) + '…' : s;
  switch (name) {
    case 'Read': case 'Write': case 'Edit':
      return input.file_path as string | undefined;
    case 'Bash':
      return truncate(input.command as string | undefined);
    case 'Grep': case 'Glob':
      return input.pattern as string | undefined;
    case 'Agent':
      return input.description as string | undefined;
    case 'Skill':
      return input.skill as string | undefined;
    case 'WebSearch':
      return truncate(input.query as string | undefined);
    case 'WebFetch':
      return truncate(input.url as string | undefined, 80);
    case 'NotebookEdit':
      return input.file_path as string | undefined;
    default:
      return undefined;
  }
}
