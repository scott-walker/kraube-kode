import { homedir } from 'node:os';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import {
  Claude,
  listSessions,
  getSessionMessages,
  type StreamEvent,
} from '@scottwalker/kraube-konnektor';
import type { IClaudePort, InitStageInfo } from '../../core/ports/claude.port';
import type { IMcpPort } from '../../core/ports/mcp.port';
import type { AppSettings } from '../../core/types/settings';
import type { McpServer, McpServerConfig, McpSetServersResult, McpScope } from '../../core/types/mcp';

function expandHome(p: string): string {
  return p.startsWith('~') ? homedir() + p.slice(1) : p;
}

type Listener<T> = (arg: T) => void;

export class ClaudeConnectorAdapter implements IClaudePort, IMcpPort {
  private claude: Claude | null = null;
  private _ready = false;
  private _initError: string | null = null;
  private stageListeners: Listener<InitStageInfo>[] = [];
  private readyListeners: Listener<void>[] = [];
  private errorListeners: Listener<string>[] = [];
  private currentCwd: string = '';

  constructor(private settings: AppSettings) {
    this.applyConfigDir(settings.configDir);
  }

  get ready() { return this._ready; }
  get initError() { return this._initError; }

  async init(): Promise<void> {
    this.claude = this.createInstance(this.settings);
    this.wireEvents(this.claude);
    await this.claude.init().catch(() => {});
  }

  reinit(settings: AppSettings): void {
    this.applyConfigDir(settings.configDir);
    this.close();
    this.settings = settings;
    this._ready = false;
    this._initError = null;
    this.init().catch(() => {});
  }

  newSession(cwd: string): void {
    this.currentCwd = cwd;
    this.close();
    this._ready = false;
    this._initError = null;
    this.init().catch(() => {});
  }

  stream(prompt: string): AsyncIterable<StreamEvent> {
    if (!this.claude || !this._ready) {
      throw new Error('SDK not ready');
    }
    return this.claude.stream(prompt);
  }

  abort(): void { this.claude?.abort(); }

  close(): void {
    this.claude?.close();
    this.claude = null;
    this._ready = false;
  }

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
        try {
          await unlink(filePath);
          return true;
        } catch { /* file not in this dir */ }
      }
      return false;
    } catch { return false; }
  }

  async getSessionMessages(sessionId: string) {
    try { return await getSessionMessages(sessionId); }
    catch { return []; }
  }

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

  async supportedCommands(): Promise<Array<{ name: string; description: string; argumentHint?: string }>> {
    if (!this.claude) return [];
    const commands = await this.claude.supportedCommands();
    return commands.map(c => ({
      name: String(c.name ?? ''),
      description: String(c.description ?? ''),
      argumentHint: c.argumentHint ? String(c.argumentHint) : undefined,
    }));
  }

  async getServerStatus(): Promise<McpServer[]> {
    if (!this.claude) return [];
    const statuses = await this.claude.mcpServerStatus();
    return statuses.map(s => ({
      name: s.name,
      status: s.status as McpServer['status'],
      scope: this.inferScope(s.scope),
      error: s.error,
      serverInfo: s.serverInfo,
      tools: s.tools ?? [],
      config: s.config as unknown as McpServerConfig | undefined,
    }));
  }

  async setServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult> {
    if (!this.claude) throw new Error('SDK not ready');
    return this.claude.setMcpServers(servers);
  }

  async toggleServer(name: string, enabled: boolean): Promise<void> {
    if (!this.claude) throw new Error('SDK not ready');
    await this.claude.toggleMcpServer(name, enabled);
  }

  async reconnectServer(name: string): Promise<void> {
    if (!this.claude) throw new Error('SDK not ready');
    await this.claude.reconnectMcpServer(name);
  }

  private inferScope(scope?: string): McpScope {
    if (scope === 'project') return 'project';
    if (scope?.includes('marketplace')) return 'marketplace';
    return 'global';
  }

  private applyConfigDir(configDir: string): void {
    if (configDir) {
      process.env.CLAUDE_CONFIG_DIR = expandHome(configDir);
    }
  }

  private createInstance(s: AppSettings): Claude {
    const env: Record<string, string> = {};
    if (s.configDir) env.CLAUDE_CONFIG_DIR = expandHome(s.configDir);

    return new Claude({
      executable: s.executable || undefined,
      model: s.model || undefined,
      permissionMode: s.permissionMode === 'bypassPermissions' ? 'bypassPermissions' : s.permissionMode,
      allowDangerouslySkipPermissions: s.permissionMode === 'bypassPermissions',
      env: Object.keys(env).length > 0 ? env : undefined,
      cwd: this.currentCwd || undefined,
      stderr: (data) => console.error('[claude stderr]', data),
    });
  }

  private wireEvents(claude: Claude): void {
    claude.on('init:stage', (stage, message) => {
      const info = { stage, message };
      this.stageListeners.forEach(cb => cb(info));
    });

    claude.on('init:ready', () => {
      this._ready = true;
      this._initError = null;
      this.readyListeners.forEach(cb => cb());
    });

    claude.on('init:error', (error) => {
      this._initError = error.message;
      this.errorListeners.forEach(cb => cb(error.message));
    });
  }
}
