import React from 'react';
import { Palette, Check, Sparkles, Shield, Cpu, Moon, Sun } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { DiagramTheme } from '../../types/diagram';

const THEMES: { id: DiagramTheme; name: string; desc: string; icon: any; bgPreview: string; cardPreview: string; accentColor: string }[] = [
  {
    id: 'minimalist-dark',
    name: 'Minimalist Dark',
    desc: 'Sleek obsidian glass with subtle borders & vibrant accents.',
    icon: Moon,
    bgPreview: 'bg-[#0a0a0c]',
    cardPreview: 'bg-white/5 border-white/10 text-white',
    accentColor: '#3b82f6',
  },
  {
    id: 'corporate-light',
    name: 'Corporate Light',
    desc: 'Clean, professional light mode for presentations & reports.',
    icon: Sun,
    bgPreview: 'bg-slate-100',
    cardPreview: 'bg-white border-slate-200 text-slate-800 shadow-sm',
    accentColor: '#2563eb',
  },
  {
    id: 'blueprint',
    name: 'Blueprint Style',
    desc: 'Engineering blueprint with grid lines and technical precision.',
    icon: Cpu,
    bgPreview: 'bg-[#0e2a47]',
    cardPreview: 'bg-[#153e6b] border-blue-400/40 text-cyan-200',
    accentColor: '#38bdf8',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Synth',
    desc: 'Deep purple synthwave aesthetic with hot pink & neon yellow.',
    icon: Sparkles,
    bgPreview: 'bg-[#120826]',
    cardPreview: 'bg-[#1e103f] border-pink-500/40 text-pink-200',
    accentColor: '#ec4899',
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    desc: 'Obsidian black with ultra-vibrant glowing neon rims.',
    icon: Shield,
    bgPreview: 'bg-[#050508]',
    cardPreview: 'bg-[#0f0f17] border-emerald-500/50 text-emerald-300',
    accentColor: '#10b981',
  },
];

export const ThemesSidebar: React.FC<{ onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void }> = ({ onShowToast }) => {
  const { theme, setTheme, setPreviewTheme } = useDiagramStore();

  const handleSelectTheme = (t: DiagramTheme, name: string) => {
    setPreviewTheme(null);
    setTheme(t);
    onShowToast(`Applied theme: ${name}`, 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/60 flex items-center gap-1.5">
          <Palette size={14} className="text-blue-400" /> Visual Themes
        </span>
      </div>

      <div className="space-y-2">
        {THEMES.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;
          return (
            <div
              key={t.id}
              onMouseEnter={() => setPreviewTheme(t.id)}
              onMouseLeave={() => setPreviewTheme(null)}
              onClick={() => handleSelectTheme(t.id, t.name)}
              className={`group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-700/20 border-blue-500/60 shadow-lg'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${t.bgPreview} border border-white/10 text-white`}>
                    <Icon size={14} style={{ color: t.accentColor }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{t.name}</h4>
                    <p className="text-[10px] text-white/50">{t.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow">
                    <Check size={12} />
                  </div>
                )}
              </div>

              {/* Mini preview box */}
              <div className={`mt-2 p-2 rounded-lg text-[10px] border flex items-center justify-between ${t.cardPreview}`}>
                <span className="font-medium">Node Example</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accentColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
