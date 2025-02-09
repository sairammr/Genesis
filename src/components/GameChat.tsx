import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Terminal, Cpu, Boxes, Users } from 'lucide-react';

interface Message {
  text: string;
  isPlayer: boolean;
  timestamp: Date;
  id: string;
}

const CHARACTERS = [
  { id: 'Michel', name: 'Michel', description: 'Suspect-1' },
  { id: 'Jenna', name: 'Jenna', description: 'Suspect-2' },
  {   id:'nexus', name: 'nexus' , description: 'Suspect-3' },
 
]

export function GameChat() {
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpenState, setIsOpenState] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:5000/chat');

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'status':
          setIsTyping(data.step < 3);
          break;
        case 'story':
          addAIMessage(data.data);
          break;
        case 'error':
          addAIMessage(`ERROR: ${data.data}`);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    return () => {
      websocket.close();
    };
  }, []);

  const addAIMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        text,
        isPlayer: false,
        timestamp: new Date(),
        id: Math.random().toString(36).substring(7),
      },
    ]);
    setIsTyping(false);
  };

  const handleSend = () => {
    if (message.trim() && ws) {
      // Format message for WebSocket with selected character
      const formattedMessage = `chat to ${selectedCharacter.id} ${message}`;
      ws.send(formattedMessage);

      // Add user message to local state
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isPlayer: true,
          timestamp: new Date(),
          id: Math.random().toString(36).substring(7),
        },
      ]);
      setMessage('');
      setIsTyping(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCharacterSelect = (character: typeof CHARACTERS[0]) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
    // Clear messages when changing character
    setMessages([]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpenState && (
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
                  <h3 className="font-mono font-bold tracking-tight">{selectedCharacter.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCharacterSelect(true)} 
                    className="hover:text-blue-500 transition-colors"
                  >
                    <Users size={20} />
                  </button>
                  <button 
                    onClick={() => setIsOpenState(false)} 
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2 text-xs font-mono">
                <span className="bg-green-500 px-2 py-1">ONLINE</span>
                <span className="bg-black text-white px-2 py-1">VER 2.5.0</span>
              </div>
            </div>

            {/* Character Selection Modal */}
            <AnimatePresence>
              {showCharacterSelect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-black/95 z-50 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-mono font-bold">SELECT CHARACTER</h3>
                    <button
                      onClick={() => setShowCharacterSelect(false)}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {CHARACTERS.map((character) => (
                      <motion.button
                        key={character.id}
                        onClick={() => handleCharacterSelect(character)}
                        className={`w-full p-4 border-2 ${
                          selectedCharacter.id === character.id
                            ? 'border-white bg-white text-black'
                            : 'border-white/50 text-white hover:border-white'
                        } transition-colors`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-left font-mono">
                          <div className="font-bold">{character.name}</div>
                          <div className="text-sm opacity-70">{character.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              className="h-[calc(100%-12rem)] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white scrollbar-track-black"
              style={{
                backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '100% 8px',
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
                    className={`relative max-w-[80%] p-4 ${
                      msg.isPlayer
                        ? 'bg-white text-black border-2 border-black mr-2'
                        : 'bg-black text-white border-2 border-white ml-2'
                    }`}
                    style={{
                      clipPath: msg.isPlayer
                        ? 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
                    }}
                  >
                    <p className="font-mono text-sm leading-relaxed">{msg.text}</p>
                    <div
                      className={`absolute bottom-0 ${
                        msg.isPlayer ? 'right-0' : 'left-0'
                      } text-[10px] font-mono opacity-50 p-1`}
                    >
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
        onClick={() => setIsOpenState(!isOpenState)}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        <div className="relative bg-black text-white border-2 border-white px-6 py-3 flex items-center gap-2 font-mono font-bold">
          <MessageSquare className="animate-pulse" />
          {isOpenState ? 'CLOSE' : 'INVESTIGATE'}
        </div>
      </motion.button>
    </div>
  );
}