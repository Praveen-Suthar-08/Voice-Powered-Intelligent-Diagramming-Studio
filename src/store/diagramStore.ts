import { create } from 'zustand';
import { DiagramNode, DiagramEdge, DiagramCluster, DiagramType, DiagramState, TranscriptLogItem, DiagramTheme } from '../types/diagram';
import { getAutoLayoutedNodes } from '../services/autoLayout';

interface HistoryState {
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  clusters: DiagramCluster[];
}

interface DiagramStoreState {
  projectName: string;
  projectId: string;
  diagramType: DiagramType;
  theme: DiagramTheme;
  previewTheme: DiagramTheme | null;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  clusters: DiagramCluster[];
  selectedNodeId: string | null;
  history: HistoryState[];
  historyIndex: number;
  transcriptLog: TranscriptLogItem[];
  overlapDetected: boolean;

  setProjectName: (name: string) => void;
  setProjectId: (id: string) => void;
  setDiagramType: (type: DiagramType) => void;
  setTheme: (theme: DiagramTheme) => void;
  setPreviewTheme: (theme: DiagramTheme | null) => void;
  selectNode: (id: string | null) => void;
  dismissOverlapSuggestion: () => void;
  
  mergeFromAI: (newState: DiagramState, nodeIds?: string[]) => void;
  addNode: (node: DiagramNode) => void;
  updateNode: (id: string, patch: Partial<DiagramNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: DiagramEdge) => void;
  deleteEdge: (id: string) => void;
  
  addCluster: (cluster: DiagramCluster) => void;
  updateCluster: (id: string, patch: Partial<DiagramCluster>) => void;
  deleteCluster: (id: string) => void;
  toggleClusterCollapse: (id: string) => void;
  groupNodesIntoCluster: (nodeIds: string[], title: string) => void;

  autoArrange: () => void;
  alignNodes: (nodeIds: string[], direction: 'horizontal' | 'vertical') => void;
  
  undo: () => void;
  redo: () => void;
  reset: () => void;
  loadProjectData: (project: { id: string; name: string; diagramType: DiagramType; nodes: DiagramNode[]; edges: DiagramEdge[]; clusters?: DiagramCluster[]; transcriptLog?: TranscriptLogItem[]; theme?: DiagramTheme }) => void;
}

const pushHistory = (state: { nodes: DiagramNode[]; edges: DiagramEdge[]; clusters: DiagramCluster[]; diagramType: DiagramType; history: HistoryState[]; historyIndex: number }) => {
  const current: HistoryState = {
    diagramType: state.diagramType,
    nodes: JSON.parse(JSON.stringify(state.nodes)),
    edges: JSON.parse(JSON.stringify(state.edges)),
    clusters: JSON.parse(JSON.stringify(state.clusters || [])),
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  return {
    history: [...newHistory, current],
    historyIndex: newHistory.length,
  };
};

export function generateTemplateForType(type: DiagramType): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  switch (type) {
    case 'mindmap':
      return {
        nodes: [
          { id: 'm1', label: 'Core Product Strategy', type: 'start', description: 'Central vision & goals', x: 450, y: 250, color: '#3b82f6' },
          { id: 'm2', label: 'User Research', type: 'process', description: 'Surveys & Interviews', x: 200, y: 120, color: '#10b981' },
          { id: 'm3', label: 'Feature Roadmap', type: 'process', description: 'Q1 - Q4 Milestones', x: 700, y: 120, color: '#f59e0b' },
          { id: 'm4', label: 'Monetization', type: 'process', description: 'Pricing & tiers', x: 200, y: 380, color: '#8b5cf6' },
          { id: 'm5', label: 'Marketing & Growth', type: 'process', description: 'SEO & Campaigns', x: 700, y: 380, color: '#ec4899' },
        ],
        edges: [
          { id: 'me1', source: 'm1', target: 'm2', label: 'Informs' },
          { id: 'me2', source: 'm1', target: 'm3', label: 'Plans' },
          { id: 'me3', source: 'm1', target: 'm4', label: 'Defines' },
          { id: 'me4', source: 'm1', target: 'm5', label: 'Drives' },
        ],
      };
    case 'sequence':
      return {
        nodes: [
          { id: 's1', label: 'Client / UI', type: 'start', description: 'Frontend React App', x: 100, y: 200, color: '#3b82f6' },
          { id: 's2', label: 'API Gateway', type: 'process', description: 'Express / Router', x: 380, y: 200, color: '#10b981' },
          { id: 's3', label: 'Microservice', type: 'process', description: 'Business Logic', x: 660, y: 200, color: '#f59e0b' },
          { id: 's4', label: 'Database / SQL', type: 'end', description: 'PostgreSQL Store', x: 940, y: 200, color: '#8b5cf6' },
        ],
        edges: [
          { id: 'se1', source: 's1', target: 's2', label: 'HTTP POST /api' },
          { id: 'se2', source: 's2', target: 's3', label: 'Forward RPC' },
          { id: 'se3', source: 's3', target: 's4', label: 'SQL Query' },
        ],
      };
    case 'erd':
      return {
        nodes: [
          { id: 'e1', label: 'User Table', type: 'start', description: 'id, email, password_hash', x: 150, y: 200, color: '#3b82f6' },
          { id: 'e2', label: 'Project Table', type: 'process', description: 'id, user_id, name, data', x: 500, y: 200, color: '#10b981' },
          { id: 'e3', label: 'Snapshot Table', type: 'end', description: 'id, project_id, snapshot_url', x: 850, y: 200, color: '#ec4899' },
        ],
        edges: [
          { id: 'ee1', source: 'e1', target: 'e2', label: '1 : N' },
          { id: 'ee2', source: 'e2', target: 'e3', label: '1 : N' },
        ],
      };
    case 'orgchart':
      return {
        nodes: [
          { id: 'o1', label: 'CEO & Founder', type: 'start', description: 'Executive Leadership', x: 500, y: 100, color: '#3b82f6' },
          { id: 'o2', label: 'VP Engineering', type: 'process', description: 'Tech & Infrastructure', x: 250, y: 280, color: '#10b981' },
          { id: 'o3', label: 'VP Product', type: 'process', description: 'Design & Roadmap', x: 750, y: 280, color: '#f59e0b' },
          { id: 'o4', label: 'Senior Dev Lead', type: 'end', description: 'Core Architecture', x: 250, y: 460, color: '#8b5cf6' },
        ],
        edges: [
          { id: 'oe1', source: 'o1', target: 'o2', label: 'Manages' },
          { id: 'oe2', source: 'o1', target: 'o3', label: 'Manages' },
          { id: 'oe3', source: 'o2', target: 'o4', label: 'Leads' },
        ],
      };
    case 'network':
      return {
        nodes: [
          { id: 'n1', label: 'Cloud CDN / Edge', type: 'start', description: 'Global Distribution', x: 150, y: 250, color: '#3b82f6' },
          { id: 'n2', label: 'Load Balancer', type: 'process', description: 'Nginx / Envoy Proxy', x: 450, y: 250, color: '#10b981' },
          { id: 'n3', label: 'Kubernetes Cluster', type: 'process', description: 'App Pods & Services', x: 750, y: 150, color: '#f59e0b' },
          { id: 'n4', label: 'Cloud SQL / DB', type: 'end', description: 'Primary PostgreSQL', x: 750, y: 350, color: '#ec4899' },
        ],
        edges: [
          { id: 'ne1', source: 'n1', target: 'n2', label: 'Route' },
          { id: 'ne2', source: 'n2', target: 'n3', label: 'Proxy' },
          { id: 'ne3', source: 'n2', target: 'n4', label: 'Query' },
        ],
      };
    case 'gantt':
      return {
        nodes: [
          { id: 'g1', label: 'Phase 1: Discovery', type: 'start', description: 'Requirements & Design', x: 150, y: 250, color: '#3b82f6' },
          { id: 'g2', label: 'Phase 2: Development', type: 'process', description: 'Coding & Integration', x: 500, y: 250, color: '#10b981' },
          { id: 'g3', label: 'Phase 3: QA & Launch', type: 'end', description: 'Testing & Deployment', x: 850, y: 250, color: '#ec4899' },
        ],
        edges: [
          { id: 'ge1', source: 'g1', target: 'g2', label: 'Followed by' },
          { id: 'ge2', source: 'g2', target: 'g3', label: 'Followed by' },
        ],
      };
    case 'flowchart':
    default:
      return {
        nodes: [
          { id: 'n1', label: 'User Opens App', type: 'start', description: 'Landing page or login screen', x: 100, y: 200, color: '#3b82f6' },
          { id: 'n2', label: 'Enter Credentials', type: 'process', description: 'User inputs email and password', x: 350, y: 200, color: '#10b981' },
          { id: 'n3', label: 'Valid Credentials?', type: 'decision', description: 'Check against database', x: 600, y: 200, color: '#f59e0b' },
          { id: 'n4', label: 'Dashboard Load', type: 'end', description: 'Welcome user to main workspace', x: 850, y: 200, color: '#8b5cf6' },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2', label: 'Navigates' },
          { id: 'e2', source: 'n2', target: 'n3', label: 'Submits' },
          { id: 'e3', source: 'n3', target: 'n4', label: 'Yes' },
        ],
      };
  }
}

export const useDiagramStore = create<DiagramStoreState>((set, get) => ({
  projectName: 'My Architecture Diagram',
  projectId: 'proj_' + Math.random().toString(36).substring(2, 9),
  diagramType: 'flowchart',
  theme: 'minimalist-dark',
  previewTheme: null,
  nodes: [],
  edges: [],
  clusters: [],
  selectedNodeId: null,
  history: [],
  historyIndex: -1,
  transcriptLog: [],
  overlapDetected: false,

  setProjectName: (projectName) => set({ projectName }),
  setProjectId: (projectId) => set({ projectId }),
  setTheme: (theme) => set({ theme }),
  setPreviewTheme: (previewTheme) => set({ previewTheme }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  dismissOverlapSuggestion: () => set({ overlapDetected: false }),
  
  setDiagramType: (diagramType) => {
    const state = get();
    const hist = pushHistory(state);
    const template = generateTemplateForType(diagramType);
    set({
      diagramType,
      nodes: template.nodes,
      edges: template.edges,
      clusters: [],
      ...hist,
    });
  },

  mergeFromAI: (newState, _nodeIds) => {
    const state = get();
    const hist = pushHistory(state);
    
    const nodeMap = new Map<string, DiagramNode>();
    state.nodes.forEach(n => nodeMap.set(n.id, n));
    
    let newIdx = state.nodes.length;
    if (newState.nodes) {
      newState.nodes.forEach(n => {
        if (nodeMap.has(n.id)) {
          const existing = nodeMap.get(n.id)!;
          nodeMap.set(n.id, {
            ...existing,
            ...n,
            x: n.x !== undefined ? n.x : existing.x,
            y: n.y !== undefined ? n.y : existing.y,
          });
        } else {
          nodeMap.set(n.id, {
            ...n,
            x: n.x !== undefined ? n.x : (200 + (newIdx % 3) * 250),
            y: n.y !== undefined ? n.y : (200 + Math.floor(newIdx / 3) * 180),
          });
          newIdx++;
        }
      });
    }

    const mergedNodes = Array.from(nodeMap.values());
    const edgeMap = new Map<string, DiagramEdge>();
    state.edges.forEach(e => edgeMap.set(e.id, e));
    if (newState.edges) {
      newState.edges.forEach(e => {
        edgeMap.set(e.id, e);
      });
    }
    const mergedEdges = Array.from(edgeMap.values());

    let hasOverlap = false;
    for (let i = 0; i < mergedNodes.length; i++) {
      for (let j = i + 1; j < mergedNodes.length; j++) {
        const xi = mergedNodes[i].x ?? 0;
        const yi = mergedNodes[i].y ?? 0;
        const xj = mergedNodes[j].x ?? 0;
        const yj = mergedNodes[j].y ?? 0;
        const dx = xi - xj;
        const dy = yi - yj;
        if (Math.sqrt(dx * dx + dy * dy) < 110) {
          hasOverlap = true;
          break;
        }
      }
      if (hasOverlap) break;
    }

    set({
      diagramType: newState.diagramType || state.diagramType,
      nodes: mergedNodes,
      edges: mergedEdges,
      overlapDetected: hasOverlap,
      ...hist,
    });
  },

  addNode: (node) => {
    const state = get();
    const hist = pushHistory(state);
    const newNode = {
      ...node,
      x: node.x !== undefined ? node.x : Math.random() * 300 + 100,
      y: node.y !== undefined ? node.y : Math.random() * 300 + 100,
    };
    set({
      nodes: [...state.nodes, newNode],
      ...hist,
    });
  },

  updateNode: (id, patch) => {
    const state = get();
    const hist = pushHistory(state);
    set({
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
      ...hist,
    });
  },

  deleteNode: (id) => {
    const state = get();
    const hist = pushHistory(state);
    set({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id),
      clusters: (state.clusters || []).map(c => ({
        ...c,
        nodeIds: c.nodeIds.filter(nid => nid !== id),
      })),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      ...hist,
    });
  },

  addEdge: (edge) => {
    const state = get();
    const hist = pushHistory(state);
    set({
      edges: [...state.edges, edge],
      ...hist,
    });
  },

  deleteEdge: (id) => {
    const state = get();
    const hist = pushHistory(state);
    set({
      edges: state.edges.filter(e => e.id !== id),
      ...hist,
    });
  },

  addCluster: (cluster) => {
    const state = get();
    const hist = pushHistory(state);
    set({
      clusters: [...(state.clusters || []), cluster],
      ...hist,
    });
  },

  updateCluster: (id, patch) => {
    const state = get();
    const hist = pushHistory(state);
    const updated = (state.clusters || []).map(c => c.id === id ? { ...c, ...patch } : c);
    set({
      clusters: updated,
      ...hist,
    });
  },

  deleteCluster: (id) => {
    const state = get();
    const hist = pushHistory(state);
    const filtered = (state.clusters || []).filter(c => c.id !== id);
    set({
      clusters: filtered,
      ...hist,
    });
  },

  toggleClusterCollapse: (id) => {
    const state = get();
    const hist = pushHistory(state);
    const updated = (state.clusters || []).map(c => {
      if (c.id === id) {
        return { ...c, isCollapsed: !c.isCollapsed };
      }
      return c;
    });
    set({
      clusters: updated,
      ...hist,
    });
  },

  groupNodesIntoCluster: (nodeIds, title) => {
    const state = get();
    const hist = pushHistory(state);
    const targetNodes = state.nodes.filter(n => nodeIds.includes(n.id));
    if (targetNodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targetNodes.forEach(n => {
      const nx = n.x ?? 0;
      const ny = n.y ?? 0;
      minX = Math.min(minX, nx);
      minY = Math.min(minY, ny);
      maxX = Math.max(maxX, nx + 120);
      maxY = Math.max(maxY, ny + 60);
    });

    const newCluster: DiagramCluster = {
      id: 'cluster_' + Math.random().toString(36).substring(2, 9),
      title: title || 'Container Cluster',
      x: minX - 30,
      y: minY - 50,
      width: Math.max(maxX - minX + 60, 240),
      height: Math.max(maxY - minY + 80, 180),
      nodeIds,
      isCollapsed: false,
      color: '#3b82f6',
    };

    set({
      clusters: [...(state.clusters || []), newCluster],
      ...hist,
    });
  },

  undo: () => {
    const { history, historyIndex, nodes, edges, clusters, diagramType } = get();
    if (historyIndex >= 0 && history[historyIndex]) {
      let updatedHistory = [...history];
      if (historyIndex === history.length - 1) {
        updatedHistory.push({
          diagramType,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          clusters: JSON.parse(JSON.stringify(clusters || [])),
        });
      }
      const target = updatedHistory[historyIndex];
      set({
        diagramType: target.diagramType,
        nodes: target.nodes,
        edges: target.edges,
        clusters: target.clusters || [],
        history: updatedHistory,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex + 1 < history.length) {
      const nextIndex = historyIndex + 1;
      const target = history[nextIndex];
      set({
        diagramType: target.diagramType,
        nodes: target.nodes,
        edges: target.edges,
        clusters: target.clusters || [],
        historyIndex: nextIndex,
      });
    }
  },

  reset: () => {
    const state = get();
    const hist = pushHistory(state);
    set({
      nodes: [],
      edges: [],
      clusters: [],
      selectedNodeId: null,
      ...hist,
    });
  },

  autoArrange: () => {
    const state = get();
    const hist = pushHistory(state);
    const layouted = getAutoLayoutedNodes(state.nodes, state.edges);
    set({
      nodes: layouted,
      overlapDetected: false,
      ...hist,
    });
  },

  alignNodes: (nodeIds, direction) => {
    const state = get();
    const hist = pushHistory(state);
    if (!nodeIds || nodeIds.length < 2) return;
    const selected = state.nodes.filter(n => nodeIds.includes(n.id));
    if (selected.length < 2) return;

    if (direction === 'horizontal') {
      const targetY = selected[0].y ?? 100;
      const updatedNodes = state.nodes.map(n => {
        if (nodeIds.includes(n.id)) {
          return { ...n, y: targetY };
        }
        return n;
      });
      set({ nodes: updatedNodes, ...hist });
    } else {
      const targetX = selected[0].x ?? 100;
      const updatedNodes = state.nodes.map(n => {
        if (nodeIds.includes(n.id)) {
          return { ...n, x: targetX };
        }
        return n;
      });
      set({ nodes: updatedNodes, ...hist });
    }
  },

  loadProjectData: (project) => {
    set({
      projectId: project.id,
      projectName: project.name,
      diagramType: project.diagramType,
      theme: project.theme || 'minimalist-dark',
      nodes: project.nodes || [],
      edges: project.edges || [],
      clusters: project.clusters || [],
      transcriptLog: project.transcriptLog || [],
      selectedNodeId: null,
      history: [],
      historyIndex: -1,
      overlapDetected: false,
    });
  },
}));
