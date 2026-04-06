import { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import type { GlobalSettings } from '../types';

export function useSettings() {
  const [form, setForm] = useState<GlobalSettings>({
    zoomFactor: 1.25, activeConnectionId: '',
    transcriptionProvider: 'openai-whisper', transcriptionApiKey: '', transcriptionLanguage: '',
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { window.settings.load().then(s => setForm(s)); }, []);

  const update = (patch: Partial<GlobalSettings>) => {
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
