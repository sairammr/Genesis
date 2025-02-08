import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

type SceneModelConfig = {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  instanceCount?: number; // Optional: Number of instances (default is 1 for unique models)
};

export const loadSceneModels = async (
  scene: THREE.Scene,
  models: SceneModelConfig[],
  basePath: string = ''
) => {
  const loadingManager = new THREE.LoadingManager(
    () => console.log('All resources loaded'),
    (url, itemsLoaded, itemsTotal) => {
      console.log(`Overall progress: ${itemsLoaded}/${itemsTotal} files loaded`);
    },
    (url) => console.error(`Error loading resource: ${url}`)
  );

  // Initialize Draco loader with CDN path
  const dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  // Track loaded models to reuse them for instancing
  const modelCache: Record<string, { geometry: THREE.BufferGeometry; material: THREE.Material }> = {};

  const modelPromises = models.map(async (modelConfig) => {
    const modelUrl = `${modelConfig.modelPath}`;

    try {
      // Check if the model is already loaded
      if (modelCache[modelUrl]) {
        const { geometry, material } = modelCache[modelUrl];

        // Create an InstancedMesh if instanceCount > 1
        if (modelConfig.instanceCount && modelConfig.instanceCount > 1) {
          const instancedMesh = new THREE.InstancedMesh(geometry, material, modelConfig.instanceCount);

          const matrix = new THREE.Matrix4();
          for (let i = 0; i < modelConfig.instanceCount; i++) {
            const position = modelConfig.position.clone().add(new THREE.Vector3(i * 5, 0, 0)); // Example: Spacing instances along the x-axis
            const rotation = modelConfig.rotation.clone();
            const scale = modelConfig.scale.clone();

            matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
            instancedMesh.setMatrixAt(i, matrix);
          }

          scene.add(instancedMesh);
          return instancedMesh;
        } else {
          // Single instance
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(modelConfig.position);
          mesh.rotation.copy(modelConfig.rotation);
          mesh.scale.copy(modelConfig.scale);

          scene.add(mesh);
          return mesh;
        }
      } else {
        // Load the model for the first time
        const gltf = await new Promise<GLTF>((resolve, reject) => {
          gltfLoader.load(
            modelUrl,
            resolve,
            (xhr) => {
              const percent = (xhr.loaded / xhr.total) * 100;
              console.log(`${modelConfig.modelPath}: ${percent.toFixed(1)}%`);
            },
            reject
          );
        });

        const model = gltf.scene;

        // Extract geometry and material from the model
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const geometry = node.geometry;
            const material = node.material;

            // Cache the geometry and material for reuse
            modelCache[modelUrl] = { geometry, material };

            // Create an InstancedMesh if instanceCount > 1
            if (modelConfig.instanceCount && modelConfig.instanceCount > 1) {
              const instancedMesh = new THREE.InstancedMesh(geometry, material, modelConfig.instanceCount);

              const matrix = new THREE.Matrix4();
              for (let i = 0; i < modelConfig.instanceCount; i++) {
                const position = modelConfig.position.clone().add(new THREE.Vector3(i * 5, 0, 0)); // Example: Spacing instances along the x-axis
                const rotation = modelConfig.rotation.clone();
                const scale = modelConfig.scale.clone();

                matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
                instancedMesh.setMatrixAt(i, matrix);
              }

              scene.add(instancedMesh);
              return instancedMesh;
            } else {
              // Single instance
              const mesh = new THREE.Mesh(geometry, material);
              mesh.position.copy(modelConfig.position);
              mesh.rotation.copy(modelConfig.rotation);
              mesh.scale.copy(modelConfig.scale);

              scene.add(mesh);
              return mesh;
            }
          }
        });

        return model;
      }
    } catch (error) {
      console.error(`Failed to load ${modelConfig.modelPath}:`, error);
      throw error;
    }
  });

  try {
    const loadedModels = await Promise.all(modelPromises);
    console.log('All models loaded successfully');
    return loadedModels;
  } catch (error) {
    console.error('Error loading some models:', error);
    throw error;
  }
};