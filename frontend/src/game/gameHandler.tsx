import * as THREE from 'three';
import { FirstPersonController } from './firstpersonview';

export const initializeScene = (container: HTMLElement, planeSize: number) => {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

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

  // Initialize first person controller
  const controller = new FirstPersonController(camera, renderer.domElement);
  scene.add(controller.getObject());

  // Ground plane
  const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x55aa55,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // Grid helper
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