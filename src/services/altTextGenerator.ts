import { DiagramNode, DiagramEdge, DiagramType } from '../types/diagram';

export function generateDiagramAltText(diagramType: DiagramType, projectName: string, nodes: DiagramNode[], edges: DiagramEdge[]): {
  shortAlt: string;
  detailedSummary: string;
  ariaDescription: string;
} {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const typeLabel = diagramType.toUpperCase();

  const shortAlt = `${typeLabel} diagram titled "${projectName}" containing ${nodeCount} nodes and ${edgeCount} connections.`;

  const nodeDescriptions = nodes.map(n => `- ${n.label} (${n.type}): ${n.description || 'No description provided.'}`).join('\n');
  const edgeDescriptions = edges.map(e => {
    const srcNode = nodes.find(n => n.id === e.source)?.label || e.source;
    const tgtNode = nodes.find(n => n.id === e.target)?.label || e.target;
    return `- ${srcNode} connects to ${tgtNode}${e.label ? ` via "${e.label}"` : ''}`;
  }).join('\n');

  const detailedSummary = `Diagram Type: ${typeLabel}
Project: ${projectName}

Nodes (${nodeCount}):
${nodeDescriptions || 'No nodes.'}

Connections (${edgeCount}):
${edgeDescriptions || 'No connections.'}`;

  const ariaDescription = `This is a ${typeLabel} diagram named ${projectName} with ${nodeCount} entities and ${edgeCount} relationships. Key components include ${nodes.slice(0, 5).map(n => n.label).join(', ')}.`;

  return {
    shortAlt,
    detailedSummary,
    ariaDescription,
  };
}
