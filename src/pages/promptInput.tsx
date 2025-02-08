import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (prompt.length < 100) {
      setError('ERROR: MINIMUM 100 CHARACTERS REQUIRED');
      return;
    }

    setError('');
    setLoading(true);
    navigate('/loading', { state: { prompt } });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="noise" />
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <Terminal className="h-16 w-16 mx-auto mb-4 text-white" />
          <h2 className="text-4xl font-bold text-white mb-4 glitch">WORLD_PARAMETERS</h2>
          <p className="text-white font-mono">ENTER WORLD SPECIFICATIONS (MIN. 100 CHARS)</p>
        </div>
        
        <div className="brutalist-card">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-64 p-6 bg-black text-white font-mono focus:outline-none resize-none"
            placeholder="DESCRIBE YOUR WORLD..."
          />
          <div className="p-4 border-t-2 border-white flex items-center justify-between bg-black">
            <span className="text-sm font-mono text-white">
              CHARS: {prompt.length}/100
            </span>
            <button
              onClick={handleSubmit}
              className="brutalist-button"
            >
              EXECUTE
              <Send size={18} className="ml-2 inline" />
            </button>
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-center font-mono">{error}</p>
        )}
      </div>
    </div>
  );
}