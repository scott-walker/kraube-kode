import { useStore } from '../store';
import type { Theme } from '../../theme';

export function initPersistence(): () => void {
  // Restore persisted theme
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    useStore.setState({ theme: saved as Theme });
  }

  // Persist theme on change
  const unsubscribe = useStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme) {
      localStorage.setItem('theme', state.theme);
    }
  });

  return unsubscribe;
}
