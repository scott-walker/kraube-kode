export interface SessionInfo {
  sessionId: string;
  summary: string;
  lastModified: number;
}

/** UI-facing session for sidebar/topbar display */
export interface Session {
  id: string;
  name: string;
  time: string;
  active: boolean;
}
