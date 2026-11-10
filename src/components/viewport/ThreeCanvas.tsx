import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { TentModel } from './TentModel';
import { CameraController } from './CameraController';
import { useUIStore } from '../../store/useUIStore';
import { ViewportControls } from './ViewportControls';

interface ThreeCanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onCanvasReady }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const autoRotate = useUIStore((s) => s.autoRotate);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 1.1, 3.6], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          preserveDrawingBuffer: true, // Required for clean snapshot captures
        }}
        onCreated={({ gl }) => {
          if (onCanvasReady) {
            onCanvasReady(gl.domElement);
          }
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <CameraController controlsRef={controlsRef} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.3}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        >
          <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
        </directionalLight>
        <directionalLight position={[-5, 4, -5]} intensity={0.5} />
        <directionalLight position={[0, -2, 3]} intensity={0.2} />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.6} />

          <TentModel />

          {/* Realistic ground shadow */}
          <ContactShadows
            position={[0, -0.6, 0]}
            opacity={0.75}
            scale={8}
            blur={2.4}
            far={3.5}
            resolution={1024}
            color="#000000"
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 2 + 0.05} // Do not dip below ground
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          target={[0, 0.85, 0]}
        />
      </Canvas>

      {/* Floating 3D viewport controls (Presets, Auto-Rotate, Wireframe) */}
      <ViewportControls />

      {/* 3D Click Instruction badge */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Click canopy face in 3D to edit zone</span>
      </div>
    </div>
  );
};
