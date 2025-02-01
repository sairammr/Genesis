import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const steps = [
  "ANALYZING_PROMPT.exe",
  "INITIALIZING_ENVIRONMENT.exe",
  "GENERATING_WORLD.exe",
  "COMPILING_NARRATIVE.exe"
];

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, );

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
              <div className={`h-3 w-3 ${currentStep >= index ? 'bg-white' : 'bg-white/30'}`} />
              <div className="flex-1 border-b border-dashed border-white/30" />
              <span className={currentStep >= index ? 'text-white' : 'text-white/30'}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}