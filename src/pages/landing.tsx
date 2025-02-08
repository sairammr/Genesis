import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, Brain, Wand2, Rocket, Globe2, Users, Star, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from "@privy-io/react-auth";

function LandingPage() {
  const { ready, authenticated, user, login, logout } = usePrivy();

    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="noise" />
      
        <div className="relative z-10">
          <nav className="fixed top-0 w-full p-6 bg-black border-b-4 border-white">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-white" />
                <span className="text-2xl font-bold glitch">GENESIS</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                {['FEATURES', 'SHOWCASE', 'START'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-white hover:line-through transition-all font-bold"
                  >
                    {item}
                  </a>
                ))}
                {ready && authenticated ? (
                    <button onClick={logout} className="text-white hover:line-through transition-all font-bold">
                      LOG OUT
                    </button>
                ) : (
                  <button onClick={login}   className="text-white hover:line-through transition-all font-bold">LOG IN</button>
                )}
              </div>
            </div>
          </nav>

          <main>
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-4 pt-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 p-4"
              >
                <div className="space-y-8">
                  <motion.h1 
                    className="text-8xl font-bold leading-none"
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                  >
                    <span className="block text-white">CREATE</span>
                    <span className="block text-white">YOUR</span>
                    <span className="block text-white">UNIVERSE</span>
                    
                  </motion.h1>
                  
                  <motion.p 
                    className="text-2xl font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    AI-POWERED GAME WORLD GENERATION
                  </motion.p>

                  <motion.button
                 onClick={() => {
                    navigate('/prompt');
                  }}
                    className="brutalist-button"
                    whileTap={{ scale: 0.95 }}
                  >
                    INITIALIZE WORLD
                    <Zap className="inline-block ml-2" />
                  </motion.button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="brutalist-card bg-white/5 backdrop-blur-sm p-4"
                      >
                        <div className="h-full border border-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 border-y-4 border-white">
              <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-6xl font-bold mb-16 glitch">FEATURES.exe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { title: "AI CORE", desc: "NEURAL NETWORK POWERED WORLD GENERATION" },
                    { title: "REAL-TIME", desc: "INSTANT WORLD CREATION AND MODIFICATION" },
                    { title: "UNIQUE", desc: "NO TWO WORLDS ARE THE SAME" },
                    { title: "IMMERSIVE", desc: "FULLY EXPLORABLE 3D ENVIRONMENTS" }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="brutalist-card p-8"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-4xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-xl font-mono">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Showcase Section */}
            <section id="showcase" className="py-20">
              <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-6xl font-bold mb-16 glitch">WORLDS[]</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="brutalist-card aspect-square"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="h-full bg-white/5 backdrop-blur-sm p-4 flex items-center justify-center">
                        <span className="text-2xl font-mono">WORLD_{i + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section id="start" className="py-20 border-t-4 border-white">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto text-center px-4"
              >
                <h2 className="text-6xl font-bold mb-8 glitch">START_GENESIS</h2>
                <button
                  className="brutalist-button text-2xl"
                >
                  EXECUTE
                  <ChevronRight className="inline-block ml-2" />
                </button>
                
              </motion.div>
            </section>
          </main>
        </div>
     
    </div>
  );
}

export default LandingPage;