import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { TENT_SIZES, FRAME_FINISHES } from '../../types/config';
import { globalTextureCompositor } from '../../engine/TextureCompositor';
import { resolveUVToSection } from '../../engine/uvZones';

export const TentModel: React.FC = () => {
  const currentSize = useConfiguratorStore((s) => s.config.size);
  const frameFinish = useConfiguratorStore((s) => s.config.frameFinish);
  const wireframeMode = useUIStore((s) => s.wireframeMode);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const showToast = useUIStore((s) => s.showToast);

  const sizeDef = TENT_SIZES.find((s) => s.id === currentSize) || TENT_SIZES[0];
  const finishDef = FRAME_FINISHES.find((f) => f.id === frameFinish) || FRAME_FINISHES[0];

  const gltf = useGLTF(sizeDef.modelPath);
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene so materials can be uniquely modified per instance
  const clonedScene = useMemo(() => {
    return gltf.scene.clone(true);
  }, [gltf.scene]);

  // Apply materials and texture bindings
  useEffect(() => {
    if (!clonedScene) return;

    const dynamicTexture = globalTextureCompositor.getTexture();

    clonedScene.traverse((node: THREE.Object3D) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const processMaterial = (mat: THREE.Material) => {
          if (mat.name === 'fabric_Mat') {
            const stdMat = mat as THREE.MeshStandardMaterial;
            stdMat.color.set('#ffffff'); // Pure white base so dynamic canvas texture colors are rendered unskewed
            stdMat.map = dynamicTexture;
            stdMat.wireframe = wireframeMode;
            stdMat.roughness = 0.65;
            stdMat.metalness = 0.05;
            stdMat.needsUpdate = true;
          } else if (mat.name === 'Metal_mat') {
            const stdMat = mat as THREE.MeshStandardMaterial;
            stdMat.wireframe = wireframeMode;
            stdMat.color.set(finishDef.hex);
            stdMat.roughness = finishDef.roughness;
            stdMat.metalness = finishDef.metalness;
            stdMat.needsUpdate = true;
          } else if (mat.name === 'Inner_fabric') {
            const stdMat = mat as THREE.MeshStandardMaterial;
            stdMat.wireframe = wireframeMode;
            stdMat.color.set('#262626');
            stdMat.roughness = 0.8;
            stdMat.metalness = 0.0;
            stdMat.needsUpdate = true;
          }
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(processMaterial);
        } else if (mesh.material) {
          processMaterial(mesh.material);
        }
      }
    });

    dynamicTexture.needsUpdate = true;
  }, [clonedScene, finishDef, wireframeMode]);

  // When tent size changes, trigger compositor update to ensure immediate binding to the new model
  useEffect(() => {
    const config = useConfiguratorStore.getState().config;
    globalTextureCompositor.scheduleRender(config);
  }, [currentSize]);

  // Raycasting click on canopy fabric to select active section in 2D editor
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.uv) {
      const hitSection = resolveUVToSection(e.uv.x, e.uv.y);
      if (hitSection) {
        e.stopPropagation();
        setActiveSection(hitSection);
        const sectionLabel = hitSection.replace('_', ' ').toUpperCase();
        showToast(`Selected section: ${sectionLabel}`);
      }
    }
  };

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      <primitive object={clonedScene} onPointerDown={handlePointerDown} />
    </group>
  );
};

// Preload all 3 GLB models in background for smooth switching
TENT_SIZES.forEach((s) => {
  useGLTF.preload(s.modelPath);
});
