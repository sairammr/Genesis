import * as THREE from 'three';
import { FirstPersonController } from './firstpersonview';
import { processCubeMap } from '../utils/cubeMapGenerator';
export const initializeScene = (container: HTMLElement, planeSize: number) => {
  const scene = new THREE.Scene();
   
  // Process and append cube map faces
  let textureImages: string[] = [];
  processCubeMap('/sb3.jpg', {
    interpolation: 'linear',
    resolution: 1024
  }).then(faces => {
    textureImages = faces.map(face => {
      // Convert canvas to data URL
      return face.canvas.toDataURL('image/png');
    });
    
    // Update the texture with processed faces
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load(textureImages);
    scene.background = texture;
    
    // Apply the same transformations
    texture.matrixAutoUpdate = false;
    texture.matrix.identity()
      .scale(0.95, 0.95 * 0.95)
      .translate(0, 0.12);
  });
  

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const controller = new FirstPersonController(camera, renderer.domElement);
  controller.getObject().position.y = 1.6; 
  scene.add(controller.getObject());

  // Ground plane
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeSize, planeSize),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
  const gridHelper = new THREE.GridHelper(planeSize, planeSize);
  scene.add(gridHelper);
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  return { scene, camera, renderer, controller };
};
export type GameInitializationResult = ReturnType<typeof initializeScene>;