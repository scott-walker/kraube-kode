import type { McpServer, McpServerConfig, McpSetServersResult } from '../types/mcp';

export interface IMcpPort {
  getServerStatus(): Promise<McpServer[]>;
  setServers(servers: Record<string, McpServerConfig>): Promise<McpSetServersResult>;
  toggleServer(name: string, enabled: boolean): Promise<void>;
  reconnectServer(name: string): Promise<void>;
}
