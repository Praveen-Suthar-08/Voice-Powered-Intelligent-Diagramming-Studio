import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { TopBar } from './workspace/TopBar';
import { Sidebar } from './workspace/Sidebar';
import { RightPanel } from './workspace/RightPanel';
import { StatusBar } from './workspace/StatusBar';
import { Canvas2D } from './canvas2d/Canvas2D';
import { Scene3D } from './canvas3d/Scene3D';
import { Toast } from './shared/Toast';
import { ExportModal } from './shared/ExportModal';
import { KeyboardShortcutsModal } from './shared/KeyboardShortcutsModal';
import { TimelineModal } from './shared/TimelineModal';
import { AICommandBar } from './workspace/AICommandBar';
import { useDiagramStore } from '../store/diagramStore';
import { useVoiceStore } from '../store/voiceStore';
import { captureCanvasDataUrl } from '../services/imageExporter';
import { saveSnapshot, SnapshotRecord } from '../services/persistence';

interface AppShellProps {
  onReturnToHero?: () => void;
  onOpenQuickStart?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onReturnToHero, onOpenQuickStart }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [toastMessage, setToastMessage] = useState<{ message: string; type?: 'info' | 'success' | 'error' } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { projectId, projectName, selectedNodeId, selectNode, undo, redo, overlapDetected, dismissOverlapSuggestion, autoArrange } = useDiagramStore();
  const { isListening } = useVoiceStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ message, type });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
          showToast('Redo', 'info');
        } else {
          e.preventDefault();
          undo();
          showToast('Undo', 'info');
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        showToast('Redo', 'info');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (canvasContainerRef.current) {
          captureCanvasDataUrl(canvasContainerRef.current).then(async (dataUrl) => {
            const snapshot: SnapshotRecord = {
              id: 'snap_' + Math.random().toString(36).substring(2, 9),
              projectId,
              projectName,
              dataUrl,
              createdAt: Date.now(),
            };
            await saveSnapshot(snapshot);
            showToast('High-res snapshot saved (Ctrl+S)!', 'success');
          }).catch(err => {
            console.error('Snapshot failed', err);
            showToast('Failed to capture snapshot', 'error');
          });
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }
      if (e.key === 'Escape') {
        selectNode(null);
        setIsExportModalOpen(false);
        setIsShortcutsOpen(false);
        setIsTimelineOpen(false);
      }
      if (e.key === '?') {
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectNode, projectId, projectName]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0a0c] text-white select-none">
      {/* Top Navigation */}
      <TopBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onOpenQuickStart={onOpenQuickStart || (() => {})}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onShowToast={showToast}
        canvasRef={canvasContainerRef}
        onReturnToHero={onReturnToHero}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarOpen && <Sidebar onShowToast={showToast} canvasRef={canvasContainerRef} onOpenTimeline={() => setIsTimelineOpen(true)} />}

        {/* Canvas Area (2D or 3D) */}
        <div className="flex-1 relative flex flex-col" ref={canvasContainerRef}>
          {viewMode === '2d' ? <Canvas2D /> : <Scene3D />}
          <AICommandBar onShowToast={showToast} />
        </div>

        {/* Right Panel (Node Editor) */}
        {selectedNodeId && <RightPanel onShowToast={showToast} />}
      </div>

      {/* Auto-Arrange Overlap Suggestion Toast */}
      {overlapDetected && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-up">
          <div className="liquid-glass px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-950/95 to-indigo-950/95 border border-blue-500/40 shadow-2xl flex items-center gap-3.5 text-white backdrop-blur-xl">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles size={18} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Complex layout detected</p>
              <p className="text-white/70">Would you like to auto-arrange nodes into a clean hierarchy?</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => {
                  autoArrange();
                  showToast('Nodes auto-arranged successfully!', 'success');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/30"
              >
                Auto-Arrange
              </button>
              <button
                onClick={dismissOverlapSuggestion}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals & Toasts */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onShowToast={showToast}
        canvasRef={canvasContainerRef}
      />
      <TimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onShowToast={showToast}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <Toast
        message={toastMessage?.message || null}
        type={toastMessage?.type || 'info'}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};

export default AppShell;
