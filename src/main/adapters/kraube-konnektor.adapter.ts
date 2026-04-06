import { homedir } from 'node:os';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { BrowserWindow } from 'electron';
import { listSessions, getSessionMessages, type StreamEvent } from '@scottwalker/kraube-konnektor';
import type { IClaudePort, InitStageInfo } from '../../core/ports/claude.port';
import type { IMcpPort } from '../../core/ports/mcp.port';
import type { Connection } from '../../core/types/connection';
import type { McpServer, McpServerConfig, McpSetServersResult, McpScope } from '../../core/types/mcp';
import { SessionPool, buildKey, type PoolStatusEvent } from '../services/session-pool';

function expandHome(p: string): string {
  return p.startsWith('~') ? homedir() + p.slice(1) : p;
}

type Listener<T> = (arg: T) => void;

export class ClaudeConnectorAdapter implements IClaudePort, IMcpPort {
  private pool: SessionPool;
  private activeConnectionId = '';
  private currentCwd = '';
  private stageListeners: Listener<InitStageInfo>[] = [];
  private readyListeners: Listener<void>[] = [];
  private errorListeners: Listener<string>[] = [];
  private streamingKey: string | null = null;

  constructor(
    connection: Connection | null,
    private getConnection: (id: string) => Connection | null,
    private getWindow: () => BrowserWindow | null = () => null,
  ) {
    this.pool = new SessionPool(
      getConnection,
      (event) => this.handlePoolStatus(event),
      (key) => this.streamingKey === key,
      this.getWindow,
    );
    if (connection) {
      this.activeConnectionId = connection.id;
      this.applyConfigDir(connection.configDir);
    }
  }

  get pendingPermissions() { return this.pool.permissionRequests; }
  get pendingElicitations() { return this.pool.elicitationRequests; }

  get ready() { return this.pool.activeEntry()?.status === 'ready'; }
  get initError() { return this.pool.activeEntry()?.error ?? null; }
  get cwd() { return this.currentCwd || process.cwd(); }

  async init(): Promise<void> {
    if (!this.activeConnectionId) return;
    if (!this.currentCwd) this.currentCwd = process.cwd();
    this.pool.switchTo(this.activeConnectionId, this.currentCwd);
  }

  reinit(connection: Connection): 'instant' | 'initializing' {
    if (!this.currentCwd) this.currentCwd = process.cwd();
    console.log(`[adapter] reinit connection=${connection.name} id=${connection.id} cwd=${this.currentCwd}`);
    this.activeConnectionId = connection.id;
    this.applyConfigDir(connection.configDir);
    return this.pool.switchTo(connection.id, this.currentCwd);
  }

  newSession(cwd: string): 'instant' | 'initializing' {
    console.log(`[adapter] newSession cwd=${cwd}`);
    this.currentCwd = cwd;
    return this.pool.switchTo(this.activeConnectionId, cwd);
  }

  resumeSession(cwd: string): 'instant' | 'initializing' {
    this.currentCwd = cwd;
    const result = this.pool.switchTo(this.activeConnectionId, cwd);
    console.log(`[adapter] resumeSession cwd=${cwd} result=${result}`);
    return result;
  }

  stream(prompt: string, input?: string, options?: Record<string, string>): AsyncIterable<StreamEvent> {
    const claude = this.activeClaude();
    if (!this.ready) throw new Error('SDK not ready');
    this.streamingKey = buildKey(this.activeConnectionId, this.currentCwd);
    const queryOptions = input ? { ...options, input } : options;
    return claude.stream(prompt, queryOptions);
  }

  clearStreamingKey(): void {
    this.streamingKey = null;
  }

  abort(): void {
    try { this.activeClaude().abort(); } catch { /* no active instance */ }
  }

  close(): void {
    console.log('[adapter] closeAll');
    this.pool.closeAll();
  }

  // ── Sessions (standalone, no running instance needed) ──

  async listSessions(limit = 30) {
    try { return await listSessions({ limit }); }
    catch { return []; }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const claudeDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
      const projectsDir = join(claudeDir, 'projects');
      const dirs = await readdir(projectsDir, { withFileTypes: true });
      for (const dir of dirs) {
        if (!dir.isDirectory()) continue;
        const filePath = join(projectsDir, dir.name, `${sessionId}.jsonl`);
        try { await unlink(filePath); return true; } catch { /* not in this dir */ }
      }
      return false;
    } catch { return false; }
  }

  async getSessionMessages(sessionId: string) {
    try { return await getSessionMessages(sessionId); }
    catch { return []; }
  }

  // ── Listeners ──

  onInitStage(cb: Listener<InitStageInfo>): () => void {
    this.stageListeners.push(cb);
    return () => { this.stageListeners = this.stageListeners.filter(l => l !== cb); };
  }

  onInitReady(cb: Listener<void>): () => void {
    this.readyListeners.push(cb);
    return () => { this.readyListeners = this.readyListeners.filter(l => l !== cb); };
  }

  onInitError(cb: Listener<string>): () => void {
    this.errorListeners.push(cb);
    return () => { this.errorListeners = this.errorListeners.filter(l => l !== cb); };
  }

  // ── MCP (delegates to active instance) ──

  async supportedCommands() {
    if (!this.ready) return [];
    const commands = await this.activeClaude().supportedCommands();
    return commands.map(c => ({
      name: String(c.name ?? ''), description: String(c.description ?? ''),
      argumentHint: c.argumentHint ? String(c.argumentHint) : undefined,
    }));
  }

  async getServerStatus(): Promise<McpServer[]> {
    if (!this.ready) return [];
    const statuses = await this.activeClaude().mcpServerStatus();
    return statuses.map(s => ({
      name: s.name, status: s.status as McpServer['status'],
      scope: this.inferScope(s.scope), error: s.error, serverInfo: s.serverInfo,
      tools: s.tools ?? [], config: s.config as unknown as McpServerConfig | undefined,
    }));
  }

  async setServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult> {
    return this.activeClaude().setMcpServers(servers);
  }

  async toggleServer(name: string, enabled: boolean): Promise<void> {
    await this.activeClaude().toggleMcpServer(name, enabled);
  }

  async reconnectServer(name: string): Promise<void> {
    await this.activeClaude().reconnectMcpServer(name);
  }

  // ── Private ──

  private activeClaude(): import('@scottwalker/kraube-konnektor').Claude {
    const entry = this.pool.activeEntry();
    if (!entry) throw new Error('SDK not ready');
    return entry.instance as import('@scottwalker/kraube-konnektor').Claude;
  }

  private handlePoolStatus(event: PoolStatusEvent): void {
    const activeKey = buildKey(this.activeConnectionId, this.currentCwd);
    console.log(`[adapter] poolStatus event.key=${event.key} activeKey=${activeKey} status=${event.status}`);
    if (event.key !== activeKey) {
      console.log(`[adapter] IGNORED (key mismatch)`);
      return;
    }

    if (event.status === 'ready') {
      console.log(`[adapter] firing readyListeners (${this.readyListeners.length})`);
      this.readyListeners.forEach(cb => cb());
    } else if (event.status === 'error') {
      this.errorListeners.forEach(cb => cb(event.message ?? 'Unknown error'));
    } else {
      this.stageListeners.forEach(cb => cb({ stage: 'initializing', message: event.message ?? '' }));
    }
  }

  private inferScope(scope?: string): McpScope {
    if (scope === 'project') return 'project';
    if (scope?.includes('marketplace')) return 'marketplace';
    return 'global';
  }

  private applyConfigDir(configDir: string): void {
    if (configDir) process.env.CLAUDE_CONFIG_DIR = expandHome(configDir);
  }
}
