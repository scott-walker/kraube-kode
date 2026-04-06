import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { IStoragePort } from '../../core/ports/storage.port';
import type { Connection } from '../../core/types/connection';
import { MIGRATIONS } from './sqlite-migrations';

interface ConnectionRow {
  id: string;
  name: string;
  executable: string;
  config_dir: string;
  permission_mode: string;
}

function toConnection(row: ConnectionRow): Connection {
  return {
    id: row.id,
    name: row.name,
    executable: row.executable,
    configDir: row.config_dir,
    permissionMode: row.permission_mode as Connection['permissionMode'],
  };
}

export class SqliteAdapter implements IStoragePort {
  private db: Database.Database | null = null;
  private readonly dbPath: string;

  constructor(userDataPath: string) {
    this.dbPath = path.join(userDataPath, 'kraube-kode.db');
  }

  open(): void {
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.runMigrations();
    this.migrateJsonSettings();
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  getSetting<T>(key: string, fallback: T): T {
    const row = this.requireDb()
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(key) as { value: string } | undefined;
    if (!row) return fallback;
    try { return JSON.parse(row.value) as T; }
    catch { return fallback; }
  }

  setSetting<T>(key: string, value: T): void {
    this.requireDb()
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(key, JSON.stringify(value));
  }

  getAllSettings(): Record<string, unknown> {
    const rows = this.requireDb()
      .prepare('SELECT key, value FROM settings')
      .all() as Array<{ key: string; value: string }>;
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      try { result[row.key] = JSON.parse(row.value); }
      catch { result[row.key] = row.value; }
    }
    return result;
  }

  getSessionPrefs(sessionId: string): Record<string, string> {
    const rows = this.requireDb()
      .prepare('SELECT key, value FROM session_prefs WHERE session_id = ?')
      .all(sessionId) as Array<{ key: string; value: string }>;
    const result: Record<string, string> = {};
    for (const row of rows) result[row.key] = row.value;
    return result;
  }

  setSessionPref(sessionId: string, key: string, value: string): void {
    this.requireDb()
      .prepare('INSERT OR REPLACE INTO session_prefs (session_id, key, value) VALUES (?, ?, ?)')
      .run(sessionId, key, value);
  }

  deleteSessionPrefs(sessionId: string): void {
    this.requireDb()
      .prepare('DELETE FROM session_prefs WHERE session_id = ?')
      .run(sessionId);
  }

  getConnections(): Connection[] {
    const rows = this.requireDb()
      .prepare('SELECT id, name, executable, config_dir, permission_mode FROM connections ORDER BY sort_order, created_at')
      .all() as ConnectionRow[];
    return rows.map(toConnection);
  }

  getConnection(id: string): Connection | null {
    const row = this.requireDb()
      .prepare('SELECT id, name, executable, config_dir, permission_mode FROM connections WHERE id = ?')
      .get(id) as ConnectionRow | undefined;
    return row ? toConnection(row) : null;
  }

  createConnection(conn: Connection): void {
    this.requireDb()
      .prepare('INSERT INTO connections (id, name, executable, config_dir, permission_mode) VALUES (?, ?, ?, ?, ?)')
      .run(conn.id, conn.name, conn.executable, conn.configDir, conn.permissionMode);
  }

  updateConnection(conn: Connection): void {
    this.requireDb()
      .prepare('UPDATE connections SET name = ?, executable = ?, config_dir = ?, permission_mode = ? WHERE id = ?')
      .run(conn.name, conn.executable, conn.configDir, conn.permissionMode, conn.id);
  }

  deleteConnection(id: string): void {
    this.requireDb().prepare('DELETE FROM connections WHERE id = ?').run(id);
  }

  runMigrations(): void {
    const db = this.requireDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        applied TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const current = (db.prepare('SELECT MAX(version) as v FROM _migrations').get() as { v: number | null })?.v ?? 0;

    for (let i = current; i < MIGRATIONS.length; i++) {
      db.transaction(() => {
        MIGRATIONS[i](db);
        db.prepare('INSERT INTO _migrations (version) VALUES (?)').run(i + 1);
      })();
    }
  }

  private migrateJsonSettings(): void {
    const jsonPath = path.join(path.dirname(this.dbPath), 'settings.json');
    if (!fs.existsSync(jsonPath)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const db = this.requireDb();
      db.transaction(() => {
        for (const [key, value] of Object.entries(raw)) {
          db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
            .run(key, JSON.stringify(value));
        }
      })();
      fs.renameSync(jsonPath, jsonPath + '.bak');
    } catch { /* Non-critical */ }
  }

  private requireDb(): Database.Database {
    if (!this.db) throw new Error('Database not open');
    return this.db;
  }
}
