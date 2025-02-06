import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Terminal, Cpu, Boxes } from 'lucide-react';

interface Message {
  text: string;
  isPlayer: boolean;
  timestamp: Date;
  id: string;
}

export function GameChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const characterName = "NEXUS-7 // NEURAL GUIDE";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        isPlayer: true,
        timestamp: new Date(),
        id: Math.random().toString(36).substring(7)
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          text: "ANALYZING REQUEST... [DATA_STREAM_0x7F] Processing neural patterns...",
          isPlayer: false,
          timestamp: new Date(),
          id: Math.random().toString(36).substring(7)
        }]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-[100px] right-0 w-[400px] h-[600px] bg-black border-4 border-white"
            style={{ boxShadow: '8px 8px 0 rgba(255,255,255,0.5)' }}
          >
            {/* Header */}
            <div className="border-b-4 border-white bg-white text-black p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="animate-pulse" />
                  <h3 className="font-mono font-bold tracking-tight">
                    {characterName}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-2 mt-2 text-xs font-mono">
                <span className="bg-green-500 px-2 py-1">ONLINE</span>
                <span className="bg-black text-white px-2 py-1">VER 2.5.0</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="h-[calc(100%-12rem)] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white scrollbar-track-black"
              style={{ 
                backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '100% 8px'
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isPlayer ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      relative max-w-[80%] p-4
                      ${msg.isPlayer 
                        ? 'bg-white text-black border-2 border-black mr-2' 
                        : 'bg-black text-white border-2 border-white ml-2'
                      }
                    `}
                    style={{ 
                      clipPath: msg.isPlayer 
                        ? 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' 
                        : 'polygon(0 0, 100% 0, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
                    }}
                  >
                    <p className="font-mono text-sm leading-relaxed">{msg.text}</p>
                    <div className={`
                      absolute bottom-0 ${msg.isPlayer ? 'right-0' : 'left-0'} 
                      text-[10px] font-mono opacity-50 p-1
                    `}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-white font-mono text-sm"
                >
                  <Boxes className="animate-spin" size={16} />
                  <span>Processing input...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-white bg-black">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="INVESTIGATE..."
                    className="w-full bg-black text-white font-mono p-3 border-2 border-white focus:outline-none resize-none"
                    rows={1}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  />
                  <Terminal 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-50" 
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                  className="bg-white text-black border-2 border-white p-3 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                >
                  <Send size={20} />
                </button>
              </div>
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
        <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        <div className="relative bg-black text-white border-2 border-white px-6 py-3 flex items-center gap-2 font-mono font-bold">
          <MessageSquare className="animate-pulse" />
          INVESTIGATE
        </div>
      </motion.button>
    </div>
  );
}