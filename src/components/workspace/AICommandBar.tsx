import React, { useState } from 'react';
import { Send, Mic, Sparkles, Loader2 } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useVoiceStore } from '../../store/voiceStore';
import { useSettingsStore } from '../../store/settingsStore';
import { voiceEngine } from '../../services/voiceEngine';
import { generateDiagramUpdate } from '../../services/geminiClient';

interface AICommandBarProps {
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ onShowToast }) => {
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { diagramType, nodes, edges, mergeFromAI } = useDiagramStore();
  const { isListening, setAiStatus, addTranscriptLogItem } = useVoiceStore();
  const { apiKey, model, language } = useSettingsStore();

  const handleExecute = async (textToProcess?: string) => {
    const text = textToProcess !== undefined ? textToProcess : promptText;
    if (!text.trim()) return;

    if (!apiKey) {
      onShowToast('Please configure your Gemini API key in settings.', 'error');
      return;
    }

    setIsSubmitting(true);
    setAiStatus('thinking');

    try {
      addTranscriptLogItem(text);
      const result = await generateDiagramUpdate(text, { diagramType, nodes, edges }, apiKey, model);
      if (!('clarify' in result)) {
        mergeFromAI(result);
        setAiStatus('updated');
        onShowToast('Diagram updated by AI!', 'success');
        if (textToProcess === undefined) {
          setPromptText('');
        }
      } else {
        setAiStatus('updated');
        onShowToast(result.clarify, 'info');
      }
    } catch (e: any) {
      setAiStatus('error', e.message);
      onShowToast(e.message || 'Failed to update diagram', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleExecute();
    }
  };

  const handleToggleMic = async () => {
    if (isListening) {
      voiceEngine.stop();
    } else {
      if (!apiKey) {
        onShowToast('Please enter your Gemini API key in settings.', 'error');
        return;
      }
      try {
        await voiceEngine.start(language, async (transcript) => {
          setPromptText(transcript);
          await handleExecute(transcript);
        });
      } catch (e) {
        console.error('Failed to start mic', e);
        onShowToast('Microphone access failed', 'error');
      }
    }
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none">
      <div className="liquid-glass rounded-2xl p-2 border border-white/15 shadow-2xl flex items-center gap-2 pointer-events-auto backdrop-blur-xl bg-black/60">
        <div className="p-2 rounded-xl bg-blue-700/20 text-blue-400 shrink-0">
          <Sparkles size={18} />
        </div>

        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type instruction (e.g. Add payment node) or use microphone..."
          disabled={isSubmitting}
          className="bg-transparent text-sm text-white placeholder-white/40 focus:outline-none flex-1 px-2 py-1"
        />

        {/* Microphone Button */}
        <button
          onClick={handleToggleMic}
          disabled={isSubmitting}
          title={isListening ? 'Stop listening' : 'Speak instructions'}
          className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
              : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10'
          }`}
        >
          <Mic size={16} />
        </button>

        {/* Send Button */}
        <button
          onClick={() => handleExecute()}
          disabled={isSubmitting || !promptText.trim()}
          title="Send prompt"
          className="p-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-700 text-white shadow-lg shadow-blue-700/30 transition-all duration-200 flex items-center justify-center shrink-0"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};
