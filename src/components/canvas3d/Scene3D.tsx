import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useDiagramStore } from '../../store/diagramStore';
import { Compass } from 'lucide-react';

function NodeMesh({ node, isSelected, onSelect }: { node: any; isSelected: boolean; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Normalize x/y from 2D coordinates to 3D space
  const posX = ((node.x || 0) - 400) / 80;
  const posY = -((node.y || 0) - 300) / 80;
  const posZ = (node.type === 'decision' ? 2 : 0);

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  const getColor = () => {
    if (node.color) return node.color;
    switch (node.type) {
      case 'start': return '#10b981';
      case 'end': return '#ef4444';
      case 'decision': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <group position={[posX, posY, posZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.2 : hovered ? 1.1 : 1}
      >
        {node.type === 'decision' ? (
          <octahedronGeometry args={[0.8, 0]} />
        ) : node.type === 'start' || node.type === 'end' ? (
          <sphereGeometry args={[0.7, 32, 32]} />
        ) : (
          <boxGeometry args={[1.6, 0.9, 0.5]} />
        )}
        <meshStandardMaterial
          color={getColor()}
          roughness={0.3}
          metalness={0.8}
          emissive={isSelected ? '#3b82f6' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      <Html position={[0, 1.1, 0]} center distanceFactor={10} occlude>
        <div
          onClick={onSelect}
          className="liquid-glass px-2.5 py-1 rounded-lg border border-white/20 text-[10px] text-white font-medium whitespace-nowrap shadow-xl cursor-pointer hover:scale-105 transition-transform"
        >
          {node.label}
        </div>
      </Html>
    </group>
  );
}

function EdgesRenderer({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <group>
      {edges.map(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return null;

        const srcX = ((src.x || 0) - 400) / 80;
        const srcY = -((src.y || 0) - 300) / 80;
        const srcZ = src.type === 'decision' ? 2 : 0;

        const tgtX = ((tgt.x || 0) - 400) / 80;
        const tgtY = -((tgt.y || 0) - 300) / 80;
        const tgtZ = tgt.type === 'decision' ? 2 : 0;

        const midX = (srcX + tgtX) / 2;
        const midY = (srcY + tgtY) / 2 + 0.5;
        const midZ = (srcZ + tgtZ) / 2;

        return (
          <QuadraticBezierLine
            key={e.id}
            start={[srcX, srcY, srcZ]}
            end={[tgtX, tgtY, tgtZ]}
            mid={[midX, midY, midZ]}
            color="#3b82f6"
            lineWidth={2}
            transparent
            opacity={0.6}
          />
        );
      })}
    </group>
  );
}

export const Scene3D: React.FC = () => {
  const { nodes, edges, theme, previewTheme, selectedNodeId, selectNode } = useDiagramStore();
  const activeTheme = previewTheme || theme;
  const bgClass = activeTheme === 'corporate-light' ? 'bg-slate-100' : activeTheme === 'blueprint' ? 'bg-[#0b2545]' : activeTheme === 'cyberpunk' ? 'bg-[#120826]' : activeTheme === 'neon-glow' ? 'bg-[#050508]' : 'bg-[#0a0a0c]';
  const [flyTrigger, setFlyTrigger] = useState(false);

  return (
    <div className={`flex-1 w-full h-full relative ${bgClass} transition-colors duration-300`}>
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <EdgesRenderer nodes={nodes} edges={edges} />

        {nodes.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={() => selectNode(node.id)}
          />
        ))}

        <OrbitControls makeDefault enableRotate enableZoom enablePan />
      </Canvas>

      {/* Fly-through button */}
      <button
        onClick={() => setFlyTrigger(!flyTrigger)}
        className="absolute bottom-6 left-6 liquid-glass px-4 py-2.5 rounded-xl text-xs text-white flex items-center gap-2 border border-white/10 shadow-2xl hover:bg-white/10 transition-transform hover:scale-105 active:scale-95 z-20"
      >
        <Compass size={16} className="text-blue-400" />
        <span>Camera Orbit Mode</span>
      </button>
    </div>
  );
};
