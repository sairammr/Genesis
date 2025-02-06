import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type SceneModelConfig = {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

export const loadSceneModels = (scene: THREE.Scene, models: SceneModelConfig[]) => {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onError = (url) => {
    console.error('Error loading:', url);
  };

  const loader = new GLTFLoader(loadingManager);
  
  models.forEach((modelConfig) => {
    loader.load(
      modelConfig.modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.position.copy(modelConfig.position);
        model.rotation.copy(modelConfig.rotation);
        model.scale.copy(modelConfig.scale);
        
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        scene.add(model);
      },
      (xhr) => {
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading ${modelConfig.modelPath}: ${percent.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading model:', modelConfig.modelPath, {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace available'
        });
      }
    );
  });
};