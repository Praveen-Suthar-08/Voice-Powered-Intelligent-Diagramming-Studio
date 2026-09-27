import React, { useState, useEffect } from 'react';
import { FolderOpen, History, LayoutTemplate, Palette, Camera, Sparkles, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useVoiceStore } from '../../store/voiceStore';
import { listProjects, deleteProject, saveProject } from '../../services/persistence';
import { ProjectRecord, DiagramType } from '../../types/diagram';
import { ThemesSidebar } from './ThemesSidebar';
import { HistorySidebar } from './HistorySidebar';
import { InsightsSidebar } from './InsightsSidebar';
import { TemplateThumbnail } from './TemplateThumbnail';

const TEMPLATES: { type: DiagramType; label: string; desc: string }[] = [
  { type: 'flowchart', label: 'Flowchart', desc: 'Process and decision flows' },
  { type: 'mindmap', label: 'Mind Map', desc: 'Brainstorming & concepts' },
  { type: 'sequence', label: 'Sequence Diagram', desc: 'Message passing & interactions' },
  { type: 'erd', label: 'ER Diagram', desc: 'Database entities & relations' },
  { type: 'orgchart', label: 'Org Chart', desc: 'Company hierarchy & teams' },
  { type: 'network', label: 'Architecture Network', desc: 'Cloud & system topology' },
  { type: 'gantt', label: 'Gantt Timeline', desc: 'Project schedule & tasks' },
];

interface SidebarProps {
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onOpenTimeline: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onShowToast, canvasRef, onOpenTimeline }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagrams' | 'voice' | 'templates' | 'themes' | 'history' | 'insights'>('diagrams');
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<DiagramType | null>(null);

  const { projectId, diagramType, setDiagramType, loadProjectData } = useDiagramStore();
  const { finalTranscriptLog, clearLog } = useVoiceStore();

  useEffect(() => {
    loadProjectsList();
  }, [projectId]);

  const loadProjectsList = async () => {
    try {
      const list = await listProjects();
      setProjects(list);
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  };

  const handleNewProject = async () => {
    const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const newProj: ProjectRecord = {
      id: newId,
      name: 'Untitled Diagram',
      diagramType: 'flowchart',
      nodes: [],
      edges: [],
      transcriptLog: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProject(newProj);
    loadProjectData(newProj);
    clearLog();
    loadProjectsList();
    onShowToast('New project created', 'success');
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteProject(id);
    loadProjectsList();
    onShowToast('Project deleted', 'info');
  };

  const handleSelectProject = async (p: ProjectRecord) => {
    loadProjectData(p);
    onShowToast(`Loaded "${p.name}"`, 'success');
  };

  return (
    <aside
      className={`liquid-glass h-full border-r border-white/10 flex transition-all duration-300 z-20 overflow-hidden ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
    >
      {/* Left Icon Navigation Rail */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-3 bg-black/20 shrink-0">
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('diagrams'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'diagrams' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Projects"
        >
          <FolderOpen size={20} />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('insights'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'insights' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Diagram Insights & Audit"
        >
          <Sparkles size={20} />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('voice'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'voice' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Voice Log"
        >
          <History size={20} />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('templates'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'templates' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Diagram Types"
        >
          <LayoutTemplate size={20} />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('themes'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'themes' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Themes"
        >
          <Palette size={20} />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab('history'); }}
          className={`p-3 rounded-xl transition-all flex items-center justify-center ${
            !isCollapsed && activeTab === 'history' ? 'bg-blue-700 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Snapshots History"
        >
          <Camera size={20} />
        </button>

        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Right Content Panel */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/10">
          <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {activeTab === 'diagrams' && 'Projects'}
              {activeTab === 'insights' && 'Diagram Insights'}
              {activeTab === 'voice' && 'Voice Log History'}
              {activeTab === 'templates' && 'Diagram Types'}
              {activeTab === 'themes' && 'Workspace Themes'}
              {activeTab === 'history' && 'Canvas Snapshots'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'diagrams' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">Saved Projects</span>
                  <button
                    onClick={handleNewProject}
                    className="px-2.5 py-1 rounded-lg bg-blue-700/20 text-blue-400 hover:bg-blue-700/40 transition-colors flex items-center gap-1 text-xs font-medium"
                  >
                    <Plus size={14} /> New
                  </button>
                </div>

                <div className="space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        p.id === projectId
                          ? 'bg-blue-700/20 border-blue-500/50 text-white shadow-md'
                          : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-white/40 capitalize">{p.diagramType} · {new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteProject(e, p.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <InsightsSidebar onShowToast={onShowToast} />
            )}

            {activeTab === 'voice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">Voice Log History</span>
                  {finalTranscriptLog.length > 0 && (
                    <button onClick={clearLog} className="text-xs text-rose-400 hover:underline">
                      Clear
                    </button>
                  )}
                </div>

                {finalTranscriptLog.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-8">No voice logs yet. Start speaking in the workspace!</p>
                ) : (
                  <div className="space-y-2">
                    {finalTranscriptLog.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-white/40">
                          <span>Spoken Chunk</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <p className="text-white/90">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-3 relative">
                <span className="text-xs font-medium text-white/60">Select Diagram Type</span>
                <div className="space-y-2">
                  {TEMPLATES.map((t) => (
                    <div
                      key={t.type}
                      onMouseEnter={() => setHoveredTemplate(t.type)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      onClick={() => {
                        setDiagramType(t.type);
                        onShowToast(`Switched to ${t.label}`, 'success');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                        diagramType === t.type
                          ? 'bg-blue-700/20 border-blue-500/50 text-white shadow-md'
                          : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-medium">{t.label}</p>
                      <p className="text-[10px] text-white/50">{t.desc}</p>
                    </div>
                  ))}
                </div>

                {hoveredTemplate && (
                  <div className="absolute left-full ml-3 top-0 z-50 animate-fade-up">
                    <TemplateThumbnail type={hoveredTemplate} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'themes' && (
              <ThemesSidebar onShowToast={onShowToast} />
            )}

            {activeTab === 'history' && (
              <HistorySidebar canvasRef={canvasRef || { current: null }} onShowToast={onShowToast} onOpenTimeline={onOpenTimeline} />
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
