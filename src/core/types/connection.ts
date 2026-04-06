import type { PermissionModeOption } from './settings';

export interface Connection {
  id: string;
  name: string;
  executable: string;
  configDir: string;
  permissionMode: PermissionModeOption;
}
