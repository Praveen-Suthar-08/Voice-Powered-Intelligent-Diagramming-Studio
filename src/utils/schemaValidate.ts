import { DiagramState } from '../types/diagram';

export function validateDiagramResponse(data: any): DiagramState | { clarify: string } | null {
  if (!data || typeof data !== 'object') return null;

  if ('clarify' in data && typeof data.clarify === 'string') {
    return { clarify: data.clarify };
  }

  if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
    const nodes = data.nodes.map((n: any, idx: number) => ({
      id: String(n.id || `node_${idx}`),
      label: String(n.label || `Node ${idx}`),
      type: ['start', 'process', 'decision', 'end', 'default'].includes(n.type) ? n.type : 'default',
      description: n.description ? String(n.description) : undefined,
      x: typeof n.x === 'number' ? n.x : undefined,
      y: typeof n.y === 'number' ? n.y : undefined,
    }));

    let edges = Array.isArray(data.edges)
      ? data.edges.map((e: any, idx: number) => ({
          id: String(e.id || `edge_${idx}`),
          source: String(e.source || ''),
          target: String(e.target || ''),
          label: e.label ? String(e.label) : undefined,
        })).filter((e: any) => e.source && e.target)
      : [];

    if (edges.length === 0 && nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `auto_edge_${i}`,
          source: nodes[i].id,
          target: nodes[i + 1].id,
          label: 'Flow',
        });
      }
    }

    const diagramType = ['flowchart', 'mindmap', 'sequence', 'erd', 'orgchart', 'network', 'gantt'].includes(data.diagramType)
      ? data.diagramType
      : 'flowchart';

    return {
      diagramType,
      nodes,
      edges,
    };
  }

  return null;
}
