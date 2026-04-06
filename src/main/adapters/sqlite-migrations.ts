import type Database from 'better-sqlite3';
import crypto from 'node:crypto';

type Migration = (db: Database.Database) => void;

export const MIGRATIONS: Migration[] = [
  // v1: settings + migration tracking
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS _migrations (
        version  INTEGER PRIMARY KEY,
        applied  TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  },
  // v2: per-session preferences (model, permission, effort)
  (db) => {
    db.exec(`
      CREATE TABLE session_prefs (
        session_id TEXT NOT NULL,
        key        TEXT NOT NULL,
        value      TEXT NOT NULL,
        PRIMARY KEY (session_id, key)
      );
    `);
  },
  // v3: multi-connection support
  (db) => {
    db.exec(`
      CREATE TABLE connections (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        executable      TEXT NOT NULL DEFAULT 'claude',
        config_dir      TEXT NOT NULL DEFAULT '',
        permission_mode TEXT NOT NULL DEFAULT 'default',
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        sort_order      INTEGER NOT NULL DEFAULT 0
      );
    `);

    const getVal = (key: string, fallback: string): string => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
      if (!row) return fallback;
      try { return JSON.parse(row.value) as string; } catch { return fallback; }
    };

    const executable = getVal('executable', 'claude');
    const configDir = getVal('configDir', '');
    const permissionMode = getVal('permissionMode', 'default');

    const hasCustom = executable !== 'claude' || configDir !== '' || permissionMode !== 'default';
    if (hasCustom) {
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO connections (id, name, executable, config_dir, permission_mode, sort_order)
         VALUES (?, ?, ?, ?, ?, 0)`,
      ).run(id, 'Default', executable, configDir, permissionMode);
      db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('activeConnectionId', ?)`)
        .run(JSON.stringify(id));
    }
  },
];
