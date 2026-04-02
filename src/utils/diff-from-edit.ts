import type { DiffBlockData } from '../core/types/message';

export function diffFromEdit(input: Record<string, unknown>): DiffBlockData | null {
  const filePath = input.file_path as string | undefined;
  const oldStr = input.old_string as string | undefined;
  const newStr = input.new_string as string | undefined;
  if (!filePath || oldStr == null || newStr == null) return null;

  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const lines = [
    ...oldLines.map(l => `-${l}`),
    ...newLines.map(l => `+${l}`),
  ].join('\n');

  return {
    type: 'diff',
    filename: filePath,
    additions: newLines.length,
    deletions: oldLines.length,
    lines,
  };
}
