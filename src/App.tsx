import React, { useState, useEffect } from 'react';
import { HeroScreen } from './components/hero/HeroScreen';
import { AppShell } from './components/AppShell';
import { QuickStartModal } from './components/shared/QuickStartModal';
import { useDiagramStore } from './store/diagramStore';
import { decodeShareUrl } from './services/imageExporter';
import { getLastActiveProject } from './services/persistence';

export function App() {
  const [appPhase, setAppPhase] = useState<'hero' | 'workspace'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  const { loadProjectData } = useDiagramStore();

  useEffect(() => {
    const initApp = async () => {
      // Check if first load
      const hasSeen = localStorage.getItem('has_seen_quickstart');
      if (!hasSeen) {
        setIsQuickStartOpen(true);
      }

      // 1. Check share URL first
      const shared = decodeShareUrl();
      if (shared) {
        loadProjectData({
          id: 'shared_' + Date.now(),
          name: shared.projectName || 'Shared Diagram',
          diagramType: shared.diagramType,
          nodes: shared.nodes,
          edges: shared.edges,
        });
        setAppPhase('workspace');
        setIsLoading(false);
        return;
      }

      // 2. Check last active project in IndexedDB
      try {
        const lastProject = await getLastActiveProject();
        if (lastProject && lastProject.nodes && lastProject.nodes.length > 0) {
          loadProjectData(lastProject);
          setAppPhase('workspace');
        }
      } catch (e) {
        console.error('Failed to load last active project', e);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [loadProjectData]);

  const handleCloseQuickStart = () => {
    localStorage.setItem('has_seen_quickstart', 'true');
    setIsQuickStartOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs text-white/60">Loading VoiceDiagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0c] text-white overflow-hidden relative">
      {appPhase === 'hero' ? (
        <HeroScreen onTransitionToWorkspace={() => setAppPhase('workspace')} onOpenQuickStart={() => setIsQuickStartOpen(true)} />
      ) : (
        <AppShell onReturnToHero={() => setAppPhase('hero')} onOpenQuickStart={() => setIsQuickStartOpen(true)} />
      )}

      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={handleCloseQuickStart}
      />
    </div>
  );
}

export default App;
