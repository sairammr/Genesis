import * as THREE from 'three';

type SceneObjectConfig = {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  instanceCount?: number;
};

type SceneConfig = {
 
  objects: SceneObjectConfig[];
  pathParameters?: {
    clearWidth: number;
    direction: string;
    entryPoint: number[];
    exitPoint: number[];
  };
};

export const sceneConfig : SceneConfig[] = [
    {
      objects: [
        
       
       

        {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/stone_fire_pit.glb',
          position: new THREE.Vector3(-10, 0, -10),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        }
      ]
    }
  ];