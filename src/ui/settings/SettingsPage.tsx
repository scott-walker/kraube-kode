import { memo } from 'react';
import { useSettingsSection } from '../../state/selectors';
import { useSettings } from '../../hooks/useSettings';
import ConnectionsSection from './ConnectionsSection';
import PermissionsSection from './PermissionsSection';
import VoiceInputSection from './VoiceInputSection';
import AppearanceSection from './AppearanceSection';
import './SettingsPage.css';
import './sections.css';

export default memo(function SettingsPage() {
  const section = useSettingsSection();
  const { form, saving, dirty, update, save } = useSettings();

  return (
    <div className="settings-page">
      <div className="settings-page__content">
        {section === 'connections' && <ConnectionsSection />}
        {section === 'permissions' && <PermissionsSection />}
        {section === 'voice'       && <VoiceInputSection form={form} update={update} />}
        {section === 'appearance'  && <AppearanceSection />}

        {dirty && section !== 'connections' && (
          <button onClick={save} disabled={saving} className="settings-save-btn">
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
});
