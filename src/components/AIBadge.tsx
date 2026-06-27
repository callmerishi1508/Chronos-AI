import React from 'react';
import { Sparkles, BrainCircuit, Zap, Key } from 'lucide-react';
import { AIProvider, PROVIDER_DISPLAY_NAMES } from '../context/AIProviderContext';

interface AIBadgeProps {
  provider: AIProvider | string | undefined;
  className?: string;
}

export function AIBadge({ provider, className = "" }: AIBadgeProps) {
  const normalizedProvider = provider as AIProvider || 'GEMINI_FLASH';

  if (normalizedProvider === 'CHRONOS_CORE_INTELLIGENCE') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15)] ${className}`}>
        <BrainCircuit className="w-3 h-3 text-amber-500" />
        {PROVIDER_DISPLAY_NAMES['CHRONOS_CORE_INTELLIGENCE']}
      </div>
    );
  }

  if (normalizedProvider === 'USER_GEMINI') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/40 text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)] ${className}`}>
        <Key className="w-3 h-3 text-indigo-400" />
        {PROVIDER_DISPLAY_NAMES['USER_GEMINI']}
      </div>
    );
  }

  if (normalizedProvider === 'GEMINI_FLASH_LITE') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/40 text-[10px] uppercase font-mono font-bold tracking-wider text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)] ${className}`}>
        <Zap className="w-3 h-3 text-blue-400" />
        {PROVIDER_DISPLAY_NAMES['GEMINI_FLASH_LITE']}
      </div>
    );
  }

  // GEMINI_FLASH
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/40 text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)] ${className}`}>
      <Sparkles className="w-3 h-3 text-indigo-400" />
      {PROVIDER_DISPLAY_NAMES['GEMINI_FLASH']}
    </div>
  );
}
