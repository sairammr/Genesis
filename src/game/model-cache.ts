// model-cache.ts
import * as THREE from 'three';

export const modelCache: Record<string, { 
  geometry: THREE.BufferGeometry; 
  material: THREE.Material 
}> = {};