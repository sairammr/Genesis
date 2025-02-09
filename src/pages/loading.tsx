import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { preloadModels } from '../game/preModalLoader';
const steps = [
  "ANALYZING_PROMPT.exe",
  "INITIALIZING_ENVIRONMENT.exe",
  "GENERATING_WORLD.exe",
  "COMPILING_NARRATIVE.exe"
];

const RETRY_DELAY = 1000; // 1 second between retries

export function LoadingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [results, setResults] = useState({
    story: null,
    image: null,
    position: null
  });

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const ws = new WebSocket('ws://localhost:5000/world-creation');
    wsRef.current = ws;

    ws.onopen = () => {
      
      const prompt = location.state?.prompt;
      if (prompt) {
        ws.send(prompt);
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'status':
            setCurrentStep(message.step);
            break;
          case 'story':
            setResults(prev => ({ ...prev, story: message.data }));
            break;
          case 'image':
            setResults(prev => ({ ...prev, image: message.data }));
            
            
            break;
          case 'position':
            setResults(prev => ({ ...prev, position: message.data }));
            const modelConfigs = message.data;
             preloadModels(modelConfigs)
            .then(() => setModelsLoaded(true))
             .catch(console.error);
            break;
          case 'error':
            console.error('Server error:', message.data);
            // Don't navigate away, just retry connection
            break;
        }
      } catch (error) {
        console.error('Message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed, retrying...');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  

  useEffect(() => {
    const prompt = location.state?.prompt;
    if (!prompt) {
      return;
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [location.state]);

  useEffect(() => {
    if (results.image && results.position && results.story) {
      setTimeout(() => {
        navigate('/story', { 
          state: { 
            ...results, 
            modelConfigs: results.position // Pass model configs to the next scene
          } 
      }), 2000});
    }
  }, [results, navigate]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="noise" />
      <div className="w-full max-w-2xl p-8 brutalist-card">
        <Terminal className="h-12 w-12 text-white mb-8" />
        <div className="space-y-6 font-mono">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: currentStep >= index ? 1 : 0.3,
                x: 0
              }}
              className="flex items-center space-x-4"
            >
              <div 
                className={`h-3 w-3 ${
                  currentStep >= index ? 'bg-white' : 'bg-white/30'
                } ${
                  isConnecting && index === currentStep ? 'animate-pulse' : ''
                }`} 
              />
              <div className="flex-1 border-b border-dashed border-white/30" />
              <span className={currentStep >= index ? 'text-white' : 'text-white/30'}>
                {step}
                {isConnecting && index === currentStep && ''}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}