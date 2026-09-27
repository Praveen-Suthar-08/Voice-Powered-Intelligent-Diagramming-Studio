import React, { useState } from 'react';
import { Boxes, Key, Settings, Mic, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ParticleField } from './ParticleField';
import { ApiKeyModal } from '../shared/ApiKeyModal';
import { SettingsDrawer } from '../shared/SettingsDrawer';
import { TutorialModal } from '../shared/TutorialModal';
import { QuickStartModal } from '../shared/QuickStartModal';
import { useSettingsStore } from '../../store/settingsStore';
import { useVoiceStore } from '../../store/voiceStore';
import { useDiagramStore } from '../../store/diagramStore';
import { voiceEngine } from '../../services/voiceEngine';
import { generateDiagramUpdate, getSampleDiagram } from '../../services/geminiClient';

interface HeroScreenProps {
  onTransitionToWorkspace: () => void;
  onOpenQuickStart?: () => void;
}

export const HeroScreen: React.FC<HeroScreenProps> = ({ onTransitionToWorkspace, onOpenQuickStart }) => {
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const { apiKey, model, language } = useSettingsStore();
  const { isListening, interimText, amplitude, setAiStatus } = useVoiceStore();
  const { mergeFromAI, loadProjectData, diagramType, nodes, edges } = useDiagramStore();

  const handleToggleMic = async () => {
    if (!voiceEngine.isSupported()) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      voiceEngine.stop();
    } else {
      if (!apiKey) {
        setIsApiKeyOpen(true);
        return;
      }
      try {
        await voiceEngine.start(language, async (transcript) => {
          setAiStatus('thinking');
          try {
            const result = await generateDiagramUpdate(
              transcript,
              { diagramType, nodes, edges },
              apiKey,
              model
            );
            if ('clarify' in result) {
              setAiStatus('updated');
            } else {
              mergeFromAI(result);
              setAiStatus('updated');
              onTransitionToWorkspace();
            }
          } catch (e: any) {
            setAiStatus('error', e.message);
          }
        });
      } catch (e) {
        console.error('Failed to start voice', e);
      }
    }
  };

  const handleTrySample = async (sampleText?: string) => {
    setAiStatus('thinking');
    try {
      const text = sampleText || "There is a user opening the app, logging in with credentials. If credentials are correct, load dashboard. If incorrect, show error message.";
      if (apiKey) {
        const result = await generateDiagramUpdate(
          text,
          { diagramType: 'flowchart', nodes: [], edges: [] },
          apiKey,
          model
        );
        if (!('clarify' in result)) {
          mergeFromAI(result);
        } else {
          loadProjectData({
            id: 'proj_sample_' + Date.now(),
            name: 'Sample Flowchart',
            ...getSampleDiagram(),
          });
        }
      } else {
        loadProjectData({
          id: 'proj_sample_' + Date.now(),
          name: 'Sample Flowchart',
          ...getSampleDiagram(),
        });
      }
      setAiStatus('updated');
      onTransitionToWorkspace();
    } catch (e) {
      loadProjectData({
        id: 'proj_sample_' + Date.now(),
        name: 'Sample Flowchart',
        ...getSampleDiagram(),
      });
      onTransitionToWorkspace();
    }
  };

  const samplePrompts = [
    "User Login & Auth Flow",
    "Cloud Microservices Architecture",
    "SaaS Product Roadmap",
    "E-Commerce Checkout Funnel"
  ];

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center text-white">
      {/* Particle background */}
      <ParticleField amplitude={amplitude} />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 flex justify-between items-center px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Boxes size={22} />
          </div>
          <span className="text-base tracking-tight text-white font-medium">VoiceDiagram</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (onOpenQuickStart ? onOpenQuickStart() : setIsTutorialOpen(true))}
            className="liquid-glass px-4 py-2 rounded-xl text-sm text-white/90 hover:text-white flex items-center gap-2 hover:bg-white/10 transition-transform duration-200 hover:scale-105 active:scale-95 border border-white/10"
          >
            <HelpCircle size={16} className="text-blue-400" />
            <span>Quick Start</span>
          </button>
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="liquid-glass px-4 py-2 rounded-xl text-sm text-white flex items-center gap-2 hover:bg-white/10 transition-transform duration-200 hover:scale-105 active:scale-95 border border-white/10 shadow-lg shadow-blue-600/10"
          >
            <Key size={16} className="text-blue-400" />
            <span>{apiKey ? 'API Key Connected ✓' : 'Enter API Key'}</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="liquid-glass h-10 w-10 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-transform duration-200 hover:scale-105 active:scale-95 border border-white/10"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Center Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto mt-10">
        {/* Badge */}
        <div className="animate-fade-up delay-1 liquid-glass rounded-full px-4 py-1.5 text-xs sm:text-sm text-white inline-flex items-center gap-2 border border-white/10 mb-6 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsTutorialOpen(true)}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Interactive Voice-to-Diagram · Powered by Gemini</span>
          <Sparkles size={14} className="text-blue-400" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-2 text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-white font-medium tracking-tight">
          Speak it. <span className="text-blue-500">See it.</span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-up delay-3 mt-5 max-w-lg text-sm sm:text-base md:text-lg text-white/70 leading-relaxed">
          Explain any process, system, or idea out loud — watch Gemini build a live, interactive 2D & 3D diagram in seconds.
        </p>

        {/* Mic Button & Pulse Rings */}
        <div className="animate-fade-up delay-4 mt-8 relative flex items-center justify-center">
          {isListening && (
            <>
              <motion.div
                className="absolute w-28 h-28 rounded-full border-2 border-blue-500/60 pointer-events-none"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute w-28 h-28 rounded-full border border-blue-400/40 pointer-events-none"
                animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
            </>
          )}

          <button
            onClick={handleToggleMic}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95 group ${
              isListening ? 'bg-rose-600 shadow-rose-600/50' : 'bg-blue-600 shadow-blue-600/50 hover:bg-blue-500'
            }`}
            title="Click to speak your diagram"
          >
            <Mic size={36} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Waveform Visualizer */}
        <div className="animate-fade-up delay-4 mt-4 flex items-center gap-1.5 h-8">
          {Array.from({ length: 24 }).map((_, i) => {
            const height = isListening
              ? Math.max(8, Math.sin(i + Date.now() * 0.01) * amplitude * 40 + 12)
              : 6;
            return (
              <div
                key={i}
                style={{ height: `${height}px` }}
                className="w-1 rounded-full bg-blue-500/70 transition-all duration-75"
              />
            );
          })}
        </div>

        {/* Live Transcript Chip */}
        <div className="animate-fade-up delay-5 mt-4 liquid-glass rounded-xl px-5 py-2.5 text-sm text-white/90 max-w-md truncate border border-white/10 shadow-lg">
          {interimText || (isListening ? 'Listening for speech...' : "Try saying: 'There's a login screen, if the password is wrong show an error... '")}
        </div>

        {/* Quick Sample Prompts to Make it Understandable */}
        <div className="animate-fade-up delay-5 mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl">
          <span className="text-xs text-white/50 w-full mb-1">Or click a sample idea to test instantly:</span>
          {samplePrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleTrySample(promptText)}
              className="liquid-glass px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10 inline-flex items-center gap-1.5"
            >
              <span>{promptText}</span>
              <ArrowRight size={12} className="text-blue-400" />
            </button>
          ))}
        </div>

        {/* Secondary Row */}
        <div className="animate-fade-up delay-5 mt-6 flex items-center gap-4">
          <button
            onClick={() => handleTrySample()}
            className="liquid-glass px-5 py-2.5 rounded-xl text-sm text-white font-medium hover:bg-white/10 transition-transform duration-200 hover:scale-105 active:scale-95 border border-white/10 shadow-md"
          >
            Try full sample diagram
          </button>
          <button
            onClick={onTransitionToWorkspace}
            className="text-white/60 hover:text-white text-sm underline transition-colors"
          >
            Skip to workspace
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <QuickStartModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
};
