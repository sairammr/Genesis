import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileWarning, Trophy, Home, X, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportKillerProps {
  onMintNFT: () => void;
}

export function ReportKiller({ onMintNFT }: ReportKillerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const navigate = useNavigate();

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!result) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!result) {
        e.preventDefault();
        if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
          navigate('/');
        } else {
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [result, navigate]);

  const handleReport = async (killer: 'michel' | 'jenna') => {
    setIsSubmitting(true);
    const ws = new WebSocket('ws://localhost:5000/killer');
    
    ws.onopen = () => {
        ws.send(killer);
      };
    
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'result') {
          setResult(data.data === 'success' ? 'success' : 'failure');
        }
        ws.close();
      };
    
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setResult('failure');
        setIsSubmitting(false);
      };
    
      ws.onclose = () => {
        setIsSubmitting(false);
      };
    };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
      navigate('/');
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-0 left-0 w-[400px] bg-black border-4 border-white"
            style={{ boxShadow: '8px 8px 0 rgba(255,255,255,0.5)' }}
          >
            <div className="border-b-4 border-white bg-white text-black p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileWarning className="text-red-500" />
                  <h3 className="font-mono font-bold tracking-tight">
                    REPORT_KILLER.exe
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!result ? (
                <>
                  <div className="font-mono text-white text-center mb-6">
                    SELECT THE KILLER
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['michel', 'jenna'].map((suspect) => (
                      <button
                        key={suspect}
                        onClick={() => handleReport(suspect as 'michel' | 'jenna')}
                        disabled={isSubmitting}
                        className="brutalist-button w-full flex items-center justify-center gap-2"
                      >
                        <Skull size={20} />
                        {suspect.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              ) : result === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <Trophy className="w-16 h-16 mx-auto text-yellow-400 animate-pulse" />
                  <div className="font-mono text-white text-xl">
                    KILLER FOUND!
                  </div>
                  <button
                    onClick={onMintNFT}
                    className="brutalist-button w-full"
                  >
                    MINT NFT TROPHY
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <AlertTriangle className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
                  <div className="font-mono text-white text-xl">
                    INVESTIGATION FAILED
                  </div>
                  <button
                    onClick={handleExit}
                    className="brutalist-button w-full flex items-center justify-center gap-2"
                  >
                    <Home size={20} />
                    EXIT TO HOME
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-red-500 translate-x-2 translate-y-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        <div className="relative bg-black text-white border-2 border-red-500 px-6 py-3 flex items-center gap-2 font-mono font-bold">
          <FileWarning className="text-red-500" />
          REPORT
        </div>
      </motion.button>
    </div>
  );
}