import { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import type { AppSettings } from '../types';

export function useSettings() {
  const [form, setForm] = useState<AppSettings>({
    executable: 'claude', configDir: '', permissionMode: 'default', zoomFactor: 1.25,
    transcriptionProvider: 'openai-whisper', transcriptionApiKey: '', transcriptionLanguage: '',
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { window.settings.load().then(s => setForm(s)); }, []);

  const update = (patch: Partial<AppSettings>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await window.settings.save(form);
    useStore.setState({ transcriptionConfigured: !!form.transcriptionApiKey });
    setSaving(false);
    setDirty(false);
  };

  return { form, saving, dirty, update, save };
}
