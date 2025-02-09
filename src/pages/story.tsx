import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { Terminal } from 'lucide-react';



export function StoryIntro() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [isFading, setIsFading] = useState(false);
  

const { state } = useLocation();
const storyText = state?.story || "System initialization failed. Please restart the protocol.";
useEffect(() => {
  if (isComplete) {
    setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        // Navigate to /game with the position data
        navigate('/game', {
          state: {
            position: state?.position, // Pass the position data
            story: state?.story, // Optionally pass the story text
            image: state?.image, // Optionally pass the image
          },
        });
      }, 1000);
    }, 2000);
  }
}, [isComplete, navigate, state?.position, state?.story, state?.image]);


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
                    .typeString("WELCOME, USER." + storyText)
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