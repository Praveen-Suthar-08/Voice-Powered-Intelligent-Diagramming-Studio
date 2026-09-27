import { DiagramType, DiagramNode, DiagramEdge } from '../types/diagram';

export function generateMermaid(diagramType: DiagramType, nodes: DiagramNode[], edges: DiagramEdge[]): string {
  if (nodes.length === 0) return 'graph TD\n    %% Empty diagram';

  let lines: string[] = [];

  switch (diagramType) {
    case 'mindmap':
      lines.push('mindmap');
      lines.push('  root((' + (nodes[0]?.label || 'Central Idea') + '))');
      const rootId = nodes[0]?.id;
      const children = edges.filter(e => e.source === rootId).map(e => e.target);
      nodes.filter(n => n.id !== rootId && children.includes(n.id)).forEach(n => {
        lines.push(`    ${n.label}`);
      });
      break;

    case 'sequence':
      lines.push('sequenceDiagram');
      // Infer participants
      const participants = Array.from(new Set(nodes.map(n => n.label.replace(/\s+/g, '_'))));
      participants.forEach(p => lines.push(`    participant ${p}`));
      edges.forEach(e => {
        const srcNode = nodes.find(n => n.id === e.source);
        const tgtNode = nodes.find(n => n.id === e.target);
        if (srcNode && tgtNode) {
          const s = srcNode.label.replace(/\s+/g, '_');
          const t = tgtNode.label.replace(/\s+/g, '_');
          const lbl = e.label ? `: ${e.label}` : '';
          lines.push(`    ${s}->>${t}${lbl}`);
        }
      });
      break;

    case 'erd':
      lines.push('erDiagram');
      nodes.forEach(n => {
        lines.push(`    ${n.label.replace(/\s+/g, '_')} {`);
        lines.push(`        string id PK`);
        lines.push(`        string name`);
        lines.push(`    }`);
      });
      edges.forEach(e => {
        const srcNode = nodes.find(n => n.id === e.source);
        const tgtNode = nodes.find(n => n.id === e.target);
        if (srcNode && tgtNode) {
          const s = srcNode.label.replace(/\s+/g, '_');
          const t = tgtNode.label.replace(/\s+/g, '_');
          lines.push(`    ${s} ||--o{ ${t} : "${e.label || 'relates'}"`);
        }
      });
      break;

    case 'gantt':
      lines.push('gantt');
      lines.push('    title Project Timeline');
      lines.push('    dateFormat  YYYY-MM-DD');
      lines.push('    section Phase 1');
      nodes.forEach((n, idx) => {
        lines.push(`    ${n.label} :active, task${idx+1}, 2026-10-01, 3d`);
      });
      break;

    case 'flowchart':
    case 'network':
    case 'orgchart':
    default:
      lines.push('graph TD');
      nodes.forEach(n => {
        let shapeOpen = '[';
        let shapeClose = ']';
        if (n.type === 'decision') { shapeOpen = '{'; shapeClose = '}'; }
        else if (n.type === 'start' || n.type === 'end') { shapeOpen = '('; shapeClose = ')'; }
        
        const cleanId = n.id.replace(/[^a-zA-Z0-9_]/g, '_');
        lines.push(`    ${cleanId}${shapeOpen}"${n.label}"${shapeClose}`);
      });
      edges.forEach(e => {
        const s = e.source.replace(/[^a-zA-Z0-9_]/g, '_');
        const t = e.target.replace(/[^a-zA-Z0-9_]/g, '_');
        const lbl = e.label ? `|${e.label}|` : '';
        lines.push(`    ${s} --> ${lbl} ${t}`);
      });
      break;
  }

  return lines.join('\n');
}
