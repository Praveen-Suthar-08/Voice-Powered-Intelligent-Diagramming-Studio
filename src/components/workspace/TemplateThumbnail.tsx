import React from 'react';
import { DiagramType } from '../../types/diagram';
import { generateTemplateForType } from '../../store/diagramStore';

interface TemplateThumbnailProps {
  type: DiagramType;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ type }) => {
  const template = generateTemplateForType(type);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  template.nodes.forEach(n => {
    const nx = n.x ?? 0;
    const ny = n.y ?? 0;
    minX = Math.min(minX, nx);
    maxX = Math.max(maxX, nx + 120);
    minY = Math.min(minY, ny);
    maxY = Math.max(maxY, ny + 60);
  });

  const width = Math.max(maxX - minX, 200);
  const height = Math.max(maxY - minY, 150);

  return (
    <div className="w-56 h-36 rounded-2xl bg-[#0b0d13]/95 border border-white/25 p-3 shadow-2xl backdrop-blur-xl overflow-hidden pointer-events-none flex flex-col items-center justify-center relative">
      <div className="absolute top-2 left-3 text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        {type} preview
      </div>
      <svg viewBox={`${minX - 30} ${minY - 30} ${width + 60} ${height + 60}`} className="w-full h-full mt-2">
        {/* Render edges */}
        {template.edges.map(e => {
          const sourceNode = template.nodes.find(n => n.id === e.source);
          const targetNode = template.nodes.find(n => n.id === e.target);
          if (!sourceNode || !targetNode) return null;
          const sx = (sourceNode.x ?? 0) + 50;
          const sy = (sourceNode.y ?? 0) + 25;
          const tx = (targetNode.x ?? 0) + 50;
          const ty = (targetNode.y ?? 0) + 25;
          return (
            <line
              key={e.id}
              x1={sx}
              y1={sy}
              x2={tx}
              y2={ty}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          );
        })}
        {/* Render nodes */}
        {template.nodes.map(n => {
          const nx = n.x ?? 0;
          const ny = n.y ?? 0;
          return (
            <g key={n.id} transform={`translate(${nx}, ${ny})`}>
              <rect
                width="100"
                height="45"
                rx="10"
                fill={n.color || '#3b82f6'}
                fillOpacity="0.8"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <text
                x="50"
                y="27"
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                className="select-none font-sans"
              >
                {n.label.length > 13 ? n.label.substring(0, 11) + '..' : n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
