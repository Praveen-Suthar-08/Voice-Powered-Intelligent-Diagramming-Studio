import React from 'react';
import { ChevronDown, ChevronRight, Trash2, Layers } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';

export const ClusterNode = ({ id, data }: { id: string; data: any }) => {
  const { toggleClusterCollapse, deleteCluster } = useDiagramStore();
  const isCollapsed = data.isCollapsed;

  return (
    <div
      style={{
        width: data.width || 350,
        height: isCollapsed ? 55 : (data.height || 260),
      }}
      className="rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-950/20 backdrop-blur-md p-3 flex flex-col transition-all shadow-2xl group pointer-events-auto"
    >
      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Layers size={14} />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">{data.title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            {data.nodeCount} items
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleClusterCollapse(data.clusterId);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Cluster' : 'Collapse Cluster'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteCluster(data.clusterId);
            }}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete Cluster"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="flex-1 relative pointer-events-none flex items-center justify-center">
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Container Region</span>
        </div>
      )}
    </div>
  );
};
