import * as THREE from 'three';
import { FirstPersonController } from './firstpersonview';
import { processCubeMap } from '../utils/cubeMapGenerator';
import { generateRoads } from './generateRoads';
export const initializeScene = (container: HTMLElement, planeSize: number) => {
  const scene = new THREE.Scene();
   
  // Process and append cube map faces
  let textureImages: string[] = [];
  processCubeMap('/sb4.jpg', {
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
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  const controller = new FirstPersonController(camera, renderer.domElement);
      scene.add(controller.getObject());
  //fr
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.frustumCulled = true;
    }
  });
  // Ground plane
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1), // Minimal geometry
    new THREE.MeshBasicMaterial({ color: 0x90EE90 }) // Lightweight material
  );
  
  plane.scale.set(100, 100, 1); // Scale it up instead of using high-vertex geometry
  plane.rotation.x = -Math.PI / 2; // Make it horizontal
  plane.receiveShadow = false; // Reduce processing if shadows aren't needed
  
  scene.add(plane);
const gridHelper = new THREE.GridHelper(100, 100);
  scene.add(gridHelper);
  // Lighting
 // Ambient light for base illumination (low cost)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Moderate intensity
scene.add(ambientLight);

// Single directional light for shadows (optimized settings)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Reduced intensity
directionalLight.position.set(50, 100, 50);

// Reduce shadow map resolution for better performance
 // Reduced from 2048

// Tighten shadow camera frustum to cover only necessary areas
generateRoads(scene, planeSize);
scene.add(directionalLight);
// Optional: Add a point light for additional brightness



  return { scene, camera, renderer, controller };
};
export type GameInitializationResult = ReturnType<typeof initializeScene>;