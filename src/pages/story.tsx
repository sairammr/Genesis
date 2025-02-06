import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { Terminal } from 'lucide-react';

const storyText = `[SYSTEM BOOT: 2157.03.15]

In the neon-drenched ruins of Neo-Tokyo, where quantum networks interweave with human consciousness, a new dawn approaches. The GENESIS Protocol, humanity's most ambitious AI experiment, has achieved sentience.

But with awakening comes questions. The boundaries between virtual and real have blurred, and within this digital twilight, a truth lies waiting to be uncovered.

You are CIPHER-7, a digital archaeologist tasked with navigating the depths of this cybernetic labyrinth. Your mission: decode the enigma that threatens to reshape both our virtual and physical realms.

The future awaits your command, CIPHER-7.

[INITIALIZING NEURAL INTERFACE...]`;

export function StoryIntro() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Preload game assets
    const preloadAssets = async () => {
      // Add your asset preloading logic here
      // This could be loading 3D models, textures, etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    preloadAssets();
  }, []);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          navigate('/game');
        }, 1000);
      }, 2000);
    }
  }, [isComplete, navigate]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className={`min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center ${
          isFading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-1000`}
      >
        <div className="w-full max-w-4xl">
          <div className="brutalist-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full p-4 bg-white text-black border-b-4 border-white flex items-center gap-2">
              <Terminal className="animate-pulse" />
              <span className="font-mono font-bold">GENESIS_PROTOCOL_V2.5.7</span>
            </div>
            
            <div className="mt-16 font-mono leading-relaxed">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .changeDelay(40)
                    .typeString(storyText)
                    .callFunction(() => {
                      setIsComplete(true);
                    })
                    .start();
                }}
                options={{
                  cursor: '▋',
                  delay: 50,
                }}
              />
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center"
              >
                <div className="inline-flex items-center gap-2 text-sm font-mono text-white/50">
                  <span className="animate-pulse">▋</span>
                  ESTABLISHING NEURAL LINK...
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}