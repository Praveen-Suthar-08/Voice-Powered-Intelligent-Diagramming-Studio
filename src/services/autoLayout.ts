import dagre from 'dagre';
import { DiagramNode, DiagramEdge } from '../types/diagram';

export function getAutoLayoutedNodes(nodes: DiagramNode[], edges: DiagramEdge[], direction: 'TB' | 'LR' = 'TB'): DiagramNode[] {
  if (!nodes || nodes.length === 0) return nodes;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 90 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;
    const width = 220;
    const height = 90;
    return {
      ...node,
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });
}
