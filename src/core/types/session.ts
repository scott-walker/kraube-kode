export interface SessionInfo {
  sessionId: string;
  summary: string;
  lastModified: number;
  cwd?: string;
  firstPrompt?: string;
  gitBranch?: string;
}

/** UI-facing session for sidebar/topbar display */
export interface Session {
  id: string;
  name: string;
  project: string;
  time: string;
  active: boolean;
}
