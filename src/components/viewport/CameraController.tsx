import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useUIStore, CameraPreset } from '../../store/useUIStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';

const PRESET_POSITIONS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0, 1.1, 3.6], target: [0, 0.85, 0] },
  back: { pos: [0, 1.1, -3.6], target: [0, 0.85, 0] },
  left: { pos: [-3.6, 1.1, 0], target: [0, 0.85, 0] },
  right: { pos: [3.6, 1.1, 0], target: [0, 0.85, 0] },
  isometric: { pos: [2.8, 2.1, 2.8], target: [0, 0.85, 0] },
  top: { pos: [0, 4.2, 0.05], target: [0, 0.8, 0] },
};

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ controlsRef }) => {
  const { camera } = useThree();
  const cameraPreset = useUIStore((s) => s.cameraPreset);
  const currentSize = useConfiguratorStore((s) => s.config.size);
  const targetPos = useRef(new THREE.Vector3(...PRESET_POSITIONS.front.pos));
  const targetLook = useRef(new THREE.Vector3(...PRESET_POSITIONS.front.target));
  const isTransitioning = useRef(false);

  useEffect(() => {
    const config = PRESET_POSITIONS[cameraPreset] || PRESET_POSITIONS.front;
    const factor = currentSize === '8x8' ? 1.25 : 1.0;
    targetPos.current.set(config.pos[0] * factor, config.pos[1] * (currentSize === '8x8' ? 1.15 : 1.0), config.pos[2] * factor);
    targetLook.current.set(config.target[0], config.target[1] * (currentSize === '8x8' ? 1.15 : 1.0), config.target[2]);
    isTransitioning.current = true;
  }, [cameraPreset, currentSize]);

  useFrame(() => {
    if (!isTransitioning.current || !controlsRef.current) return;

    camera.position.lerp(targetPos.current, 0.08);
    controlsRef.current.target.lerp(targetLook.current, 0.08);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetPos.current) < 0.02) {
      camera.position.copy(targetPos.current);
      controlsRef.current.target.copy(targetLook.current);
      isTransitioning.current = false;
    }
  });

  return null;
};

