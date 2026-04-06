import { memo } from 'react';
import type { GlobalSettings } from '../../types';
import SegmentedControl from '../shared/SegmentedControl';
import './sections.css';

interface Props {
  form: GlobalSettings;
  update: (patch: Partial<GlobalSettings>) => void;
}

const LANGUAGE_SEGMENTS = [
  { value: '',   label: 'Auto' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export default memo(function VoiceInputSection({ form, update }: Props) {
  return (
    <>
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
    </>
  );
});
