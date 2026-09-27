import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, NodeChange, EdgeChange, applyEdgeChanges, Connection, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Edit2, Palette, Trash2, Check, X, MoveHorizontal, MoveVertical, Layers } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { ClusterNode } from './ClusterNode';
import { DiagramTheme } from '../../types/diagram';

const CanvasContent: React.FC<{
  flowNodes: any[];
  flowEdges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onSelectionChange: any;
  onConnect: any;
  onNodeClick: any;
  onNodeContextMenu: any;
  onPaneClick: any;
  nodeTypes: any;
  edgeTypes: any;
  snapToGrid: boolean;
  showMiniMap: boolean;
  setShowMiniMap: (val: boolean) => void;
  canvasCfg: any;
}> = ({
  flowNodes,
  flowEdges,
  onNodesChange,
  onEdgesChange,
  onSelectionChange,
  onConnect,
  onNodeClick,
  onNodeContextMenu,
  onPaneClick,
  nodeTypes,
  edgeTypes,
  snapToGrid,
  showMiniMap,
  setShowMiniMap,
  canvasCfg,
}) => {
  const { fitView } = useReactFlow();

  const handleResetView = () => {
    fitView({ duration: 600, padding: 0.2 });
  };

  return (
    <div className={`flex-1 w-full h-full relative ${canvasCfg.containerBg} transition-colors duration-300`}>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={handleResetView}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-md transition-all ${canvasCfg.toggleBtnClass}`}
          title="Reset View & Fit Diagram"
        >
          Reset View
        </button>
        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-md transition-all ${canvasCfg.toggleBtnClass}`}
          title="Toggle Cleaner Canvas View"
        >
          {showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'}
        </button>
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        minZoom={0.2}
        maxZoom={2.5}
        fitView
      >
        <Background variant={'dots' as any} gap={20} size={1} color={canvasCfg.gridColor} />
        <Controls className={canvasCfg.controlsClass} />
        {showMiniMap && (
          <MiniMap
            className={canvasCfg.minimapClass}
            nodeColor={canvasCfg.minimapNode}
            maskColor={canvasCfg.minimapMask}
          />
        )}
      </ReactFlow>
    </div>
  );
};

export const Canvas2D: React.FC = () => {
  const { nodes, edges, clusters, groupNodesIntoCluster, theme, previewTheme, selectNode, updateNode, deleteNode, addEdge: storeAddEdge, alignNodes } = useDiagramStore();
  const activeTheme = previewTheme || theme;
  const { snapToGrid } = useSettingsStore();
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode, cluster: ClusterNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const canvasCfg = useMemo(() => {
    switch (activeTheme) {
      case 'corporate-light':
        return {
          containerBg: 'bg-slate-100',
          gridColor: '#cbd5e1',
          edgeColor: '#94a3b8',
          toggleBtnClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
          controlsClass: '!bg-white !border-slate-200 !shadow-lg',
          minimapClass: '!bg-white !border-slate-200 !rounded-xl',
          minimapNode: '#3b82f6',
          minimapMask: 'rgba(241, 245, 249, 0.8)',
        };
      case 'blueprint':
        return {
          containerBg: 'bg-[#0b2545]',
          gridColor: 'rgba(255,255,255,0.15)',
          edgeColor: '#60a5fa',
          toggleBtnClass: 'bg-[#153e6b] text-cyan-200 border-blue-400/30 hover:bg-[#1d4f8a]',
          controlsClass: '!bg-[#153e6b] !border-blue-400/30 !text-cyan-200 !shadow-xl',
          minimapClass: '!bg-[#153e6b] !border-blue-400/30 !rounded-xl',
          minimapNode: '#60a5fa',
          minimapMask: 'rgba(11, 37, 69, 0.8)',
        };
      case 'cyberpunk':
        return {
          containerBg: 'bg-[#120826]',
          gridColor: 'rgba(236,72,153,0.15)',
          edgeColor: '#ec4899',
          toggleBtnClass: 'bg-[#1e103f] text-pink-200 border-pink-500/30 hover:bg-[#2d185e]',
          controlsClass: '!bg-[#1e103f] !border-pink-500/30 !text-pink-200 !shadow-xl',
          minimapClass: '!bg-[#1e103f] !border-pink-500/30 !rounded-xl',
          minimapNode: '#ec4899',
          minimapMask: 'rgba(18, 8, 38, 0.8)',
        };
      case 'neon-glow':
        return {
          containerBg: 'bg-[#050508]',
          gridColor: 'rgba(16,185,129,0.15)',
          edgeColor: '#10b981',
          toggleBtnClass: 'bg-[#0f0f17] text-emerald-200 border-emerald-500/30 hover:bg-[#1a1a24]',
          controlsClass: '!bg-[#0f0f17] !border-emerald-500/30 !text-emerald-200 !shadow-xl',
          minimapClass: '!bg-[#0f0f17] !border-emerald-500/30 !rounded-xl',
          minimapNode: '#10b981',
          minimapMask: 'rgba(5, 5, 8, 0.8)',
        };
      case 'minimalist-dark':
      default:
        return {
          containerBg: 'bg-[#0a0a0c]',
          gridColor: 'rgba(255,255,255,0.08)',
          edgeColor: '#3b82f6',
          toggleBtnClass: 'bg-[#161922] text-white/90 border-white/10 hover:bg-white/10',
          controlsClass: '!bg-[#161922] !border-white/10 !text-white !shadow-2xl',
          minimapClass: '!bg-[#161922] !border-white/10 !rounded-xl',
          minimapNode: '#3b82f6',
          minimapMask: 'rgba(22, 25, 34, 0.8)',
        };
    }
  }, [activeTheme]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const collapsedNodeIds = useMemo(() => {
    const setIds = new Set<string>();
    (clusters || []).forEach(c => {
      if (c.isCollapsed) {
        c.nodeIds.forEach(id => setIds.add(id));
      }
    });
    return setIds;
  }, [clusters]);

  const flowNodes = useMemo(() => {
    const clusterNodes = (clusters || []).map(c => ({
      id: c.id,
      type: 'cluster',
      position: { x: c.x, y: c.y },
      data: {
        clusterId: c.id,
        title: c.title,
        width: c.width,
        height: c.height,
        isCollapsed: c.isCollapsed,
        nodeCount: c.nodeIds.length,
      },
      zIndex: -1,
    }));

    const regularNodes = nodes
      .filter(n => !collapsedNodeIds.has(n.id))
      .map((n) => ({
        id: n.id,
        type: 'custom',
        position: { x: n.x ?? 100, y: n.y ?? 100 },
        data: {
          label: n.label,
          type: n.type,
          description: n.description,
          color: n.color,
        },
      }));

    return [...clusterNodes, ...regularNodes];
  }, [nodes, clusters, collapsedNodeIds]);

  const flowEdges = useMemo(() => {
    const nodeIds = new Set(nodes.map(n => n.id));
    return edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target) && !collapsedNodeIds.has(e.source) && !collapsedNodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
        animated: true,
        type: 'smoothstep',
        style: { stroke: canvasCfg.edgeColor, strokeWidth: 3 },
      }));
  }, [edges, nodes, collapsedNodeIds, canvasCfg.edgeColor]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNode(change.id, { x: change.position.x, y: change.position.y });
        }
      });
    },
    [updateNode]
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    applyEdgeChanges(changes, flowEdges);
  }, [flowEdges]);

  const onSelectionChange = useCallback((params: { nodes: any[] }) => {
    setSelectedNodeIds(params.nodes.map(n => n.id));
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const exists = edges.some(e => e.source === params.source && e.target === params.target);
      if (!exists && params.source && params.target) {
        storeAddEdge({
          id: 'edge_' + Math.random().toString(36).substring(2, 9),
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined,
          label: 'Connected',
        });
      }
    },
    [edges, storeAddEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      selectNode(node.id);
      setContextMenu(null);
    },
    [selectNode]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
      setIsRenaming(false);
      setShowColorPicker(false);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    setContextMenu(null);
  }, [selectNode]);

  const activeNode = nodes.find(n => n.id === contextMenu?.nodeId);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contextMenu && renameValue.trim()) {
      updateNode(contextMenu.nodeId, { label: renameValue.trim() });
      setContextMenu(null);
      setIsRenaming(false);
    }
  };

  const handleColorSelect = (color: string) => {
    if (contextMenu) {
      updateNode(contextMenu.nodeId, { color });
      setContextMenu(null);
      setShowColorPicker(false);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      deleteNode(contextMenu.nodeId);
      setContextMenu(null);
    }
  };

  return (
    React.createElement(ReactFlowProvider, null,
      <CanvasContent
        flowNodes={flowNodes}
        flowEdges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGrid}
        showMiniMap={showMiniMap}
        setShowMiniMap={setShowMiniMap}
        canvasCfg={canvasCfg}
      />,

      contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-50 w-52 rounded-2xl bg-[#161922]/95 border border-white/15 p-2 shadow-2xl backdrop-blur-xl text-xs space-y-1 animate-fade-up"
        >
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="p-1 space-y-2">
              <div className="text-[10px] text-white/50 font-semibold uppercase">Rename Node</div>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white focus:outline-none focus:border-blue-500 text-xs"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="px-2 py-1 rounded hover:bg-white/10 text-white/70 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[10px]"
                >
                  Save
                </button>
              </div>
            </form>
          ) : showColorPicker ? (
            <div className="p-1.5 space-y-2">
              <div className="text-[10px] text-white/50 font-semibold uppercase">Choose Node Color</div>
              <div className="grid grid-cols-5 gap-1.5">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded-full border border-white/25 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowColorPicker(false)}
                className="w-full text-center text-[10px] text-white/50 hover:text-white pt-1"
              >
                Back
              </button>
            </div>
          ) : (
            <>
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-white/40 border-b border-white/10 truncate">
                {activeNode?.label || 'Node Options'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRenaming(true);
                  setRenameValue(activeNode?.label || '');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
              >
                <Edit2 size={13} className="text-blue-400" />
                <span>Rename Label</span>
              </button>
              <button
                type="button"
                onClick={() => setShowColorPicker(true)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
              >
                <Palette size={13} className="text-emerald-400" />
                <span>Change Color</span>
              </button>

              {selectedNodeIds.length >= 2 && (
                <>
                  <div className="h-[1px] bg-white/10 my-1" />
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">
                    Group & Align ({selectedNodeIds.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      groupNodesIntoCluster(selectedNodeIds, 'Container Group');
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <Layers size={13} className="text-blue-400" />
                    <span>Group into Cluster</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alignNodes(selectedNodeIds, 'horizontal');
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <MoveHorizontal size={13} className="text-cyan-400" />
                    <span>Align Horizontally</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alignNodes(selectedNodeIds, 'vertical');
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
                  >
                    <MoveVertical size={13} className="text-cyan-400" />
                    <span>Align Vertically</span>
                  </button>
                </>
              )}

              <div className="h-[1px] bg-white/10 my-1" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Node</span>
              </button>
            </>
          )}
        </div>
      )
    )
  );
};
