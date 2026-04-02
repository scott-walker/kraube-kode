import { memo } from 'react';
import { setSettingsOpen } from '../../state/actions';
import SettingsPanel from './SettingsPanel';
import './SettingsPanel.css';

export default memo(function SettingsOverlay() {
  return (
    <div className="settings-overlay">
      <div className="settings-overlay__backdrop" onClick={() => setSettingsOpen(false)} />
      <div className="settings-panel">
        <SettingsPanel />
      </div>
    </div>
  );
});
