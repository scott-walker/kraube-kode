import type { Connection } from '../types/connection';

export interface IStoragePort {
  open(): void;
  close(): void;
  getSetting<T>(key: string, fallback: T): T;
  setSetting<T>(key: string, value: T): void;
  getAllSettings(): Record<string, unknown>;
  runMigrations(): void;
  // Session prefs
  getSessionPrefs(sessionId: string): Record<string, string>;
  setSessionPref(sessionId: string, key: string, value: string): void;
  deleteSessionPrefs(sessionId: string): void;
  // Connections
  getConnections(): Connection[];
  getConnection(id: string): Connection | null;
  createConnection(conn: Connection): void;
  updateConnection(conn: Connection): void;
  deleteConnection(id: string): void;
}
