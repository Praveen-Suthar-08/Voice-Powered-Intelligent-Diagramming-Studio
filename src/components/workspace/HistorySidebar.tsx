import React, { useState, useEffect } from 'react';
import { Camera, Download, Trash2, Calendar, GitBranch, RotateCcw, Plus, Bookmark, History } from 'lucide-react';
import { 
  listSnapshots, deleteSnapshot, SnapshotRecord, saveSnapshot, 
  VersionRecord, saveVersion, listVersions, deleteVersion 
} from '../../services/persistence';
import { captureCanvasDataUrl } from '../../services/imageExporter';
import { useDiagramStore } from '../../store/diagramStore';

interface HistorySidebarProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  onOpenTimeline: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ canvasRef, onShowToast, onOpenTimeline }) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'snapshots'>('versions');
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { projectId, projectName, diagramType, nodes, edges, loadProjectData } = useDiagramStore();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const snapList = await listSnapshots();
      snapList.sort((a, b) => b.createdAt - a.createdAt);
      setSnapshots(snapList);

      const verList = await listVersions(projectId);
      verList.sort((a, b) => b.createdAt - a.createdAt);
      setVersions(verList);
    } catch (e) {
      console.error('Failed to load history data', e);
    }
  };

  const handleTakeSnapshot = async () => {
    if (!canvasRef.current) {
      onShowToast('Canvas reference not found', 'error');
      return;
    }
    setIsCapturing(true);
    try {
      const dataUrl = await captureCanvasDataUrl(canvasRef.current);
      const snapshot: SnapshotRecord = {
        id: 'snap_' + Math.random().toString(36).substring(2, 9),
        projectId,
        projectName,
        dataUrl,
        createdAt: Date.now(),
      };
      await saveSnapshot(snapshot);
      await loadData();
      onShowToast('High-res snapshot saved successfully!', 'success');
    } catch (e) {
      console.error('Snapshot failed', e);
      onShowToast('Failed to capture snapshot', 'error');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      await deleteSnapshot(id);
      await loadData();
      onShowToast('Snapshot deleted', 'info');
    } catch (e) {
      console.error('Failed to delete snapshot', e);
    }
  };

  const handleSaveVersion = async () => {
    const name = versionNameInput.trim() || `Version - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}`;
    try {
      const newVersion: VersionRecord = {
        id: 'ver_' + Math.random().toString(36).substring(2, 9),
        projectId,
        projectName,
        versionName: name,
        diagramType,
        nodes: [...nodes],
        edges: [...edges],
        createdAt: Date.now(),
      };
      await saveVersion(newVersion);
      setVersionNameInput('');
      setShowSaveModal(false);
      await loadData();
      onShowToast(`Version "${name}" saved successfully!`, 'success');
    } catch (e) {
      console.error('Failed to save version', e);
      onShowToast('Failed to save version', 'error');
    }
  };

  const handleRestoreVersion = (ver: VersionRecord) => {
    loadProjectData({
      id: ver.projectId,
      name: ver.projectName,
      diagramType: ver.diagramType,
      nodes: ver.nodes,
      edges: ver.edges,
    });
    onShowToast(`Restored version "${ver.versionName}"`, 'success');
  };

  const handleBranchVersion = (ver: VersionRecord) => {
    const branchedId = 'proj_' + Math.random().toString(36).substring(2, 9);
    const branchedName = `${ver.projectName} (Branch)`;
    loadProjectData({
      id: branchedId,
      name: branchedName,
      diagramType: ver.diagramType,
      nodes: ver.nodes,
      edges: ver.edges,
    });
    onShowToast(`Branched new project from "${ver.versionName}"!`, 'success');
  };

  const handleDeleteVersion = async (id: string) => {
    try {
      await deleteVersion(id);
      await loadData();
      onShowToast('Version deleted', 'info');
    } catch (e) {
      console.error('Failed to delete version', e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab('versions')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'versions' ? 'bg-blue-700 text-white shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          <Bookmark size={13} /> Saved Versions ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('snapshots')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'snapshots' ? 'bg-blue-700 text-white shadow-md' : 'text-white/70 hover:text-white'
          }`}
        >
          <Camera size={13} /> Snapshots ({snapshots.length})
        </button>
      </div>

      {activeTab === 'versions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-white/60">Version History & Branching</span>
            <button
              onClick={() => setShowSaveModal(true)}
              className="p-1.5 rounded-lg bg-blue-700/20 text-blue-400 hover:bg-blue-700/40 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <Plus size={14} /> Save Version
            </button>
          </div>
          <button
            onClick={onOpenTimeline}
            className="w-full py-2.5 rounded-xl bg-blue-700/20 hover:bg-blue-700/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <History size={15} /> Open Visual Timeline Viewer
          </button>

          {showSaveModal && (
            <div className="liquid-glass p-3 rounded-xl border border-blue-500/30 space-y-2 bg-blue-950/20">
              <span className="text-xs font-medium text-white/90">Save Current Diagram Version</span>
              <input
                type="text"
                placeholder="e.g. v1.2 - Experimental Layout"
                value={versionNameInput}
                onChange={(e) => setVersionNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVersion}
                  className="px-3 py-1 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-600 transition-all"
                >
                  Save Version
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                No saved versions yet. Click "Save Version" to create a design checkpoint.
              </div>
            ) : (
              versions.map((ver) => (
                <div
                  key={ver.id}
                  className="liquid-glass p-3 rounded-xl border border-white/10 hover:border-blue-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">{ver.versionName}</span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/60 flex items-center justify-between">
                    <span>{ver.nodes.length} nodes, {ver.edges.length} edges</span>
                    <span className="uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px]">{ver.diagramType}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-[11px] font-medium flex items-center gap-1"
                      title="Restore this version to canvas"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                    <button
                      onClick={() => handleBranchVersion(ver)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors text-[11px] font-medium flex items-center gap-1"
                      title="Branch into new project"
                    >
                      <GitBranch size={12} /> Branch
                    </button>
                    <button
                      onClick={() => handleDeleteVersion(ver.id)}
                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 transition-colors"
                      title="Delete Version"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'snapshots' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-white/60">Canvas Image Snapshots</span>
            <button
              onClick={handleTakeSnapshot}
              disabled={isCapturing}
              className="p-1.5 rounded-lg bg-blue-700/20 text-blue-400 hover:bg-blue-700/40 transition-colors flex items-center gap-1 text-xs font-medium disabled:opacity-50"
            >
              <Camera size={14} /> {isCapturing ? 'Capturing...' : 'Take Snapshot'}
            </button>
          </div>

          <div className="space-y-2">
            {snapshots.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                No snapshots saved yet. Click "Take Snapshot" above to save the current canvas state.
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="liquid-glass p-2.5 rounded-xl border border-white/10 hover:border-blue-500/40 transition-all space-y-2 group"
                >
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/40 h-28">
                    <img src={snap.dataUrl} alt={snap.projectName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `${snap.projectName.toLowerCase().replace(/\s+/g, '_')}_${new Date(snap.createdAt).toISOString().slice(0, 10)}.png`;
                          link.href = snap.dataUrl;
                          link.click();
                          onShowToast('Snapshot downloaded!', 'success');
                        }}
                        className="p-1.5 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500 transition-colors"
                        title="Download PNG"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white shadow hover:bg-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/90 truncate max-w-[140px]">{snap.projectName}</span>
                    <span className="text-white/40 flex items-center gap-1">
                      <Calendar size={11} /> {new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
