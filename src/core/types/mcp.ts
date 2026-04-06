export type McpStatus = 'connected' | 'failed' | 'error' | 'needs-auth' | 'pending' | 'disabled';
export type McpScope = 'project' | 'global' | 'marketplace';
export type McpTransportType = 'stdio' | 'http' | 'sse';

export interface McpToolAnnotations {
  readOnly?: boolean;
  destructive?: boolean;
  openWorld?: boolean;
}

export interface McpTool {
  name: string;
  description?: string;
  annotations?: McpToolAnnotations;
}

export interface McpServerInfo {
  name: string;
  version: string;
}

export interface McpServer {
  name: string;
  status: McpStatus;
  scope: McpScope;
  error?: string;
  serverInfo?: McpServerInfo;
  tools: McpTool[];
  config?: McpServerConfig;
}

export interface McpStdioConfig {
  type?: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpHttpConfig {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}

export interface McpSseConfig {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
}

export type McpServerConfig = McpStdioConfig | McpHttpConfig | McpSseConfig;

export interface McpSetServersResult {
  added: string[];
  removed: string[];
  errors: Record<string, string>;
}
