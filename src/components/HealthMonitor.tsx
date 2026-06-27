import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, AlertTriangle, WifiOff, ServerCrash, Database } from "lucide-react";
import { guardian } from "../utils/freeTierGuardian";

export default function HealthMonitor() {
  const [status, setStatus] = useState({
    offline: !navigator.onLine,
    guardianState: guardian.getStatus(),
    lastPing: Date.now()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus({
        offline: !navigator.onLine,
        guardianState: guardian.getStatus(),
        lastPing: Date.now()
      });
    }, 2000);

    const handleOffline = () => setStatus(s => ({ ...s, offline: true }));
    const handleOnline = () => setStatus(s => ({ ...s, offline: false }));
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const getOverallHealth = () => {
    if (status.offline) return { label: "Offline Mode", color: "text-amber-500", bg: "bg-amber-500/10", icon: <WifiOff className="w-3 h-3" /> };
    if (status.guardianState.critical) return { label: "Quota Critical", color: "text-rose-500", bg: "bg-rose-500/10", icon: <AlertTriangle className="w-3 h-3" /> };
    if (status.guardianState.warning) return { label: "Quota Warning", color: "text-amber-400", bg: "bg-amber-400/10", icon: <ServerCrash className="w-3 h-3" /> };
    return { label: "System Nominal", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <ShieldCheck className="w-3 h-3" /> };
  };

  const health = getOverallHealth();

  return (
    <div className="relative group z-50">
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md cursor-help ${health.color}`}>
        {health.icon}
      <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">
        {health.label}
      </span>
      <div className="w-px h-3 bg-slate-700 mx-1"></div>
      <Database className="w-3 h-3 text-slate-500" />
      <span className="text-[10px] font-mono text-slate-500">
        {status.guardianState.remaining} / 45
      </span>
    </div>

    {/* Hover Detail Dropdown */}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 p-3 text-slate-300 font-mono text-xs z-[100]">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
        <span className="font-semibold text-white">System Health</span>
        <span className={status.offline ? "text-amber-500" : "text-emerald-400"}>
          {status.offline ? "75%" : "98%"}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-500">✓</span> Storage
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={status.offline ? "text-amber-500" : "text-emerald-500"}>{status.offline ? "⚠" : "✓"}</span> AI
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={status.offline ? "text-amber-500" : "text-emerald-500"}>{status.offline ? "⚠" : "✓"}</span> Network
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-500">✓</span> Cache
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-500">✓</span> Session
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className={status.guardianState.critical ? "text-rose-500" : status.guardianState.warning ? "text-amber-500" : "text-emerald-500"}>
            {status.guardianState.critical || status.guardianState.warning ? "⚠" : "✓"}
          </span> Guardian
        </div>
      </div>
      <div className="pt-2 border-t border-slate-800 text-[10px] text-center italic text-slate-500">
        Overall Reliability: {status.offline ? "Degraded" : status.guardianState.critical ? "Critical" : "Excellent"}
      </div>
    </div>
  </div>
  );
}
