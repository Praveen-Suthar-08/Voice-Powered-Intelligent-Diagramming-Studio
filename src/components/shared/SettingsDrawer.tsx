import React from 'react';
import { X, Settings, Globe, Cpu, Volume2, Eye, ShieldAlert } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Spanish (Español)' },
  { code: 'fr-FR', label: 'French (Français)' },
  { code: 'de-DE', label: 'German (Deutsch)' },
  { code: 'ja-JP', label: 'Japanese (日本語)' },
  { code: 'zh-CN', label: 'Chinese (中文)' },
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    model,
    setModel,
    language,
    setLanguage,
    ttsEnabled,
    setTtsEnabled,
    accessibilityMode,
    setAccessibilityMode,
    noiseSuppression,
    setNoiseSuppression,
  } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-up">
      <div className="liquid-glass w-80 h-full p-6 border-l border-white/10 flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5 text-white">
            <Settings size={20} className="text-blue-400" />
            <h2 className="text-base font-medium">Settings</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-white/80">
              <Cpu size={14} className="text-blue-400" /> Gemini Model
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setModel('flash')}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  model === 'flash' ? 'bg-blue-700 text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                Flash (Fast)
              </button>
              <button
                onClick={() => setModel('pro')}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  model === 'pro' ? 'bg-blue-700 text-white shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                Pro (Accurate)
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-white/80">
              <Globe size={14} className="text-blue-400" /> Speech Recognition Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0a0a0c] text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-white/80">
                <Volume2 size={14} className="text-blue-400" /> Text-to-Speech Summary
              </span>
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-white/80">
                <Eye size={14} className="text-blue-400" /> High Contrast & Accessibility
              </span>
              <input
                type="checkbox"
                checked={accessibilityMode}
                onChange={(e) => setAccessibilityMode(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-white/80">
                <ShieldAlert size={14} className="text-blue-400" /> Noise Suppression
              </span>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-white/40">
          VoiceDiagram v1.0 · Zero Backend SPA
        </div>
      </div>
    </div>
  );
};
