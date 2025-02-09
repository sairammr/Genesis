// model-loader.ts
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { modelCache } from './model-cache'; // Import shared cache

type SceneModelConfig = {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  instanceCount?: number;
};

export const preloadModels = async (
  models: SceneModelConfig[], 
  basePath: string = 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/'
) => {
  const loadingManager = new THREE.LoadingManager(
    () => console.log('All models preloaded'),
    (url, itemsLoaded, itemsTotal) => {
      console.log(`Preload progress: ${itemsLoaded}/${itemsTotal} models`);
    },
    (url) => console.error(`Error preloading model: ${url}`)
  );

  const dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  const modelPromises = models.map(async (modelConfig) => {
    // Ensure basePath ends with a slash and modelPath doesn't start with one
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const normalizedPath = modelConfig.modelPath.startsWith('/') 
      ? modelConfig.modelPath.slice(1) 
      : modelConfig.modelPath;
    
    const modelUrl = `${normalizedBase}${normalizedPath}`;

    if (modelCache[modelUrl]) return;

    try {
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        gltfLoader.load(modelUrl, resolve, undefined, reject);
      });
      
      gltf.scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          modelCache[modelUrl] = {
            geometry: node.geometry,
            material: node.material
          };
        }
      });
    } catch (error) {
      console.error(`Failed to preload ${modelConfig.modelPath}:`, error);
      throw error;
    }
  });

  await Promise.all(modelPromises);
};

export const addModelsToScene = (
  scene: THREE.Scene, 
  models: SceneModelConfig[],
  basePath: string = 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/'
) => {
  models.forEach((modelConfig) => {
    // Reconstruct the URL exactly as in preloadModels
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const normalizedPath = modelConfig.modelPath.startsWith('/') 
      ? modelConfig.modelPath.slice(1) 
      : modelConfig.modelPath;
    
    const modelUrl = `${normalizedBase}${normalizedPath}`;

    const cached = modelCache[modelUrl];
    if (!cached) {
      console.error(`Model ${modelUrl} not found in cache`);
      return;
    }

    const { geometry, material } = cached;
    if (modelConfig.instanceCount && modelConfig.instanceCount > 1) {
      const instancedMesh = new THREE.InstancedMesh(geometry, material, modelConfig.instanceCount);
      const matrix = new THREE.Matrix4();
      for (let i = 0; i < modelConfig.instanceCount; i++) {
        const position = new THREE.Vector3(modelConfig.position.x, modelConfig.position.y, modelConfig.position.z).add(new THREE.Vector3(i * 5, 0, 0));
        // Adjust rotation to make the model stand upright
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)); // No rotation around Y-axis
        matrix.compose(position, rotation, modelConfig.scale);
        instancedMesh.setMatrixAt(i, matrix);
      }
      scene.add(instancedMesh);
    } else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(modelConfig.position);
      // Adjust rotation to make the model stand upright
      mesh.rotation.set(0, 0, 0); // No rotation around Y-axis
      mesh.scale.copy(modelConfig.scale);
      scene.add(mesh);
    }
  });
};