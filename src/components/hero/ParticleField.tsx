import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud({ amplitude }: { amplitude: number }) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random points in a sphere
  const count = 3000;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4 + Math.random() * 6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.05;
      ref.current.rotation.y -= delta * 0.075;
      const scaleFactor = 1 + amplitude * 1.5;
      ref.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export const ParticleField: React.FC<{ amplitude: number }> = ({ amplitude }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#0a0a0c]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ParticleCloud amplitude={amplitude} />
        <OrbitControls autoRotate autoRotateSpeed={0.3} enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};
