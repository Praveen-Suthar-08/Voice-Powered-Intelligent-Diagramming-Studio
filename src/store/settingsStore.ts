import { create } from 'zustand';

interface SettingsState {
  apiKey: string;
  model: 'flash' | 'pro';
  language: string;
  theme: 'dark' | 'light';
  ttsEnabled: boolean;
  accessibilityMode: boolean;
  noiseSuppression: boolean;
  snapToGrid: boolean;
  setApiKey: (key: string) => void;
  setModel: (model: 'flash' | 'pro') => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setTtsEnabled: (enabled: boolean) => void;
  setAccessibilityMode: (enabled: boolean) => void;
  setNoiseSuppression: (enabled: boolean) => void;
  setSnapToGrid: (enabled: boolean) => void;
}

const STORAGE_KEY = 'voicediagram_settings';

const savedSettings = (() => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return {};
})();

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: savedSettings.apiKey || localStorage.getItem('voicediagram_api_key') || '',
  model: savedSettings.model || 'flash',
  language: savedSettings.language || 'en-US',
  theme: savedSettings.theme || 'dark',
  ttsEnabled: savedSettings.ttsEnabled || false,
  accessibilityMode: savedSettings.accessibilityMode || false,
  noiseSuppression: savedSettings.noiseSuppression ?? true,
  snapToGrid: savedSettings.snapToGrid ?? true,

  setApiKey: (apiKey) => {
    localStorage.setItem('voicediagram_api_key', apiKey);
    set((state) => {
      const next = { ...state, apiKey };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },
  setModel: (model) => set((state) => {
    const next = { ...state, model };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setLanguage: (language) => set((state) => {
    const next = { ...state, language };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setTheme: (theme) => set((state) => {
    const next = { ...state, theme };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setTtsEnabled: (ttsEnabled) => set((state) => {
    const next = { ...state, ttsEnabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setAccessibilityMode: (accessibilityMode) => set((state) => {
    const next = { ...state, accessibilityMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setNoiseSuppression: (noiseSuppression) => set((state) => {
    const next = { ...state, noiseSuppression };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
  setSnapToGrid: (snapToGrid) => set((state) => {
    const next = { ...state, snapToGrid };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }),
}));
