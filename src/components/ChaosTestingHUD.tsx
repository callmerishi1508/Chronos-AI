import React, { useState, useEffect } from "react";
import { Skull, AlertOctagon, RefreshCcw, DatabaseZap, WifiOff, X } from "lucide-react";
import { setSafeStorage } from "../utils/storageGuard";

export default function ChaosTestingHUD() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only mount if explicitly enabled via environment
    if ((import.meta as any).env.VITE_ENABLE_CHAOS !== "true") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setIsVisible(v => !v);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible || (import.meta as any).env.VITE_ENABLE_CHAOS !== "true") return null;

  const corruptStorage = () => {
    localStorage.setItem("lifesaver_tasks", "{ corrupted: true, json: false");
    alert("Storage corrupted! Refresh the page to test recovery.");
  };

  const forceErrorBoundary = () => {
    // Simulate a render crash by writing an invalid prop that causes React to throw
    setIsVisible(() => { throw new Error("Chaos HUD Induced Component Crash"); });
  };

  const forceOffline = () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    window.dispatchEvent(new Event('offline'));
    alert("Navigator prototype overridden. System is now logically offline.");
  };

  const exhaustQuota = () => {
    const fakeGuardian = {
      quotaRemaining: 0,
      recentRequests: Array(45).fill(Date.now()),
      cacheHitRate: 10,
      criticalQueue: 0,
      backgroundQueue: 0,
      lastUpdate: Date.now()
    };
    setSafeStorage("chronos_guardian_state", fakeGuardian);
    alert("Quota Exhausted! Next background request will trigger Local Fallback.");
  };

  return (
    <div className="fixed bottom-16 right-6 w-80 bg-slate-950 border-2 border-rose-500/50 rounded-2xl shadow-2xl shadow-rose-900/20 z-[9999] font-mono overflow-hidden flex flex-col">
      <div className="bg-rose-950/40 border-b border-rose-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-400">
          <Skull className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-widest">Chaos Engine</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <button onClick={corruptStorage} className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 transition-colors">
          <span>Corrupt Storage</span>
          <DatabaseZap className="w-4 h-4 text-amber-400" />
        </button>
        
        <button onClick={forceErrorBoundary} className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 transition-colors">
          <span>Trigger Crash</span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </button>

        <button onClick={forceOffline} className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 transition-colors">
          <span>Force Offline</span>
          <WifiOff className="w-4 h-4 text-slate-400" />
        </button>

        <button onClick={exhaustQuota} className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 transition-colors">
          <span>Exhaust Quota</span>
          <RefreshCcw className="w-4 h-4 text-purple-400" />
        </button>
      </div>
    </div>
  );
}
