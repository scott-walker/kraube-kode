export interface PermissionRequestPayload {
  requestId: string;
  toolName: string;
  input: Record<string, unknown>;
  toolUseID: string;
}

export interface PermissionResponse {
  behavior: 'allow' | 'deny';
  message?: string;
}

export interface ElicitationRequestPayload {
  requestId: string;
  serverName: string;
  message: string;
  mode?: 'form' | 'url';
  url?: string;
  elicitationId?: string;
  requestedSchema?: Record<string, unknown>;
}

export interface ElicitationResponse {
  action: 'accept' | 'decline' | 'cancel';
  content?: Record<string, unknown>;
}
