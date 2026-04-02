import { useEffect } from 'react';
import { initIpcBridge } from '../state/middleware/ipc-bridge';
import { initPersistence } from '../state/middleware/persistence';

export function useInit() {
  useEffect(() => {
    const cleanupBridge = initIpcBridge();
    const cleanupPersist = initPersistence();
    return () => { cleanupBridge(); cleanupPersist(); };
  }, []);
}
