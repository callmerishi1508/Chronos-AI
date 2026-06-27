import React, { useState } from 'react';
import { Settings, Key, BrainCircuit, Sparkles, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAIProvider } from '../context/AIProviderContext';
import { AIBadge } from './AIBadge';

export function SettingsPanel() {
  const { activeProvider, userApiKey, validateAndSetUserKey, clearUserKey } = useAIProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!inputKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    
    const success = await validateAndSetUserKey(inputKey.trim());
    if (success) {
      setInputKey('');
      setIsOpen(false);
    } else {
      setError('Validation failed. Check your key and try again.');
    }
    setIsVerifying(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 px-3 py-1.5 min-h-[44px] rounded-full transition-colors text-slate-300 hover:text-white"
        title="AI Runtime Settings"
      >
        <Settings className="w-4 h-4" />
        <span className="text-xs font-semibold hidden sm:inline">Settings</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                AI Runtime Manager
              </h2>
              <p className="text-sm text-slate-400 mb-6">Configure Chronos AI provider settings for the current session.</p>

              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Runtime Status</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Active Provider</span>
                      <AIBadge provider={activeProvider} />
                    </div>
                  </div>
                </div>

                {/* Session Key */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" />
                    Custom Session Key
                  </h3>
                  
                  {userApiKey ? (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-white font-medium">Session Key Active</p>
                          <p className="text-xs text-slate-400 mt-1">Your Gemini API key is currently powering this session in-memory.</p>
                          <button 
                            onClick={clearUserKey}
                            className="mt-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Clear Session Key
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Optionally provide your own Google Gemini API key to bypass system rate limits. 
                        <strong className="text-slate-300 block mt-1">The key is held in memory and destroyed when the tab closes. It is never logged or persisted.</strong>
                      </p>
                      
                      <div className="relative">
                        <input 
                          type="password"
                          value={inputKey}
                          onChange={(e) => setInputKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 transition-all"
                        />
                      </div>
                      
                      {error && (
                        <div className="flex items-center gap-2 text-rose-400 text-xs">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {error}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={handleVerify}
                          disabled={isVerifying || !inputKey.trim()}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {isVerifying ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Validate & Enable Session Key</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/30 p-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
