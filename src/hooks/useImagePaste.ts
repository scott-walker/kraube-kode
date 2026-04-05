import { useCallback } from 'react';
import { attachFiles } from '../state/actions';

export function useImagePaste() {
  return useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return;

    e.preventDefault();
    const blob = imageItem.getAsFile();
    if (!blob) return;

    const buffer = new Uint8Array(await blob.arrayBuffer());
    const filePath = await window.claude.saveTempImage(buffer, imageItem.type);
    attachFiles([filePath]);
  }, []);
}
