import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initializeScene } from './gameHandler';
import { loadSceneModels } from './modelLoader';
import { GameChat } from '../components/GameChat';
import { sceneConfig } from '../pages/sceneconfig';

const SceneViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const previousProximityRef = useRef(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [npcPosition] = useState(new THREE.Vector3(-20, -2, -4)); // Michel's position
  const proximityThreshold = 10; // Distance in units

  const defaultModels = [
    {
      modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/michel_v3.glb',
      position: new THREE.Vector3(-20, -1, -4),
      rotation: new THREE.Euler(0, Math.PI / 4, 0),
      scale: new THREE.Vector3(0.02, 0.02, 0.02),
    },
  
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const currentRef = mountRef.current;
    const { scene, camera, renderer, controller } = initializeScene(currentRef, 100);

    // Load default models
    loadSceneModels(scene, defaultModels)
      .then(() => {
        // Load additional scene models
        loadSceneModels(scene, sceneConfig[0].objects)
          .catch((error) => console.error('Failed to load scene models:', error));
      })
      .catch((error) => console.error('Failed to load default models:', error));

    let animationFrameId: number;
    let previousProximity = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controller) {
        camera.position.copy(controller.getObject().position);
      }
      // Check proximity to NPC
      const distance = camera.position.distanceTo(npcPosition);
      const inProximity = distance < proximityThreshold;

      // Update chat visibility only when proximity state changes
      // Update chat visibility only when state changes
      if (inProximity !== previousProximityRef.current) {
        previousProximityRef.current = inProximity;
        setShowChat(inProximity && !userDismissed);

        // Reset dismissal when leaving
        if (!inProximity) setUserDismissed(false);
      }

      // Update controller and render scene
      const deltaTime = clock.getDelta();
      controller.update(deltaTime, 100);
      renderer.render(scene, camera);
    };

    const clock = new THREE.Clock();
    animate();

    // Handle window resize
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [userDismissed]);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <div className="cursor">+</div>
      <GameChat
        isOpen={showChat}
        onClose={() => setUserDismissed(true)}
        characterName="Michel"
      />
    </>
  );
};

export default SceneViewer;