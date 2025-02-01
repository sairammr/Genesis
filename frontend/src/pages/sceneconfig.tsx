// sceneConfig.ts
import * as THREE from 'three';

export interface ModelPosition {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export const PLANE_SIZE = 100; // Size of the plane (100 x 100 units)

export const sceneModels: ModelPosition[] = [
  {
    modelPath: '/structure.glb',
    position: new THREE.Vector3(10, 0, 10),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  {
    modelPath: '/cannon.gltf',
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, Math.PI / 4, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  // Add more models as needed
];