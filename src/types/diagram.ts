export type DiagramType = 'flowchart' | 'mindmap' | 'sequence' | 'erd' | 'orgchart' | 'network' | 'gantt';

export type DiagramTheme = 'minimalist-dark' | 'corporate-light' | 'blueprint' | 'cyberpunk' | 'neon-glow';

export type NodeType = 'start' | 'process' | 'decision' | 'end' | 'default';

export interface DiagramNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface DiagramCluster {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
  isCollapsed?: boolean;
  color?: string;
}

export interface DiagramState {
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  clusters?: DiagramCluster[];
}

export interface TranscriptLogItem {
  id: string;
  text: string;
  timestamp: string;
  nodeIds?: string[];
}

export interface ProjectRecord {
  id: string;
  name: string;
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  clusters?: DiagramCluster[];
  transcriptLog: TranscriptLogItem[];
  createdAt: number;
  updatedAt: number;
}
