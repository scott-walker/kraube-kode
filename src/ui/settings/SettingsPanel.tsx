import { memo } from 'react';
import { Icons } from '../../icons';
import { useTheme } from '../../state/selectors';
import { toggleTheme, setSettingsOpen } from '../../state/actions';
import { useSettings } from '../../hooks/useSettings';
import Collapsible from '../shared/Collapsible';
import Dropdown from '../shared/Dropdown';
import type { DropdownOption } from '../shared/Dropdown';
import SegmentedControl from '../shared/SegmentedControl';
import type { PermissionModeOption } from '../../types';

const PERMISSION_MODES: { value: PermissionModeOption; label: string; desc: string }[] = [
  { value: 'default',           label: 'Default',      desc: 'Prompt on first use' },
  { value: 'acceptEdits',       label: 'Accept Edits', desc: 'Auto-accept file edits' },
  { value: 'plan',              label: 'Plan',         desc: 'Read-only, no modifications' },
  { value: 'bypassPermissions', label: 'Bypass All',   desc: 'Skip all permission checks' },
];

const MODEL_SEGMENTS = [
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'opus',   label: 'Opus' },
  { value: 'haiku',  label: 'Haiku' },
];

const LANGUAGES: DropdownOption[] = [
  { value: '',   label: 'Auto-detect', hint: 'auto' },
  { value: 'en', label: 'English',     hint: 'en' },
  { value: 'ru', label: 'Русский',     hint: 'ru' },
];

const LANGUAGE_SEGMENTS = [
  { value: '',   label: 'Auto' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export default memo(function SettingsPanel() {
  const isDark = useTheme() === 'dark';
  const { form, saving, dirty, update, save } = useSettings();

  return (
    <>
      <div className="settings-panel__header">
        <span className="settings-panel__title">Settings</span>
        <button className="settings-panel__close-btn" onClick={() => setSettingsOpen(false)}>
          <Icons.X size={20} />
        </button>
      </div>

      <Collapsible title="Connection" icon={<Icons.Plug size={12} />} defaultOpen>
        <div className="settings-form__group">
          <div>
            <label className="settings-form__label">Claude CLI path</label>
            <input value={form.executable} onChange={e => update({ executable: e.target.value })}
              placeholder="claude" className="settings-form__input" />
            <span className="settings-form__hint">
              Leave "claude" to use PATH, or set full path like /home/user/.local/bin/claude
            </span>
          </div>
          <div>
            <label className="settings-form__label">Config directory</label>
            <input value={form.configDir} onChange={e => update({ configDir: e.target.value })}
              placeholder="~/.claude (default)" className="settings-form__input" />
            <span className="settings-form__hint">CLAUDE_CONFIG_DIR — leave empty for default</span>
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Model" icon={<Icons.Brain size={12} />} defaultOpen>
        <SegmentedControl
          options={MODEL_SEGMENTS}
          value={form.model}
          onChange={v => update({ model: v })}
        />
      </Collapsible>

      <Collapsible title="Permissions" icon={<Icons.AlertCircle size={12} />}>
        <div className="settings-perm-list">
          {PERMISSION_MODES.map(pm => (
            <button key={pm.value} onClick={() => update({ permissionMode: pm.value })}
              className={`settings-perm-btn${form.permissionMode === pm.value ? ' is-active' : ''}`}>
              <div className="settings-perm-btn__label">{pm.label}</div>
              <div className="settings-perm-btn__desc">{pm.desc}</div>
            </button>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Voice Input" icon={<Icons.MicSettings size={12} />}>
        <div className="settings-form__group">
          <div>
            <label className="settings-form__label">OpenAI API Key</label>
            <input
              type="password"
              value={form.transcriptionApiKey}
              onChange={e => update({ transcriptionApiKey: e.target.value })}
              placeholder="sk-..."
              className="settings-form__input"
            />
            <span className="settings-form__hint">Required for Whisper speech-to-text</span>
          </div>
          <div>
            <label className="settings-form__label">Language</label>
            <SegmentedControl
              options={LANGUAGE_SEGMENTS}
              value={form.transcriptionLanguage}
              onChange={v => update({ transcriptionLanguage: v })}
            />
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Appearance" icon={<Icons.Eye size={12} />}>
        <div className="settings-theme-grid">
          {[
            { icon: <Icons.Moon size={18} />, label: 'Dark',  active: isDark },
            { icon: <Icons.Sun size={18} />,  label: 'Light', active: !isDark },
          ].map(opt => (
            <button key={opt.label} onClick={toggleTheme}
              className={`settings-theme-btn${opt.active ? ' is-active' : ''}`}>
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
      </Collapsible>

      {dirty && (
        <button onClick={save} disabled={saving} className="settings-save-btn">
          {saving ? 'Reconnecting…' : 'Save & Reconnect'}
        </button>
      )}
    </>
  );
});
