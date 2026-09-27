import { create } from 'zustand';
import { TranscriptLogItem } from '../types/diagram';

interface VoiceState {
  isListening: boolean;
  isPushToTalk: boolean;
  interimText: string;
  finalTranscriptLog: TranscriptLogItem[];
  amplitude: number;
  aiStatus: 'idle' | 'listening' | 'thinking' | 'updated' | 'error';
  errorMessage: string | null;
  clarifyQuestion: string | null;
  
  setIsListening: (val: boolean) => void;
  setInterimText: (text: string) => void;
  addTranscriptLogItem: (text: string, nodeIds?: string[]) => void;
  setAmplitude: (amp: number) => void;
  setAiStatus: (status: 'idle' | 'listening' | 'thinking' | 'updated' | 'error', errorMsg?: string | null) => void;
  setClarifyQuestion: (q: string | null) => void;
  clearLog: () => void;
  setLog: (log: TranscriptLogItem[]) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  isPushToTalk: false,
  interimText: '',
  finalTranscriptLog: [],
  amplitude: 0,
  aiStatus: 'idle',
  errorMessage: null,
  clarifyQuestion: null,

  setIsListening: (isListening) => set({ isListening }),
  setInterimText: (interimText) => set({ interimText }),
  addTranscriptLogItem: (text, nodeIds) => set((state) => ({
    finalTranscriptLog: [
      ...state.finalTranscriptLog,
      {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        nodeIds
      }
    ]
  })),
  setAmplitude: (amplitude) => set({ amplitude }),
  setAiStatus: (aiStatus, errorMessage = null) => set({ aiStatus, errorMessage }),
  setClarifyQuestion: (clarifyQuestion) => set({ clarifyQuestion }),
  clearLog: () => set({ finalTranscriptLog: [] }),
  setLog: (finalTranscriptLog) => set({ finalTranscriptLog }),
}));
