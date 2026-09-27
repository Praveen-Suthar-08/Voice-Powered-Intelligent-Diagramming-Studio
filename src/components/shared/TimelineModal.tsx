import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, GitBranch, Clock, Layers, Calendar, Check, ArrowRight } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { listVersions, VersionRecord, listSnapshots, SnapshotRecord, saveProject } from '../../services/persistence';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { projectId, projectName, diagramType, loadProjectData } = useDiagramStore();
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTimelineData();
    }
  }, [isOpen, projectId]);

  const loadTimelineData = async () => {
    setIsLoading(true);
    try {
      const vList = await listVersions(projectId);
      vList.sort((a, b) => b.createdAt - a.createdAt);
      setVersions(vList);
      if (vList.length > 0 && !selectedVersionId) {
        setSelectedVersionId(vList[0].id);
      }

      const sList = await listSnapshots();
      const projSnaps = sList.filter(s => s.projectId === projectId);
      projSnaps.sort((a, b) => b.createdAt - a.createdAt);
      setSnapshots(projSnaps);
    } catch (e) {
      console.error('Failed to load timeline data', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || versions[0];

  const handleRestoreVersion = (v: VersionRecord) => {
    loadProjectData({
      id: v.projectId,
      name: v.projectName,
      diagramType: v.diagramType,
      nodes: v.nodes,
      edges: v.edges,
    });
    onShowToast(`Restored version from ${new Date(v.createdAt).toLocaleTimeString()}`, 'success');
    onClose();
  };

  const handleBranchVersion = async (v: VersionRecord) => {
    const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const branchedProj = {
      id: newId,
      name: `${v.projectName} (Branch ${new Date(v.createdAt).toLocaleDateString()})`,
      diagramType: v.diagramType,
      nodes: v.nodes,
      edges: v.edges,
      transcriptLog: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProject(branchedProj);
    loadProjectData(branchedProj);
    onShowToast('Created new branch from version!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-up">
      <div className="liquid-glass w-full max-w-4xl h-[85vh] rounded-2xl border border-white/15 shadow-2xl relative flex flex-col overflow-hidden bg-[#0d0f15]/95 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-700/20 text-blue-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Project Version Timeline</h2>
              <p className="text-xs text-white/50">Scrub through saved checkpoints and restore past states</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Timeline List */}
          <div className="w-80 border-r border-white/10 flex flex-col bg-black/30 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider px-1">
              <span>Saved Checkpoints</span>
              <span>{versions.length} versions</span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12 px-4 text-white/40 text-xs space-y-2">
                <Clock size={28} className="mx-auto opacity-40" />
                <p>No saved versions yet for this project.</p>
                <p className="text-[10px] text-white/30">Use "Save Version" in the history sidebar to create checkpoints.</p>
              </div>
            ) : (
              <div className="space-y-2.5 relative">
                <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-blue-500/20" />
                {versions.map((v) => {
                  const isSelected = v.id === (selectedVersionId || versions[0]?.id);
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVersionId(v.id)}
                      className={`relative pl-8 pr-3 py-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      {/* Timeline Node Dot */}
                      <div className={`absolute left-2.5 top-4 w-2.5 h-2.5 rounded-full border-2 ${
                        isSelected ? 'bg-blue-500 border-white' : 'bg-black border-white/40'
                      }`} />

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate">{v.versionName}</span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <span className="capitalize">{v.diagramType}</span>
                        <span>•</span>
                        <span>{v.nodes.length} nodes, {v.edges.length} edges</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Version Inspection & Preview */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#0a0c10]">
            {selectedVersion ? (
              <div className="space-y-6 max-w-2xl mx-auto w-full">
                <div className="liquid-glass p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Checkpoint Details</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{selectedVersion.versionName}</h3>
                    </div>
                    <span className="text-xs font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                      {new Date(selectedVersion.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-[10px] text-white/40 uppercase">Diagram Type</div>
                      <div className="text-sm font-bold text-white capitalize mt-0.5">{selectedVersion.diagramType}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-[10px] text-white/40 uppercase">Nodes</div>
                      <div className="text-sm font-bold text-blue-400 mt-0.5">{selectedVersion.nodes.length}</div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                      <div className="text-[10px] text-white/40 uppercase">Connections</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedVersion.edges.length}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Nodes in this Version</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-black/30 p-3 rounded-xl border border-white/10">
                    {selectedVersion.nodes.map(n => (
                      <div key={n.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                        <span className="font-medium text-white/90">{n.label}</span>
                        <span className="text-[10px] text-white/40 capitalize">{n.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleBranchVersion(selectedVersion)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-2 transition-all"
                  >
                    <GitBranch size={15} /> Branch to New Project
                  </button>
                  <button
                    onClick={() => handleRestoreVersion(selectedVersion)}
                    className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-700/30"
                  >
                    <RotateCcw size={15} /> Restore This Version
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs">
                <Layers size={36} className="opacity-30 mb-2" />
                <p>Select a version on the left to preview and restore.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
