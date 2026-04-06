import { useState, useCallback } from 'react';
import type { Connection, PermissionModeOption } from '../types';

export interface ConnectionFormData {
  name: string;
  executable: string;
  configDir: string;
  permissionMode: PermissionModeOption;
}

const EMPTY_FORM: ConnectionFormData = {
  name: '',
  executable: 'claude',
  configDir: '',
  permissionMode: 'default',
};

export function useConnectionForm(initial?: Connection) {
  const [form, setForm] = useState<ConnectionFormData>(
    initial ? { name: initial.name, executable: initial.executable, configDir: initial.configDir, permissionMode: initial.permissionMode } : EMPTY_FORM,
  );

  const update = useCallback((patch: Partial<ConnectionFormData>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback((conn?: Connection) => {
    setForm(conn ? { name: conn.name, executable: conn.executable, configDir: conn.configDir, permissionMode: conn.permissionMode } : EMPTY_FORM);
  }, []);

  const isValid = form.name.trim().length > 0;

  return { form, update, reset, isValid };
}
