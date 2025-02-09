import  { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initializeScene } from './gameHandler';
import { loadSceneModels } from './modelLoader';
import { GameChat } from '../components/GameChat';
import { addModelsToScene } from './preModalLoader';
import { useLocation } from 'react-router-dom';
import { pinata } from '../config/pinata';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner,  faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ReportKiller } from '../components/reportKiller';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  animation_url?: string;
  scene_position?: {
    x: number;
    y: number;
    z: number;
  };
}

const SceneViewer = () => {
  const { state } = useLocation();
  const models = state?.position || [];
  const mountRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const previousProximityRef = useRef(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [npcPosition] = useState(new THREE.Vector3(-20, -2, -4));
  const proximityThreshold = 10;
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'preparing' | 'uploading' | 'minting' | 'success' | 'error'>('idle');
  const [nftDetails] = useState<{ contractAddress: string; tokenId: string } | null>(null);
  const [cameraPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controllerRef = useRef<any>(null);

  const defaultModels = [
    {
      modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/michel_v3.glb',
      position: new THREE.Vector3(-20, -2, -4),
      rotation: new THREE.Euler(0, Math.PI / 4, 0),
      scale: new THREE.Vector3(0.02, 0.02, 0.02),
    },
    {
      modelPath: 'https://cdn.jsdelivr.net/gh/sairammr/3d-models@main/michel_v3.glb',
      position: new THREE.Vector3(30, -2, -4),
      rotation: new THREE.Euler(0, Math.PI / 4, 0),
      scale: new THREE.Vector3(0.02, 0.02, 0.02),
    },
  ];

  const generateNFTMetadata = (): NFTMetadata => {
    if (!sceneRef.current || !controllerRef.current) throw new Error('Scene not initialized');
    
    const screenshot = captureSceneScreenshot();

    return {
      name: 'In-Game Artifact',
      description: 'A unique digital artifact discovered in the virtual world',
      image: screenshot,
      attributes: [
        { trait_type: 'Scene Position X', value: cameraPosition.x.toFixed(2) },
        { trait_type: 'Scene Position Y', value: cameraPosition.y.toFixed(2) },
        { trait_type: 'Scene Position Z', value: cameraPosition.z.toFixed(2) },
        { trait_type: 'Discovery Time', value: new Date().toISOString() },
      ],
      animation_url: models[0]?.modelPath || defaultModels[0].modelPath,
      scene_position: {
        x: cameraPosition.x,
        y: cameraPosition.y,
        z: cameraPosition.z,
      },
    };
  };

  const captureSceneScreenshot = (): string => {
    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
    const canvas = renderer.domElement;
    renderer.render(sceneRef.current!, controllerRef.current!.camera);
    return canvas.toDataURL('image/png');
  };

  
  const handleMintNF = async () => {
    try {
      setMintingStatus('preparing');
      
      // Generate and upload metadata
      const metadata = generateNFTMetadata();
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([blob], 'metadata.json');
      
      setMintingStatus('uploading');
      const uploadResponse = await pinata.upload.fileArray([metadataFile]);
      setMintingStatus('minting');

    } catch (error) {
      console.error('Minting failed:', error);
      setMintingStatus('error');
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const currentRef = mountRef.current;
    const { scene, camera, renderer, controller } = initializeScene(currentRef);
    sceneRef.current = scene;
    controllerRef.current = controller;
    const clock = new THREE.Clock();

    const modelsToLoad = models.length > 0 ? models : defaultModels;
    addModelsToScene(scene, modelsToLoad);
    loadSceneModels(scene, defaultModels);
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controller) {
        const camPos = controller.getObject().position;
        
        // Proximity check
        const distance = camPos.distanceTo(npcPosition);
        const inProximity = distance < proximityThreshold;

        if (inProximity !== previousProximityRef.current) {
          previousProximityRef.current = inProximity;
          setShowChat(inProximity && !userDismissed);
          if (!inProximity) setUserDismissed(false);
        }
      }
      const deltaTime = clock.getDelta();
      controller.update(deltaTime, 100);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      currentRef.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [userDismissed]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <ReportKiller onMintNFT={handleMintNF} />
      <GameChat 
      />
      {/* Minting UI */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="minting-overlay"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            maxWidth: '400px',
          }}
        >
        
       
          
          <div className="minting-controls">
            <h3>Mint Scene NFT</h3>
            <p>Current Position: {cameraPosition.x.toFixed(1)}, {cameraPosition.y.toFixed(1)}, {cameraPosition.z.toFixed(1)}</p>
            
            <button 
              onClick={handleMintNF}
              disabled={mintingStatus !== 'idle'}
              style={{
                padding: '10px 20px',
                background: mintingStatus === 'idle' ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {mintingStatus === 'idle' && 'Mint Current Scene'}
              {mintingStatus === 'preparing' && 'Preparing Metadata...'}
              {mintingStatus === 'uploading' && 'Uploading to IPFS...'}
              {mintingStatus === 'minting' && 'Deploying to Blockchain...'}
              {mintingStatus === 'success' && 'Mint Successful!'}
              {mintingStatus === 'error' && 'Error - Try Again'}
            </button>

            {mintingStatus === 'success' && nftDetails && (
              <div className="minting-success">
                <p>
                  NFT Contract: <a 
                    href={`https://sepolia.basescan.org/address/${nftDetails.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {nftDetails.contractAddress.slice(0, 6)}...{nftDetails.contractAddress.slice(-4)}
                  </a>
                </p>
                <p>Token ID: {nftDetails.tokenId}</p>
              </div>
            )}

            {mintingStatus === 'error' && (
              <div className="minting-error">
                <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#ff4444' }} />
                <p>Error minting NFT. Please try again.</p>
              </div>
            )}

            {['preparing', 'uploading', 'minting'].includes(mintingStatus) && (
              <div className="minting-status">
                <FontAwesomeIcon icon={faSpinner} spin />
                <p>Processing transaction...</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SceneViewer;