import React, { useState } from 'react';
import { Key, ExternalLink, X } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useSettingsStore();
  const [val, setVal] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(val.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-up">
      <div className="liquid-glass w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-700/20 text-blue-400">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Connect Gemini API Key</h2>
            <p className="text-xs text-white/60">Free & stored securely in your browser localStorage</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">Gemini API Key</label>
            <input
              type="password"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Don't have a key?</span>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              Get one from Google AI Studio <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm bg-blue-700 text-white font-medium hover:bg-blue-600 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-700/30"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
