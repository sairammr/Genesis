import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PLANE_SIZE, sceneModels } from './sceneconfig';
import { FirstPersonController } from '../game/firstpersonview';

const SceneViewer = () => {
    const mountRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (!mountRef.current) return;
      
      const currentRef = mountRef.current;
  
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87ceeb);
  
      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        currentRef.clientWidth / currentRef.clientHeight,
        0.1,
        1000
      );
  
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
      renderer.shadowMap.enabled = true;
      currentRef.appendChild(renderer.domElement);
  
      // Initialize first person controller
      const controller = new FirstPersonController(camera, renderer.domElement);
      scene.add(controller.getObject()); // Add the controller object to the scene
  
      // Rest of your scene setup (plane, lights, etc.)
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
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(50, 50, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

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

    // Clock for delta time calculation
    const clock = new THREE.Clock();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();
      controller.update(deltaTime, PLANE_SIZE);
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

  return (<>
  <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
  <div className='cursor'>+</div>
  </>
  );
};

export default SceneViewer;