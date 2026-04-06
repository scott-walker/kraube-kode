import { memo, useState, useEffect } from 'react';
import { useConnectionForm } from '../../hooks/useConnectionForm';
import { createAndActivateConnection } from '../../state/connection-actions';
import { pushOverlay, popOverlay } from '../../state/actions';
import { Icons } from '../../icons';
import './ConnectionSetupModal.css';
import '../settings/sections.css';

export default memo(function ConnectionSetupModal() {
  const { form, update, isValid } = useConnectionForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    pushOverlay();
    return () => popOverlay();
  }, []);

  const pickDir = async () => {
    const dir = await window.connection.pickDirectory();
    if (dir) update({ configDir: dir });
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await createAndActivateConnection(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="conn-setup-overlay">
      <div className="conn-setup">
        <h2 className="conn-setup__title">Create Connection</h2>
        <p className="conn-setup__subtitle">
          Set up a Claude Code connection to get started.
        </p>

        <div className="conn-setup__fields">
          <div>
            <label className="settings-form__label">Connection name</label>
            <input
              value={form.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g. Personal, Work"
              className="settings-form__input"
              autoFocus
            />
          </div>
          <div>
            <label className="settings-form__label">Claude CLI path</label>
            <input
              value={form.executable}
              onChange={e => update({ executable: e.target.value })}
              placeholder="claude"
              className="settings-form__input"
            />
            <span className="settings-form__hint">
              Leave "claude" to use PATH, or set full path
            </span>
          </div>
          <div>
            <label className="settings-form__label">Config directory</label>
            <div className="settings-form__input-with-action">
              <input
                value={form.configDir}
                onChange={e => update({ configDir: e.target.value })}
                placeholder="~/.claude (default)"
                className="settings-form__input"
              />
              <button className="settings-form__input-action" onClick={pickDir} type="button">
                <Icons.Folder size={14} />
              </button>
            </div>
            <span className="settings-form__hint">
              CLAUDE_CONFIG_DIR — leave empty for default
            </span>
          </div>
        </div>

        <button
          className="conn-setup__submit"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Connecting…' : 'Create & Connect'}
        </button>
      </div>
    </div>
  );
});
