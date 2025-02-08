import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initializeScene } from './gameHandler';
import { loadSceneModels } from './modelLoader';
import { GameChat } from '../components/GameChat';
import { sceneConfig } from '../pages/sceneconfig';
import { instance } from 'three/src/nodes/TSL.js';

const SceneViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [npcPosition] = useState(new THREE.Vector3(-20, 0, -4)); // Michel's position
  const proximityThreshold = 5;
  const defaultModels = [
    {
      modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/michel_v3.glb',
      position: new THREE.Vector3(-20,0, -4),
      rotation: new THREE.Euler(0, Math.PI/4, 0),
      scale: new THREE.Vector3(0.005, 0.005, 0.005)
  },
   
      // Security Cameras (Multiple Instances)
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/security_camera_01.glb',
          position: new THREE.Vector3(-4, 2.5, -4),
          rotation: new THREE.Euler(0, Math.PI/4, 0),
          scale: new THREE.Vector3(0.3, 0.3, 0.3)
      },
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/security_camera_01.glb',
          position: new THREE.Vector3(4, 2.5, 4),
          rotation: new THREE.Euler(0, -Math.PI/4, 0),
          scale: new THREE.Vector3(0.3, 0.3, 0.3)
      },
  
      // Main Structure
    
  
      // Evidence (Blood Pool)
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/pool_of_blood_low_poly_planes.glb',
          position: new THREE.Vector3(2, 0.1, -1),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(0.8, 0.8, 0.8)
      },
  
      // Lighting (Multiple Instances)
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/street_lamp_01.glb',
          position: new THREE.Vector3(-3, 0, 3),
          rotation: new THREE.Euler(0, Math.PI/3, 0),
          scale: new THREE.Vector3(0.7, 0.7, 0.7),
          instanceCount: 2
      },
      
  
      // Critical Evidence
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/crime_scene_skull.glb',
          position: new THREE.Vector3(-1, 0.2, 2),
          rotation: new THREE.Euler(0, Math.PI/1.5, 0),
          scale: new THREE.Vector3(0.5, 0.5, 0.5)
      },
  
      // Investigation Board
     
  
      // Weapon Evidence
      {
          modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/hatchet.glb',
          position: new THREE.Vector3(-2.5, 0.3, -2),
          rotation: new THREE.Euler(0, Math.PI/1.2, Math.PI/6),
          scale: new THREE.Vector3(0.4, 0.4, 0.4)
      }
  ];
  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentRef = mountRef.current;
    const { scene, camera, renderer, controller } = initializeScene(currentRef, 100,);
    loadSceneModels(scene, defaultModels)

    // Load models
    loadSceneModels(scene, sceneConfig[0].objects)
  .then(() => {
    animate();
  })
  .catch((error) => console.error('Failed to load scene models:', error));
  let animationFrameId: number;
  let previousProximity = false;
    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const distance = camera.position.distanceTo(npcPosition);
      const inProximity = distance < proximityThreshold;
      if (inProximity !== previousProximity) {
        previousProximity = inProximity;
        setShowChat(inProximity && !userDismissed);
        
        // Reset dismissal when leaving proximity
        if (!inProximity) setUserDismissed(false);
      }
      const deltaTime = clock.getDelta();
      controller.update(deltaTime, 100);
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
  }, [userDismissed]);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <div className='cursor'>+</div> 
       <GameChat 
        isOpen={showChat} 
        onClose={() => setUserDismissed(true)}
        characterName="Michel" 
      />
    </>
  );
};

export default SceneViewer;