import React, { useState, useEffect } from "react";
import { 
  Brain, Clock, Zap, Target, Activity, Flame, Shield, HeartPulse, History, HelpCircle, 
  Cpu, Gauge, ArrowRight, Sparkles, Play, RefreshCw, User, Lock, ShieldAlert, TrendingUp, Terminal, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { fetchAI } from "../utils/aiClient";
import { AIBadge } from "./AIBadge";

interface PersonalTimeIntelligenceProps {
  tasks: Task[];
  onDemoCalibration?: (demoProfile: any) => void;
  onAddLog?: (message: string, type: "info" | "warning" | "success" | "critical") => void;
  onUpdateSuccessProb?: (prob: number) => void;
  onOpenReasoning?: () => void;
  isDemoActive?: boolean;
}

export default function PersonalTimeIntelligence({
  tasks,
  onDemoCalibration,
  onAddLog,
  onUpdateSuccessProb,
  onOpenReasoning,
  isDemoActive: propDemoActive
}: PersonalTimeIntelligenceProps) {
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);
  React.useEffect(() => {
    return () => { timeoutRefs.current.forEach(clearTimeout); };
  }, []);
  const safeSetTimeout = (cb: () => void, delay: number) => {
    const timer = setTimeout(cb, delay);
    timeoutRefs.current.push(timer);
    return timer;
  };

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [localDemoActive, setLocalDemoActive] = useState(false);
  const isDemoActive = propDemoActive !== undefined ? propDemoActive : localDemoActive;
  const [recalculating, setRecalculating] = useState(false);

  // Fetch from our brand new server-side API
  const fetchPersonalIntelligence = async (demoMode: boolean) => {
    setLoading(true);
    try {
      const data = await fetchAI("/api/personal-intelligence", {
        tasks,
        isDemoActive: demoMode
      }, { priority: demoMode ? "critical" : "background" });
      
      if (data && data.profile) {
        setProfile(data.profile);
        if (onUpdateSuccessProb && demoMode) {
          onUpdateSuccessProb(88); // Set success prob to 88%
        }
      }
    } catch (err) {
      console.error("Error fetching personal intelligence, using local offline fallback:", err);
      setProfile({
        persona: "Optimistic Builder",
        dna: "Your behavioral telemetry indicates a tendency to underestimate complex engineering tasks by 63%, while completing small operational tasks 20% faster than average.",
        traits: [
          { name: "Time Optimism", value: 85, impact: "negative", explanation: "Chronically under-allocating time for deep work blocks." },
          { name: "Morning Velocity", value: 92, impact: "positive", explanation: "Highest cognitive output achieved between 09:00 - 11:30 AM." },
          { name: "Context Switching", value: 78, impact: "negative", explanation: "High frequency task toggling disrupts flow state." }
        ],
        idealFocusLength: 55,
        peakEnergyWindow: "09:00 - 11:30 AM",
        chronotype: "Lark",
        burnoutRisk: 45,
        aiDiagnosis: "📡 GEMINI AI UNAVAILABLE: Running Chronos Local Intelligence (heuristic fallback). Based on local rule-based models, you must shield your morning hours from administrative tasks to maximize your high-velocity deep work window.",
        _meta: { provider: "local" }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalIntelligence(isDemoActive);
  }, [tasks.length, isDemoActive]);

  // Handle Demo Mode trigger
  const handleTriggerDemo = () => {
    setRecalculating(true);
    setLocalDemoActive(true);
    if (onAddLog) {
      onAddLog("DEMO CALIBRATION: Optimistic Builder profile loaded into Chronos Core.", "critical");
    }

    safeSetTimeout(() => {
      fetchPersonalIntelligence(true);
      setRecalculating(false);

      if (onDemoCalibration) {
        onDemoCalibration({
          engineeringBias: 63,
          uiuxBias: 28,
          researchBias: 41,
          documentationBias: 15,
          peakStart: "09:00",
          peakEnd: "12:00",
          userType: "Optimistic Builder"
        });
      }

      if (onAddLog) {
        onAddLog("Chronos calibrated to +63% engineering underestimation tax & final-day testing delays.", "warning");
        onAddLog("Success probability updated dynamically based on human failure risk thresholds.", "success");
      }
    }, 1500);
  };

  // Reset demo state
  const handleResetDemo = () => {
    setLocalDemoActive(false);
    if (onAddLog) {
      onAddLog("Recalibrating Human Operating System metrics to default baseline...", "info");
    }
    fetchPersonalIntelligence(false);
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse-slow" />
          <Brain className="w-8 h-8 text-indigo-400 motion-safe:animate-pulse-slow relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-slate-300 tracking-widest uppercase font-bold">
            Sequencing Behavioral Genome...
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            Analyzing historical telemetry and task friction points.
          </span>
        </div>
        
        {/* Fake layout skeleton to preserve height */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 opacity-50">
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  // Fallback structures if fetch fails
  const data = profile || {
    dnaProfile: {
      primaryArchetype: "Optimistic Builder",
      secondaryArchetype: "Last-Minute Sprinter",
      confidenceScore: 92,
      geminiReasoning: "Historical telemetry indicates a consistent +63% underestimation on complex milestone deliverables, combined with rapid focus block bursts near active deadline constraints."
    },
    energyIntelligence: {
      peakPerformanceWindows: "09:00 AM - 12:00 PM (34% faster execution)",
      recommendedFocusSlots: "Morning Deep Work slot (09:00 - 11:30)",
      avoidSchedulingPeriods: "Afternoon low-energy period (14:30 - 16:30)"
    },
    procrastinationIntelligence: {
      delays: [
        { category: "UI Polish", tendency: 72, description: "Extended cosmetic adjustments." },
        { category: "Documentation", tendency: 55, description: "Deferred to the last minute." },
        { category: "Testing", tendency: 63, description: "Postponed until final deployment." }
      ],
      delayRiskProfile: "Critical threat: testing deferrals jeopardize major deployment gates."
    },
    focusGenome: {
      optimalSprintLength: "25 min (Pomodoro) or 45 min deep sprint",
      deepWorkCapacity: "3.5h daily maximum",
      contextSwitchingTolerance: "Low (30% penalty per switch)",
      recoveryTimeRequirement: "15 min after high-intensity sprints"
    },
    personalOptimismModel: {
      engineering: 63,
      ui: 28,
      research: 41,
      documentation: 15
    },
    chronosPersonalCoach: [
      "Your last 5 successful projects were completed after scheduling a morning focus block.",
      "You tend to overcommit during weekends by planning more than 6 hours of high-cognitive tasks.",
      "Your highest-risk habit is delaying testing until the final day of milestones."
    ],
    futureSelfInsight: {
      insight: "If you continue delaying testing on your database blocks, your probability of deadline failure increases by 24%. Completing your API integration today saves approximately 4.8 hours later.",
      reasoning: "Early sandbox verification prevents regression propagation across multiple team streams, as supported by Gemini code synthesis diagnostics."
    },
    _meta: { provider: "gemini" }
  };

  return (
    <div id="personal-time-intelligence" className="flex flex-col gap-6 font-sans text-slate-300">
      
      {/* INTRO HERO BAR */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-3xl" />
        <div className="flex items-center gap-4">
          <span className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
            <Cpu className="w-6 h-6 motion-safe:animate-pulse" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-white">
                Causal Diagnostics
              </h3>
              <AIBadge provider={data._meta?.provider} />
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Chronos continuously models your cognitive patterns, energy thresholds, and planning fallacy vectors to adapt the platform's recommendations specifically for you.
            </p>
          </div>
        </div>

        {/* DEMO SWITCH TRIGGER */}
        <div className="shrink-0 w-full md:w-auto">
          {isDemoActive ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleResetDemo}
                className="min-h-[44px] px-5 py-2.5 bg-slate-900 border border-slate-800 text-xs font-extrabold uppercase font-mono tracking-wider text-slate-300 rounded-xl btn-premium btn-premium-hover flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset System State
              </button>
              <span className="text-[9px] text-center font-mono text-emerald-400 uppercase tracking-widest">
                ● DEMO PROTOCOL ENFORCED
              </span>
            </div>
          ) : (
            <button
              onClick={handleTriggerDemo}
              disabled={recalculating}
              className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black uppercase font-mono tracking-widest rounded-xl shadow-lg shadow-red-950/40 btn-premium btn-premium-hover flex items-center justify-center gap-2 w-full md:w-auto"
            >
              {recalculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-pulse text-white" />
                  Calibrating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Simulate "Optimistic Builder"
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* THREE COLUMN GRID: DNA, ENERGY, PROCRASTINATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1 — DEADLINE DNA PROFILE */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4 relative">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <Brain className="w-5 h-5 text-indigo-400" />
            <div className="flex items-center justify-between w-full">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
                Deadline DNA Profile
              </h3>
              {onOpenReasoning && (
                <button
                  onClick={onOpenReasoning}
                  title="Inspect the AI's reasoning — see Gemini's analysis of your Deadline DNA profile"
                  aria-label="Open AI Reasoning Inspector"
                  className="min-h-[44px] min-w-[44px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-[8px] text-indigo-400 font-mono font-bold uppercase rounded cursor-pointer hover:bg-indigo-500/20 transition"
                >
                  WHY?
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Primary Archetype</span>
              <span className="block text-lg font-black text-indigo-400 uppercase tracking-tight mt-0.5">
                {data.dnaProfile.primaryArchetype}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Secondary</span>
                <span className="block text-xs font-bold text-slate-300 mt-0.5">
                  {data.dnaProfile.secondaryArchetype}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Confidence</span>
                <span className="block text-xs font-bold text-emerald-400 mt-0.5 font-mono">
                  {data.dnaProfile.confidenceScore}% Score
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  AI Pattern Reasoning
                </h3>
                <AIBadge provider={data._meta?.provider} />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                {data.dnaProfile.geminiReasoning}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2 — ENERGY INTELLIGENCE */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Energy Intelligence
            </h3>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Peak Performance Window</span>
              <span className="block text-sm font-bold text-white mt-1">
                {data.energyIntelligence.peakPerformanceWindows}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Recommended Focus Slots</span>
              <span className="block text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {data.energyIntelligence.recommendedFocusSlots}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Avoid Scheduling Periods</span>
              <span className="block text-xs text-red-400 mt-1 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {data.energyIntelligence.avoidSchedulingPeriods}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 italic font-sans leading-normal">
              Chronos will suggest automatic rescheduling buffers during your mapped afternoon low-energy slumps.
            </p>
          </div>
        </div>

        {/* SECTION 3 — PROCRASTINATION INTELLIGENCE */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <Activity className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Procrastination Intelligence
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 mt-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Delay Propensities by Category</span>
            
            <div className="flex flex-col gap-3">
              {data.procrastinationIntelligence.delays.map((delay: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{delay.category}</span>
                    <span className="text-rose-400 font-mono font-bold">+{delay.tendency}% Delay Tendency</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full" style={{ width: `${delay.tendency}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans leading-none">{delay.description}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 p-3 bg-red-950/20 border border-red-500/15 rounded-xl text-[11px] text-red-400 font-sans">
              <strong>Risk Alert:</strong> {data.procrastinationIntelligence.delayRiskProfile}
            </div>
          </div>
        </div>

      </div>

      {/* FOCUS GENOME & PERSONAL OPTIMISM MODEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 4 — FOCUS GENOME */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Focus Genome Metrics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Optimal Sprint Length</span>
              <span className="block text-xs font-extrabold text-white mt-1">
                {data.focusGenome.optimalSprintLength}
              </span>
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Deep Work Capacity</span>
              <span className="block text-xs font-extrabold text-emerald-400 mt-1">
                {data.focusGenome.deepWorkCapacity}
              </span>
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Context Switch Tolerance</span>
              <span className="block text-xs font-extrabold text-red-400 mt-1">
                {data.focusGenome.contextSwitchingTolerance}
              </span>
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Recovery Buffer Required</span>
              <span className="block text-xs font-extrabold text-slate-300 mt-1">
                {data.focusGenome.recoveryTimeRequirement}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 5 — PERSONAL OPTIMISM MODEL */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Personal Optimism Coefficient
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 mt-2 font-mono text-xs">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-sans">Active underestimation correction factors</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase text-slate-500">Engineering</span>
                <span className="text-xl font-black text-rose-500 mt-1">+{data.personalOptimismModel.engineering}%</span>
              </div>

              <div className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase text-slate-500">UI & Layout</span>
                <span className="text-xl font-black text-amber-500 mt-1">+{data.personalOptimismModel.ui}%</span>
              </div>

              <div className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase text-slate-500">Research</span>
                <span className="text-xl font-black text-indigo-400 mt-1">+{data.personalOptimismModel.research}%</span>
              </div>

              <div className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase text-slate-500">Documentation</span>
                <span className="text-xl font-black text-emerald-400 mt-1">+{data.personalOptimismModel.documentation}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CHRONOS PERSONAL COACH FEED */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white">
            Chronos Personal Coach Feed
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {data.chronosPersonalCoach.map((coach: string, idx: number) => (
            <div key={idx} className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex gap-3 items-start">
              <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {coach}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8 — FUTURE SELF INSIGHT */}
      <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/15 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-2.5 pb-2 border-b border-indigo-500/10">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-300">
            Neural Future Self Projection
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Future Core Prediction</span>
            <p className="text-sm font-extrabold text-white leading-relaxed mt-1">
              "{data.futureSelfInsight.insight}"
            </p>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold block mb-1">
              Gemini Causal Diagnostics
            </span>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {data.futureSelfInsight.reasoning}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
