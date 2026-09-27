import React, { useState } from 'react';
import { Sparkles, Mic, Eye, Download, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKey: () => void;
  onTrySample: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenApiKey,
  onTrySample,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Connect Gemini API Key',
      description: 'VoiceDiagram uses Google Gemini AI to convert speech into structured diagrams. Your key is stored 100% securely in your browser local storage.',
      icon: <Sparkles className="text-blue-400" size={28} />,
      actionText: 'Enter API Key',
      action: onOpenApiKey,
    },
    {
      title: '2. Speak or Type Your Idea',
      description: 'Click the large microphone button and describe any workflow, architecture, mind map, or system out loud. You can also type or use voice commands like "clear diagram" or "undo".',
      icon: <Mic className="text-blue-400" size={28} />,
      actionText: 'Try Sample Diagram',
      action: onTrySample,
    },
    {
      title: '3. Explore in 2D & 3D',
      description: 'Instantly view your diagram in an interactive 2D React Flow canvas or switch to an immersive 3D Three.js view with orbital controls and camera fly-through.',
      icon: <Eye className="text-blue-400" size={28} />,
    },
    {
      title: '4. Edit, Expand & Export',
      description: 'Select any node to customize colors, edit text, or ask AI to expand sub-nodes. Export your work anytime as PNG, SVG, PDF, or Mermaid diagram code.',
      icon: <Download className="text-blue-400" size={28} />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="liquid-glass w-full max-w-xl rounded-2xl p-6 border border-white/20 shadow-2xl relative bg-[#0a0a0c]/90">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">Welcome to VoiceDiagram</h2>
            <p className="text-xs text-white/60">Speak it. See it. Interactive voice-to-diagram engine.</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeStep ? 'bg-blue-600' : idx < activeStep ? 'bg-blue-600/40' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/10 border border-white/10 shrink-0">
              {steps[activeStep].icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{steps[activeStep].title}</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{steps[activeStep].description}</p>
              {steps[activeStep].actionText && (
                <button
                  onClick={() => {
                    steps[activeStep].action?.();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <span>{steps[activeStep].actionText}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              activeStep === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/10'
            }`}
          >
            Back
          </button>

          <span className="text-xs text-white/50">
            Step {activeStep + 1} of {steps.length}
          </span>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
            >
              <span>Get Started</span>
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
