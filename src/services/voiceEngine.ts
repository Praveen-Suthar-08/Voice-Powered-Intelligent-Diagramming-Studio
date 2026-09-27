import { useVoiceStore } from '../store/voiceStore';
import { useDiagramStore } from '../store/diagramStore';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class VoiceEngine {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private silenceTimer: any = null;
  private finalCallback: ((text: string) => void) | null = null;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const voiceStore = useVoiceStore.getState();
        if (interim) {
          voiceStore.setInterimText(interim);
          this.resetSilenceTimer();
        }

        if (final.trim()) {
          voiceStore.setInterimText('');
          this.handleFinalTranscript(final.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          useVoiceStore.getState().setAiStatus('error', `Voice error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.isRunning) {
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart speech recognition', e);
          }
        }
      };
    }
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public async start(lang: string = 'en-US', onFinal: (text: string) => void) {
    this.finalCallback = onFinal;
    const voiceStore = useVoiceStore.getState();

    if (this.recognition) {
      this.recognition.lang = lang;
      try {
        this.recognition.start();
        this.isRunning = true;
        voiceStore.setIsListening(true);
        voiceStore.setAiStatus('listening');
      } catch (e) {
        console.error('Speech recognition start failed', e);
      }
    } else {
      voiceStore.setAiStatus('error', 'Speech recognition not supported in this browser.');
    }

    await this.startAudioMeter();
  }

  public stop() {
    this.isRunning = false;
    const voiceStore = useVoiceStore.getState();
    voiceStore.setIsListening(false);
    voiceStore.setInterimText('');
    voiceStore.setAiStatus('idle');

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.stopAudioMeter();
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      const interim = useVoiceStore.getState().interimText;
      if (interim.trim()) {
        useVoiceStore.getState().setInterimText('');
        this.handleFinalTranscript(interim.trim());
      }
    }, 2500);
  }

  private handleFinalTranscript(text: string) {
    const clean = text.toLowerCase().trim();
    const diagramStore = useDiagramStore.getState();

    // Check voice commands
    if (clean.includes('clear diagram') || clean.includes('start over')) {
      diagramStore.reset();
      useVoiceStore.getState().addTranscriptLogItem(`Command: ${text}`);
      return;
    }
    if (clean.includes('undo')) {
      diagramStore.undo();
      useVoiceStore.getState().addTranscriptLogItem(`Command: ${text}`);
      return;
    }

    if (this.finalCallback) {
      this.finalCallback(text);
    }
  }

  private async startAudioMeter() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);
      this.analyser.fftSize = 256;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const updateAmplitude = () => {
        if (!this.analyser || !this.isRunning) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        useVoiceStore.getState().setAmplitude(avg);
        this.animationFrameId = requestAnimationFrame(updateAmplitude);
      };
      updateAmplitude();
    } catch (e) {
      console.warn('Microphone access for audio metering denied or failed', e);
    }
  }

  private stopAudioMeter() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    useVoiceStore.getState().setAmplitude(0);
  }
}

export const voiceEngine = new VoiceEngine();
