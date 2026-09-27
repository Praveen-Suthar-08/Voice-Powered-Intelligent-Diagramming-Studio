import dagre from 'dagre';
import { DiagramNode, DiagramEdge } from '../types/diagram';

export function computeLayout(nodes: DiagramNode[], edges: DiagramEdge[], direction: 'TB' | 'LR' = 'TB'): DiagramNode[] {
  if (nodes.length === 0) return nodes;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

  const nodeWidth = 180;
  const nodeHeight = 70;

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      x: nodeWithPosition ? nodeWithPosition.x - nodeWidth / 2 : (node.x || 100),
      y: nodeWithPosition ? nodeWithPosition.y - nodeHeight / 2 : (node.y || 100),
    };
  });
}
