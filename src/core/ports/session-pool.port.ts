export type PoolStatus = 'initializing' | 'ready' | 'error';
export type SwitchResult = 'instant' | 'initializing';

export interface PoolEntryInfo {
  status: PoolStatus;
  error: string | null;
  cwd: string;
  connectionId: string;
}

export interface ISessionPool {
  switchTo(connectionId: string, cwd: string): SwitchResult;
  activeEntry(): (PoolEntryInfo & { instance: unknown }) | null;
  closeAll(): void;
}
