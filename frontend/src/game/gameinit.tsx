import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { initializeScene } from './gameHandler';
import { loadSceneModels } from './modelLoader';


const SceneViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentRef = mountRef.current;
    const { scene, camera, renderer, controller } = initializeScene(currentRef, 100,);
    
    // Load models
    
    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
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
  }, []);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <div className='cursor'>+</div>
    </>
  );
};

export default SceneViewer;