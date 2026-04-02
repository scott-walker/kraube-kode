import { useDragOver } from '../state/selectors';
import { setDragOver, attachFiles } from '../state/actions';

export function useDragDrop() {
  const dragOver = useDragOver();

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    attachFiles(Array.from(e.dataTransfer.files).map(f => f.name));
  };

  return { dragOver, onDragOver, onDragLeave, onDrop };
}
