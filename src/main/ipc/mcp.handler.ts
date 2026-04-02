import { ipcMain } from 'electron';
import type { IMcpPort } from '../../core/ports/mcp.port';
import type { McpServerConfig } from '../../core/types/mcp';

export function registerMcpHandlers(mcpPort: IMcpPort): void {
  ipcMain.handle('mcp:server-status', async () => {
    try {
      const servers = await mcpPort.getServerStatus();
      console.log('[mcp.handler] getServerStatus returned', servers.length, 'servers');
      return servers;
    } catch (err) {
      console.error('[mcp.handler] getServerStatus error:', err);
      throw err;
    }
  });

  ipcMain.handle('mcp:set-servers', (_event, servers: Record<string, McpServerConfig>) =>
    mcpPort.setServers(servers),
  );

  ipcMain.handle('mcp:toggle-server', (_event, name: string, enabled: boolean) =>
    mcpPort.toggleServer(name, enabled),
  );

  ipcMain.handle('mcp:reconnect-server', (_event, name: string) =>
    mcpPort.reconnectServer(name),
  );
}
