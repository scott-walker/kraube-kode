import { useRef } from 'react';
import { useDragOver } from '../state/selectors';
import { setDragOver, attachFiles } from '../state/actions';

export function useDragDrop() {
  const dragOver = useDragOver();
  const counterRef = useRef(0);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current++;
    if (counterRef.current === 1) setDragOver(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current--;
    if (counterRef.current === 0) setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current = 0;
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      attachFiles(files.map(f => window.claude.getPathForFile(f)));
    }
  };

  return { dragOver, onDragEnter, onDragOver, onDragLeave, onDrop };
}
