import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl / Cmd + Z', desc: 'Undo last change' },
  { key: 'Ctrl / Cmd + Y', desc: 'Redo change' },
  { key: 'Ctrl / Cmd + S', desc: 'Save high-res canvas snapshot' },
  { key: 'Ctrl / Cmd + E', desc: 'Open export center' },
  { key: 'Space', desc: 'Toggle microphone voice command' },
  { key: 'Esc', desc: 'Close modals & deselect node' },
  { key: 'Delete / Backspace', desc: 'Delete selected node' },
  { key: 'Double Click Node', desc: 'Edit node label inline' },
  { key: '?', desc: 'Open keyboard shortcuts overlay' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-up">
      <div className="liquid-glass w-full max-w-lg rounded-3xl p-6 border border-white/20 shadow-2xl relative bg-[#0e1017]/95 text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Command size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-xs text-white/60">Quick reference for global workspace shortcuts</p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="text-xs text-white/80 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/40 text-blue-300 text-xs font-mono border border-white/15 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-white/40">Press '?' or 'Esc' anytime</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
