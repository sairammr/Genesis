import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLANE_SIZE, sceneModels } from './sceneconfig';

const SceneViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentRef = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentRef.clientWidth / currentRef.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    renderer.shadowMap.enabled = true;
    currentRef.appendChild(renderer.domElement);

    // Create finite plane
    const planeGeometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x55aa55,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(PLANE_SIZE, PLANE_SIZE);
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Controls setup with boundaries
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
    controls.minDistance = 10;
    controls.maxDistance = PLANE_SIZE;

    // Setup loading manager
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onError = (url) => {
      console.error('Error loading:', url);
    };

    // Load models from config
    const loader = new GLTFLoader(loadingManager);
    
    sceneModels.forEach((modelConfig) => {
      loader.load(
        modelConfig.modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // Apply configuration
          model.position.copy(modelConfig.position);
          model.rotation.copy(modelConfig.rotation);
          model.scale.copy(modelConfig.scale);
          
          // Enable shadows
          model.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });

          // Ensure model is within plane bounds
          const boundingBox = new THREE.Box3().setFromObject(model);
          const modelSize = boundingBox.getSize(new THREE.Vector3());
          const halfPlaneSize = PLANE_SIZE / 2;

          // Clamp position to plane bounds
          model.position.x = THREE.MathUtils.clamp(
            model.position.x, 
            -halfPlaneSize + modelSize.x/2, 
            halfPlaneSize - modelSize.x/2
          );
          model.position.z = THREE.MathUtils.clamp(
            model.position.z, 
            -halfPlaneSize + modelSize.z/2, 
            halfPlaneSize - modelSize.z/2
          );

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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentRef.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default SceneViewer;