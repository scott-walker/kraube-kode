import { homedir } from 'node:os';
import { Claude } from '@scottwalker/kraube-konnektor';
import type { Connection } from '../../core/types/connection';
import type { PoolStatus, SwitchResult, ISessionPool } from '../../core/ports/session-pool.port';

function expandHome(p: string): string {
  return p.startsWith('~') ? homedir() + p.slice(1) : p;
}

export interface PoolStatusEvent {
  key: string;
  status: PoolStatus;
  message?: string;
}

interface InternalEntry {
  claude: Claude;
  status: PoolStatus;
  error: string | null;
  cwd: string;
  connectionId: string;
  lastAccessed: number;
}

type StatusCallback = (event: PoolStatusEvent) => void;

export class SessionPool implements ISessionPool {
  private pool = new Map<string, InternalEntry>();
  private activeKey = '';

  constructor(
    private getConnection: (id: string) => Connection | null,
    private onStatusChange: StatusCallback,
    private isKeyStreaming: (key: string) => boolean,
    private maxSize = 5,
  ) {}

  switchTo(connectionId: string, cwd: string): SwitchResult {
    const key = buildKey(connectionId, cwd);
    this.activeKey = key;

    const existing = this.pool.get(key);
    if (existing) {
      existing.lastAccessed = Date.now();
      if (existing.status === 'ready') return 'instant';
      if (existing.status === 'initializing') return 'initializing';
      // status === 'error' → evict and re-spawn below
      this.evict(key);
    }

    this.trimPool();
    this.spawn(connectionId, cwd);
    return 'initializing';
  }

  activeEntry() {
    const entry = this.pool.get(this.activeKey);
    if (!entry) return null;
    return {
      status: entry.status,
      error: entry.error,
      cwd: entry.cwd,
      connectionId: entry.connectionId,
      instance: entry.claude,
    };
  }

  closeAll(): void {
    for (const [, entry] of this.pool) {
      try { entry.claude.close(); } catch { /* best effort */ }
    }
    this.pool.clear();
    this.activeKey = '';
  }

  // ── Private ──

  private spawn(connectionId: string, cwd: string): void {
    const conn = this.getConnection(connectionId);
    if (!conn) {
      console.error(`[pool] spawn failed: connection not found id=${connectionId}`);
      const key = buildKey(connectionId, cwd);
      this.onStatusChange({ key, status: 'error', message: `Connection "${connectionId}" not found` });
      return;
    }

    const key = buildKey(connectionId, cwd);
    const claude = this.createInstance(conn, cwd);
    const entry: InternalEntry = {
      claude,
      status: 'initializing',
      error: null,
      cwd,
      connectionId,
      lastAccessed: Date.now(),
    };

    this.pool.set(key, entry);
    this.wireEvents(claude, key, entry);

    console.log(`[pool] spawn key=${key}`);
    claude.init().catch((err) => {
      console.error(`[pool] init threw key=${key}:`, err?.message ?? err);
    });
  }

  private evict(key: string): void {
    const entry = this.pool.get(key);
    if (!entry) return;
    console.log(`[pool] evict key=${key}`);
    try { entry.claude.close(); } catch { /* best effort */ }
    this.pool.delete(key);
  }

  private trimPool(): void {
    while (this.pool.size >= this.maxSize) {
      const victim = this.findEvictionCandidate();
      if (!victim) break;
      this.evict(victim);
    }
  }

  private findEvictionCandidate(): string | null {
    let oldest: { key: string; time: number } | null = null;

    for (const [key, entry] of this.pool) {
      if (key === this.activeKey) continue;
      if (this.isKeyStreaming(key)) continue;
      if (entry.status === 'initializing') continue;
      if (!oldest || entry.lastAccessed < oldest.time) {
        oldest = { key, time: entry.lastAccessed };
      }
    }

    return oldest?.key ?? null;
  }

  private createInstance(conn: Connection, cwd: string): Claude {
    const env: Record<string, string> = {};
    if (conn.configDir) env.CLAUDE_CONFIG_DIR = expandHome(conn.configDir);

    return new Claude({
      executable: conn.executable || undefined,
      permissionMode: conn.permissionMode === 'bypassPermissions' ? 'bypassPermissions' : conn.permissionMode,
      allowDangerouslySkipPermissions: conn.permissionMode === 'bypassPermissions',
      env: Object.keys(env).length > 0 ? env : undefined,
      cwd: cwd || undefined,
      stderr: (data) => console.error('[claude stderr]', data),
    });
  }

  private wireEvents(claude: Claude, key: string, entry: InternalEntry): void {
    claude.on('init:stage', (stage, message) => {
      this.onStatusChange({ key, status: 'initializing', message });
    });

    claude.on('init:ready', () => {
      console.log(`[pool] ready key=${key}`);
      entry.status = 'ready';
      entry.error = null;
      this.onStatusChange({ key, status: 'ready' });
    });

    claude.on('init:error', (error) => {
      console.error(`[pool] error key=${key}: ${error.message}`);
      entry.status = 'error';
      entry.error = error.message;
      this.onStatusChange({ key, status: 'error', message: error.message });
    });
  }
}

function buildKey(connectionId: string, cwd: string): string {
  return `${connectionId}:${cwd}`;
}

export { buildKey };
