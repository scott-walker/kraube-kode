import { useStore } from './store';
import type { McpServerConfig } from '../core/types/mcp';

export async function refreshMcpServers(): Promise<void> {
  useStore.setState({ mcpLoading: true });
  try {
    const servers = await window.mcp.getServerStatus();
    useStore.setState({ mcpServers: servers, mcpLoading: false });
  } catch {
    useStore.setState({ mcpLoading: false });
  }
}

export async function toggleMcpServer(name: string, enabled: boolean): Promise<void> {
  await window.mcp.toggleServer(name, enabled);
  await refreshMcpServers();
}

export async function reconnectMcpServer(name: string): Promise<void> {
  await window.mcp.reconnectServer(name);
  await refreshMcpServers();
}

export async function addMcpServer(
  name: string,
  config: McpServerConfig,
): Promise<{ success: boolean; error?: string }> {
  const result = await window.mcp.setServers({ [name]: config });
  await refreshMcpServers();
  if (result.errors[name]) return { success: false, error: result.errors[name] };
  return { success: true };
}

export async function removeMcpServer(name: string): Promise<void> {
  const current = useStore.getState().mcpServers;
  const remaining: Record<string, McpServerConfig> = {};
  for (const s of current) {
    if (s.name !== name && s.config) {
      remaining[s.name] = s.config;
    }
  }
  await window.mcp.setServers(remaining);
  await refreshMcpServers();
  if (useStore.getState().mcpSelectedServer === name) {
    useStore.setState({ mcpSelectedServer: null });
  }
}

export function selectMcpServer(name: string | null): void {
  useStore.setState({ mcpSelectedServer: name });
}
