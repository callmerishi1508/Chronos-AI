import React, { useState } from "react";
import { 
  Zap, AlertTriangle, ShieldCheck, ArrowRight, Brain, Clock, 
  Trash2, Heart, TrendingUp, Sparkles, AlertCircle, RefreshCw, Layers, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Task } from "../types";

interface FutureSelfSimulatorProps {
  isRecoveryActive?: boolean;
  onActivateRecovery?: () => void;
  tasks?: Task[];
}

export default function FutureSelfSimulator({
  isRecoveryActive = false,
  onActivateRecovery,
  tasks = []
}: FutureSelfSimulatorProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<"collapse" | "saved">("collapse");

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-2">
          <Brain className="w-8 h-8 text-indigo-500/50" />
        </div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">No Simulation Data</h2>
        <p className="text-xs text-slate-500 font-sans max-w-sm leading-relaxed">
          The Future Self Simulator requires active tasks to model timeline collapse and recovery paths. Add tasks to initialize the prediction engine.
        </p>
      </div>
    );
  }

  return (
    <div id="future-self-simulator" className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Visual background gradient accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/[0.015] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/[0.015] rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <TrendingUp className="w-5 h-5 text-indigo-400 motion-safe:animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Future Self Simulator
              </h2>
              <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] font-mono font-bold uppercase rounded motion-safe:animate-pulse">
                Flagship Diagnostic
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Experience the psychological and chronological consequences of your actions before they manifest.
            </p>
          </div>
        </div>

        {/* TIMELINE QUICK TOGGLE */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl gap-1 self-stretch sm:self-auto">
          <button
            onClick={() => setSelectedTimeline("collapse")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedTimeline === "collapse"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Timeline Collapse (A)
          </button>
          <button
            onClick={() => setSelectedTimeline("saved")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedTimeline === "saved"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Timeline Saved (B)
          </button>
        </div>
      </div>

      {/* SIMULATOR COMPARISON VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* SIDE A: TIMELINE COLLAPSE (FUTURE A) */}
        <div className={`p-6 border rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[350px] ${
          selectedTimeline === "collapse" 
            ? "bg-red-950/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)] scale-[1.01]" 
            : "bg-slate-900/10 border-slate-900 opacity-45 hover:opacity-75"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest text-red-500 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded">
                Future A: Critical Failure
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">ETA: 02:45 AM</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Unmitigated Timeline Collapse
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                You ignore the Chronos descope suggestions. You believe your estimating powers can overcome the "Optimism Tax" and that you'll build the system perfectly on the first run.
              </p>
            </div>

            {/* CAUSE & CONSEQUENCE DETAILS */}
            <div className="flex flex-col gap-3.5 mt-3 border-t border-slate-900 pt-3.5">
              <div>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block font-mono">The Cause</span>
                <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                  Systematic estimation bias, high frequency context-switching, and deferring deep deployment integration checks until final delivery hours.
                </p>
              </div>

              <div>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block font-mono">Decisions Made</span>
                <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                  Retained non-essential documentation rewrite tasks; deferred automated regression pipeline setup; accepted three unscheduled teammate check-ins.
                </p>
              </div>

              <div>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block font-mono">Emotional Consequences</span>
                <p className="text-[11px] text-red-300/90 italic mt-0.5 font-sans leading-relaxed">
                  "At midnight, anxiety peaks. Brain enters fatigue fog. Redundant processes overflow connection pools. You experience terminal server crashes, and judges encounter a 504 Gateway error during critical evaluation."
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center">
            <div>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">PROJECT STATE</span>
              <span className="text-lg font-black text-red-500 font-mono uppercase">Timeline Aborted</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">SUCCESS PROBABILITY</span>
              <span className="text-xl font-black text-red-400 font-mono">32%</span>
            </div>
          </div>
        </div>

        {/* SIDE B: TIMELINE SAVED (FUTURE B) */}
        <div className={`p-6 border rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[350px] ${
          selectedTimeline === "saved" 
            ? "bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)] scale-[1.01]" 
            : "bg-slate-900/10 border-slate-900 opacity-45 hover:opacity-75"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black font-mono uppercase tracking-widest text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                Future B: Chronos Recovered
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">ETA: 22:30 Tonight</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Chronos Recovered Timeline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                You trust the descope algorithm and execute the Chronos Recovery Plan. Non-critical features are cataloged and automatically deferred.
              </p>
            </div>

            {/* CAUSE & CONSEQUENCE DETAILS */}
            <div className="flex flex-col gap-3.5 mt-3 border-t border-slate-900 pt-3.5">
              <div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">The Cause</span>
                <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                  Pruning unnecessary tasks, placing 90-minute defensive Focus Shields to prevent calendar drift, and integrating testing ahead of time.
                </p>
              </div>

              <div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">Decisions Made</span>
                <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                  Shelved secondary cosmetic documentation; locked peak morning output slot; validated deployment early during high baseline alertness.
                </p>
              </div>

              <div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block font-mono">Emotional Consequences</span>
                <p className="text-[11px] text-emerald-300/90 italic mt-0.5 font-sans leading-relaxed">
                  "At 22:30, your code is committed and fully verified. You enjoy a relaxed night with family. The evaluation engine runs cleanly, scoring pristine marks. Absolute peace of mind."
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center">
            <div>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">PROJECT STATE</span>
              <span className="text-lg font-black text-emerald-400 font-mono uppercase">Prisinte Launch</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono block">SUCCESS PROBABILITY</span>
              <span className="text-xl font-black text-emerald-400 font-mono">88%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ALIGN TIMELINE CTA */}
      <div className="bg-indigo-950/10 border border-indigo-900/40 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </span>
          <div>
            <span className="text-xs font-black text-white uppercase font-sans">Are you ready to lock in Future B?</span>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Secure your deadline and eliminate stress. Run the descope recovery protocol now.
            </p>
          </div>
        </div>

        {onActivateRecovery && (
          <button
            onClick={onActivateRecovery}
            disabled={isRecoveryActive}
            className={`px-5 py-2.5 rounded-xl text-xs font-black font-mono uppercase tracking-widest transition-all cursor-pointer ${
              isRecoveryActive
                ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-950/40"
            }`}
          >
            {isRecoveryActive ? "Timeline Secured" : "Commit Recovery Plan"}
          </button>
        )}
      </div>

    </div>
  );
}
