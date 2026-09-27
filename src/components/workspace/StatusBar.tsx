import React, { useEffect, useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { useVoiceStore } from '../../store/voiceStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useDiagramStore } from '../../store/diagramStore';
import { saveProject } from '../../services/persistence';

export const StatusBar: React.FC = () => {
  const { aiStatus, errorMessage } = useVoiceStore();
  const { model } = useSettingsStore();
  const { projectId, projectName, diagramType, nodes, edges, transcriptLog } = useDiagramStore();

  const [lastSaved, setLastSaved] = useState('Just now');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveProject({
          id: projectId,
          name: projectName,
          diagramType,
          nodes,
          edges,
          transcriptLog,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setLastSaved('Just now');
      } catch (e) {
        console.error('Autosave failed', e);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [nodes, edges, diagramType, projectName]);

  const getStatusText = () => {
    if (aiStatus === 'listening') return 'Listening for speech...';
    if (aiStatus === 'thinking') return 'Gemini is thinking...';
    if (aiStatus === 'updated') return 'Diagram updated ✓';
    if (aiStatus === 'error') return errorMessage || 'Error occurred';
    return 'Idle';
  };

  return (
    <footer className="h-8 liquid-glass flex items-center justify-between px-4 text-xs text-white/60 border-t border-white/10 shrink-0 z-30">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${aiStatus === 'listening' ? 'bg-rose-500 animate-pulse' : aiStatus === 'thinking' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
        <span className="text-white/80 font-medium">{getStatusText()}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
          <Sparkles size={10} className="text-blue-400" />
          <span>{model === 'pro' ? 'Gemini 1.5 Pro' : 'Gemini 2.0 Flash'}</span>
          <span className="text-white/40">·</span>
          <span className="capitalize">{diagramType}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Save size={12} className={isSaving ? 'text-blue-400 animate-spin' : 'text-white/40'} />
          <span>Saved {lastSaved}</span>
        </div>
      </div>
    </footer>
  );
};
