import { memo } from 'react';
import { useActiveConnection } from '../../state/selectors';
import { updateConnection } from '../../state/connection-actions';
import type { PermissionModeOption } from '../../types';
import './sections.css';

const PERMISSION_MODES: { value: PermissionModeOption; label: string; desc: string }[] = [
  { value: 'default',           label: 'Default',      desc: 'Prompt on first use' },
  { value: 'acceptEdits',       label: 'Accept Edits', desc: 'Auto-accept file edits' },
  { value: 'plan',              label: 'Plan',         desc: 'Read-only, no modifications' },
  { value: 'bypassPermissions', label: 'Bypass All',   desc: 'Skip all permission checks' },
];

export default memo(function PermissionsSection() {
  const conn = useActiveConnection();
  if (!conn) return null;

  const setMode = (value: PermissionModeOption) => {
    updateConnection({ ...conn, permissionMode: value });
  };

  return (
    <>
      <div className="settings-perm-list">
        {PERMISSION_MODES.map(pm => (
          <button key={pm.value} onClick={() => setMode(pm.value)}
            className={`settings-perm-btn${conn.permissionMode === pm.value ? ' is-active' : ''}`}>
            <div className="settings-perm-btn__label">{pm.label}</div>
            <div className="settings-perm-btn__desc">{pm.desc}</div>
          </button>
        ))}
      </div>
    </>
  );
});
