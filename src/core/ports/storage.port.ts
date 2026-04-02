export interface IStoragePort {
  open(): void;
  close(): void;
  getSetting<T>(key: string, fallback: T): T;
  setSetting<T>(key: string, value: T): void;
  getAllSettings(): Record<string, unknown>;
  runMigrations(): void;
}
