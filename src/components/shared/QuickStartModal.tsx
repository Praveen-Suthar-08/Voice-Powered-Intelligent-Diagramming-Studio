import React from 'react';
import { Mic, Sparkles, ArrowRight, CheckCircle2, X, Volume2, Wand2 } from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = React.useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Connect & Configure',
      subtitle: 'Set up your Gemini API Key',
      description: 'VoiceDiagram uses Gemini AI to transform your spoken words and text prompts into professional, structured diagrams instantly.',
      icon: <Sparkles size={32} className="text-blue-400" />,
      highlight: 'Secure & local browser storage'
    },
    {
      title: 'Step 2: Press the Microphone',
      subtitle: 'Speak your diagram instructions',
      description: 'Click the pulsing Microphone button (or use Voice AI in the workspace) and speak out loud. Describe any workflow, system architecture, or mind map.',
      icon: <Mic size={32} className="text-rose-400 animate-pulse" />,
      highlight: 'Say things like: "Create an e-commerce checkout flow"'
    },
    {
      title: 'Step 3: AI Diagram Generation',
      subtitle: 'Watch your thoughts come alive',
      description: 'Gemini instantly parses your speech, builds nodes and connections, and populates the 2D/3D canvas in real-time. You can then edit, export, or speak further updates!',
      icon: <Wand2 size={32} className="text-cyan-400" />,
      highlight: 'Real-time 2D & 3D canvas rendering'
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
      <div className="liquid-glass w-full max-w-lg rounded-3xl p-8 border border-white/20 shadow-2xl relative bg-[#0e1017]/95 text-white flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step Icon badge */}
        <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
          {current.icon}
        </div>

        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">{current.title}</span>
        <h2 className="text-2xl font-bold text-white mb-3">{current.subtitle}</h2>
        <p className="text-sm text-white/70 leading-relaxed mb-6 px-4">{current.description}</p>

        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-8 text-xs font-medium text-cyan-300 flex items-center justify-center gap-2">
          <Volume2 size={15} className="shrink-0 text-cyan-400" />
          <span>{current.highlight}</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setStep(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === step ? 'w-8 bg-blue-600' : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between w-full gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 transition-all"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-xl shadow-blue-600/30 ml-auto"
            >
              <span>Start Building</span>
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
