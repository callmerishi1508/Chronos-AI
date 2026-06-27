import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export type AIProvider = 'GEMINI_FLASH' | 'GEMINI_FLASH_LITE' | 'CHRONOS_CORE_INTELLIGENCE' | 'USER_GEMINI';

export const PROVIDER_DISPLAY_NAMES: Record<AIProvider, string> = {
  GEMINI_FLASH: 'Google Gemini 2.5 Flash',
  GEMINI_FLASH_LITE: 'Google Gemini 2.5 Flash Lite',
  CHRONOS_CORE_INTELLIGENCE: 'Chronos Core Intelligence',
  USER_GEMINI: 'Google Gemini (Session Key)',
};

interface AIProviderContextType {
  activeProvider: AIProvider;
  setActiveProvider: (provider: AIProvider) => void;
  bannerMessage: string | null;
  setBannerMessage: (message: string | null) => void;
  userApiKey: string | null;
  setUserApiKey: (key: string | null) => void;
  validateAndSetUserKey: (key: string) => Promise<boolean>;
  clearUserKey: () => void;
}

const AIProviderContext = createContext<AIProviderContextType | undefined>(undefined);

export function AIProviderProvider({ children }: { children: ReactNode }) {
  const [activeProvider, setActiveProvider] = useState<AIProvider>('GEMINI_FLASH');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);

  const validateAndSetUserKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/health/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userApiKey: key }),
      });
      if (response.ok) {
        setUserApiKey(key);
        setActiveProvider('USER_GEMINI');
        setBannerMessage(null); // Clear any fallback banners
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const clearUserKey = () => {
    setUserApiKey(null);
    setActiveProvider('GEMINI_FLASH'); // Will fallback naturally if system key is down
  };

  return (
    <AIProviderContext.Provider
      value={{
        activeProvider,
        setActiveProvider,
        bannerMessage,
        setBannerMessage,
        userApiKey,
        setUserApiKey,
        validateAndSetUserKey,
        clearUserKey,
      }}
    >
      {children}
    </AIProviderContext.Provider>
  );
}

export function useAIProvider() {
  const context = useContext(AIProviderContext);
  if (context === undefined) {
    throw new Error('useAIProvider must be used within an AIProviderProvider');
  }
  return context;
}

export function AIBanner() {
  const { bannerMessage, setBannerMessage } = useAIProvider();

  if (!bannerMessage) return null;

  return (
    <div className="bg-amber-900/40 border-b border-amber-500/30 p-3 px-6 flex items-center justify-between text-amber-200 text-sm">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400" />
        <span dangerouslySetInnerHTML={{ __html: bannerMessage }} />
      </div>
      <button 
        onClick={() => setBannerMessage(null)}
        className="p-1 hover:bg-amber-800/40 rounded text-amber-400/80 hover:text-amber-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
