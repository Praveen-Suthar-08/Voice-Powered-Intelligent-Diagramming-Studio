import React, { useState, useRef, useEffect } from 'react';
import { Boxes, Undo2, Redo2, Download, Share2, Mic, ChevronDown, FileImage, FileCode, FileText, Home, Search, Camera, Folder, CircleDot, X, Grid, Workflow, History, HelpCircle, Command } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useVoiceStore } from '../../store/voiceStore';
import { useSettingsStore } from '../../store/settingsStore';
import { voiceEngine } from '../../services/voiceEngine';
import { generateDiagramUpdate } from '../../services/geminiClient';
import { exportToPng, exportToSvg, exportToPdf, generateShareUrl } from '../../services/imageExporter';
import { listProjects, listSnapshots, loadProject, SnapshotRecord } from '../../services/persistence';

interface TopBarProps {
  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;
  onOpenExportModal: () => void;
  onOpenTimeline: () => void;
  onOpenQuickStart: () => void;
  onOpenShortcuts: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onReturnToHero?: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  viewMode,
  setViewMode,
  onOpenExportModal,
  onOpenTimeline,
  onOpenQuickStart,
  onOpenShortcuts,
  onShowToast,
  canvasRef,
  onReturnToHero,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const { projectName, setProjectName, undo, redo, diagramType, nodes, edges, mergeFromAI, loadProjectData, selectNode, autoArrange } = useDiagramStore();
  const { isListening, setAiStatus } = useVoiceStore();
  const { apiKey, model, language, snapToGrid, setSnapToGrid } = useSettingsStore();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ projects: any[]; snapshots: SnapshotRecord[]; nodes: any[] }>({ projects: [], snapshots: [], nodes: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node) &&
        exportButtonRef.current &&
        !exportButtonRef.current.contains(e.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], snapshots: [], nodes: [] });
      setIsSearchOpen(false);
      return;
    }

    const q = searchQuery.toLowerCase();
    Promise.all([listProjects(), listSnapshots()]).then(([projects, snapshots]) => {
      const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(q) || p.diagramType.toLowerCase().includes(q));
      const filteredSnapshots = snapshots.filter(s => s.projectName.toLowerCase().includes(q));
      const filteredNodes = nodes.filter(n => n.label.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q));
      
      setSearchResults({ projects: filteredProjects, snapshots: filteredSnapshots, nodes: filteredNodes });
      setIsSearchOpen(true);
    }).catch(err => console.error(err));
  }, [searchQuery, nodes]);

  const handleSelectProjectResult = async (projId: string) => {
    try {
      const p = await loadProject(projId);
      if (p) {
        loadProjectData(p);
        onShowToast(`Loaded project: ${p.name}`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectNodeResult = (nodeId: string) => {
    selectNode(nodeId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectSnapshotResult = (snap: SnapshotRecord) => {
    const link = document.createElement('a');
    link.download = `${snap.projectName.toLowerCase().replace(/\s+/g, '_')}_snapshot.png`;
    link.href = snap.dataUrl;
    link.click();
    onShowToast('Snapshot downloaded from search!', 'success');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleToggleExportMenu = () => {
    setIsExportMenuOpen(!isExportMenuOpen);
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
          setAiStatus('thinking');
          try {
            const result = await generateDiagramUpdate(transcript, { diagramType, nodes, edges }, apiKey, model);
            if (!('clarify' in result)) {
              mergeFromAI(result);
              setAiStatus('updated');
              onShowToast('Diagram updated via voice!', 'success');
            } else {
              setAiStatus('updated');
              onShowToast(result.clarify, 'info');
            }
          } catch (e: any) {
            setAiStatus('error', e.message);
            onShowToast(e.message, 'error');
          }
        });
      } catch (e) {
        console.error('Failed to start mic', e);
      }
    }
  };

  const handleShare = () => {
    const url = generateShareUrl({ diagramType, nodes, edges, projectName });
    navigator.clipboard.writeText(url);
    onShowToast('Link copied to clipboard!', 'success');
  };

  const handleExportPng = () => {
    if (canvasRef.current) {
      exportToPng(canvasRef.current, `${projectName.toLowerCase().replace(/\s+/g, '_')}.png`);
      onShowToast('PNG exported successfully!', 'success');
    }
    setIsExportMenuOpen(false);
  };

  const handleExportSvg = () => {
    if (canvasRef.current) {
      exportToSvg(canvasRef.current, `${projectName.toLowerCase().replace(/\s+/g, '_')}.svg`);
      onShowToast('SVG exported successfully!', 'success');
    }
    setIsExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    if (canvasRef.current) {
      exportToPdf(canvasRef.current, `${projectName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      onShowToast('PDF exported successfully!', 'success');
    }
    setIsExportMenuOpen(false);
  };

  return (
    <header className="h-16 bg-[#0f1117]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-50 border-b border-white/10 shrink-0 shadow-lg gap-2 overflow-x-auto">
      {/* Left: Home, Logo & Editable Project Name */}
      <div className="flex items-center gap-3 shrink-0">
        {onReturnToHero && (
          <button
            onClick={onReturnToHero}
            title="Go to Homepage"
            className="px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-xs font-medium bg-white/5 border border-white/10 shrink-0"
          >
            <Home size={15} className="text-blue-400" />
            <span className="hidden md:inline">Home</span>
          </button>
        )}


        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Boxes size={20} />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white hidden sm:inline">VoiceDiagram</span>
        </div>

        <div className="h-5 w-[1px] bg-white/10 hidden sm:block shrink-0" />

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Diagram"
          className="bg-white/5 border border-white/10 text-sm text-white font-medium px-3 py-1.5 rounded-xl hover:bg-white/10 focus:bg-white/15 focus:border-blue-500/50 focus:outline-none transition-all w-36 sm:w-48 shrink-0"
        />

        {/* Global Search Input */}
        <div className="relative hidden 2xl:block shrink-0" ref={searchRef}>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-48 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
            <Search size={14} className="text-white/40 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {isSearchOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-[#161922] border border-white/15 rounded-2xl p-3 shadow-2xl z-[9999] max-h-96 overflow-y-auto space-y-3 animate-fade-up">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Search Results</div>
              
              {searchResults.projects.length === 0 && searchResults.snapshots.length === 0 && searchResults.nodes.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">No matching projects or snapshots found.</p>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-400 font-medium px-1 flex items-center gap-1"><Folder size={11} /> Projects</span>
                      {searchResults.projects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProjectResult(p.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-medium truncate text-white/90">{p.name}</span>
                          <span className="text-[10px] text-white/40 capitalize">{p.diagramType}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.snapshots.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-400 font-medium px-1 flex items-center gap-1"><Camera size={11} /> Snapshots</span>
                      {searchResults.snapshots.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSnapshotResult(s)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-medium truncate text-white/90">{s.projectName}</span>
                          <span className="text-[10px] text-white/40">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.nodes.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 font-medium px-1 flex items-center gap-1"><CircleDot size={11} /> Canvas Nodes</span>
                      {searchResults.nodes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleSelectNodeResult(n.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-medium truncate text-white/90">{n.label}</span>
                          <span className="text-[10px] text-white/40 capitalize">{n.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Undo, Redo, 2D/3D Toggle */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d' ? 'bg-blue-600 text-white shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              2D Canvas
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d' ? 'bg-blue-600 text-white shadow-md' : 'text-white/70 hover:text-white'
              }`}
            >
              3D Spatial
            </button>
          </div>

          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            title={snapToGrid ? 'Grid Snap: ON' : 'Grid Snap: OFF'}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              snapToGrid
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-md'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
            }`}
          >
            <Grid size={14} className={snapToGrid ? 'text-emerald-400' : 'text-white/40'} />
            <span className="hidden sm:inline">Snap</span>
          </button>

          <button
            onClick={autoArrange}
            title="Auto-Arrange Hierarchy"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border bg-white/5 text-white/80 border-white/10 hover:text-white hover:bg-white/10 transition-all shadow-md"
          >
            <Workflow size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Auto-Arrange</span>
          </button>
        </div>
      </div>

      {/* Right: Export, Share, Mic Re-record */}
      <div className="flex items-center gap-3">
        {/* Export Dropdown Button */}
        <div className="relative">
          <button
            ref={exportButtonRef}
            onClick={handleToggleExportMenu}
            className="bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-200 flex items-center gap-2 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <Download size={15} className="text-blue-400" />
            <span>Export</span>
            <ChevronDown size={13} className="text-blue-300/80" />
          </button>

          {/* Dropdown Menu */}
          {isExportMenuOpen && (
            <div
              ref={exportMenuRef}
              className="absolute right-0 top-full mt-2 w-56 bg-[#161922] border border-white/20 rounded-2xl p-2 shadow-2xl z-[99999] animate-fade-up"
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Layout & Export</div>
              <button
                onClick={() => { setIsExportMenuOpen(false); autoArrange(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Workflow size={15} className="text-cyan-400" /> Auto-Arrange Hierarchy
              </button>
              <div className="h-[1px] bg-white/10 my-1" />
              <button
                onClick={handleExportPng}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileImage size={15} className="text-blue-400" /> Export High-Res PNG
              </button>
              <button
                onClick={handleExportSvg}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileCode size={15} className="text-cyan-400" /> Export Vector SVG
              </button>
              <button
                onClick={handleExportPdf}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileText size={15} className="text-rose-400" /> Export Document PDF
              </button>
              <div className="h-[1px] bg-white/10 my-1" />
              <button
                onClick={() => { setIsExportMenuOpen(false); onOpenExportModal(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileCode size={15} className="text-emerald-400" /> Mermaid Code & JSON
              </button>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium text-white/90 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Command size={15} className="text-cyan-400" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>

        {/* Quick Start Button */}
        <button
          onClick={onOpenQuickStart}
          title="Quick Start Walkthrough"
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium text-white/90 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <HelpCircle size={15} className="text-blue-400" />
          <span className="hidden sm:inline">Quick Start</span>
        </button>

        {/* Timeline Button */}
        <button
          onClick={onOpenTimeline}
          title="Project Version Timeline"
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium text-white/90 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <History size={15} className="text-purple-400" />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium text-white/90 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Share2 size={15} className="text-blue-400" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Mic Re-record Button */}
        <button
          onClick={handleToggleMic}
          className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-medium text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 ${
            isListening ? 'bg-rose-600 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice command'}
        >
          <Mic size={16} />
          <span className="hidden md:inline">{isListening ? 'Listening...' : 'Voice AI'}</span>
        </button>
      </div>
    </header>
  );
};
