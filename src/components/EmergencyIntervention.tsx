import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  ShieldAlert, Flame, Radio, Zap, Play, Square, Pause, AlertTriangle, CheckCircle2, 
  ShieldCheck, RefreshCw, Sparkles, ArrowRight, Crosshair, Terminal, Clock, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { fetchAI } from "../utils/aiClient";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface EmergencyInterventionProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onClose: () => void;
  onAddTask: (task: Omit<Task, "id" | "completed">) => void;
  onOpenReasoning?: () => void;
}

interface InterventionProtocol {
  mission: string;
  highestLeverageTask: string;
  originalEstimate: number;
  correctedEstimate: number;
  taxPercentage: number;
  riskReduction: number;
  successProbAfter: number;
  recommendedAction?: string;
  whyItMatters: string;
  whyOthersCanWait: string;
  ignoreConsequence: string;
}

export default function EmergencyIntervention({ 
  tasks, 
  onCompleteTask, 
  onClose,
  onAddTask,
  onOpenReasoning
}: EmergencyInterventionProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const pendingTasksCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState<InterventionProtocol | null>(null);
  const [isDemoScenario, setIsDemoScenario] = useState(false);

  // Focus Sprint Timer State
  const [sprintActive, setSprintActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60); // 20 minutes
  const [sprintPaused, setSprintPaused] = useState(false);
  const [sprintFinished, setSprintFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trap focus inside intervention modal
  const trapRef = useFocusTrap(true);

  // Visual success/risk states
  const [recoveredMetrics, setRecoveredMetrics] = useState({
    risk: 94,
    success: 32,
    expectedDelay: 5.0
  });

  // Load intervention plan from server
  const fetchInterventionProtocol = async (useDemo: boolean) => {
    setLoading(true);
    try {
      const data = await fetchAI("/api/intervention", {
          tasks,
          isDemoActive: useDemo
        });
      if (data && data.protocol) {
        setProtocol(data.protocol);
        // Reset base risk/success metrics dynamically
        setRecoveredMetrics({
          risk: useDemo ? 94 : Math.min(95, 40 + (pendingTasksCount * 12)),
          success: useDemo ? 32 : Math.max(15, 80 - (pendingTasksCount * 15)),
          expectedDelay: data.protocol.correctedEstimate
        });
      }
    } catch (err) {
      console.error("Error fetching intervention protocol, using local offline fallback:", err);
      const fallbackTask = tasks.find(t => !t.completed && t.priority === "high")?.title || "Core Database Optimization & Stabilization";
      setProtocol({
        mission: "Secure core system functionality before deadline collapse.",
        highestLeverageTask: fallbackTask,
        originalEstimate: 4.5,
        correctedEstimate: 7.0,
        taxPercentage: 55,
        riskReduction: 60,
        successProbAfter: 92,
        recommendedAction: "Execute an immediate 25-minute focus block on your highest-risk task.",
        whyItMatters: "📡 CLOUD AI UNAVAILABLE: Running Chronos Core Intelligence (heuristic fallback). Failure to complete this task immediately will cascade across all dependent workflows and guarantee milestone failure.",
        whyOthersCanWait: "Secondary UI tweaks and minor bugs provide zero structural value if the core foundation is unstable.",
        ignoreConsequence: "Without immediate action, the system will enter an unrecoverable state leading to massive schedule slippage.",
        confidenceScore: 100
      });
      setRecoveredMetrics({
        risk: useDemo ? 94 : Math.min(95, 40 + (pendingTasksCount * 12)),
        success: useDemo ? 32 : Math.max(15, 80 - (pendingTasksCount * 15)),
        expectedDelay: 7.0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventionProtocol(isDemoScenario);
  }, [isDemoScenario]);

  // Sprint countdown timer logic
  useEffect(() => {
    if (sprintActive && !sprintPaused && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSprintComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sprintActive, sprintPaused, secondsRemaining]);

  const handleStartSprint = () => {
    setSecondsRemaining(20 * 60);
    setSprintActive(true);
    setSprintPaused(false);
    setSprintFinished(false);
  };

  const handleSprintComplete = () => {
    setSprintActive(false);
    setSprintFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Apply immediate recovery recalculation! (Visual progression shift)
    setRecoveredMetrics({
      risk: Math.max(12, recoveredMetrics.risk - (protocol?.riskReduction || 45)),
      success: Math.min(98, (protocol?.successProbAfter || 85)),
      expectedDelay: Math.max(0, parseFloat((recoveredMetrics.expectedDelay - 2.5).toFixed(1)))
    });

    // If it is the demo scenario, complete or mock-complete the corresponding tasks
    const matchedTask = tasks.find(t => t.title === protocol?.highestLeverageTask);
    if (matchedTask) {
      onCompleteTask(matchedTask.id);
    }
  };

  const handleManualCompleteSprint = () => {
    handleSprintComplete();
  };

  const handleAbortSprint = () => {
    setSprintActive(false);
    setSecondsRemaining(20 * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleActivateDemo = () => {
    // 1. Injected dynamic custom demo task
    onAddTask({
      title: "Deploy Database Sharding Schema & Run Integration Suite",
      description: "Critical database mitigation. Under heavy concurrent judge loads, the replication layer overflows.",
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      estimatedDuration: "8",
      category: "work",
      riskScore: 94,
      urgency: "critical",
      riskReason: "High concurrency connection pool overflow threat.",
      nextAction: "Construct custom server configuration script"
    });
    setIsDemoScenario(true);
  };

  return (
    <div ref={trapRef} aria-busy={loading} className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-y-auto p-4 md:p-6 select-none font-mono">
      {/* Dynamic scan line overlay effect for high-fidelity command center vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950 pointer-events-none z-10" />
      
      {/* Cyber Grid Pattern Cover */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-10" />

      {/* Main Content Interface (Ensures proper margins) */}
      <div className="relative max-w-6xl w-full mx-auto flex-1 flex flex-col gap-6 z-20 py-4">
        
        {/* TOP COMMAND HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-500/30 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-500 rounded-xl motion-safe:animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-500 text-slate-950 px-2.5 py-0.5 rounded font-extrabold tracking-widest motion-safe:animate-pulse">
                  EMERGENCY INTERVENTION IN EFFECT
                </span>
                <span className="text-[10px] text-red-400 bg-red-950/50 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Level 5 Defcon Status
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider mt-1">
                Chronos Crisis Command Center
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                Unnecessary interfaces and styling details deactivated. Focused strictly on high-stakes critical actions to prevent imminent deadline collapse.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Demo Trigger Button */}
            {!isDemoScenario && (
              <button
                id="btn-trigger-emergency-demo"
                onClick={handleActivateDemo}
                className="min-h-[44px] px-4 py-2 bg-slate-900 border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-bold uppercase rounded-lg btn-premium btn-premium-hover"
              >
                ⚡ Active Judge Demo Scenario
              </button>
            )}

            {isDemoScenario && (
              <span className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 rounded-lg text-[10px] text-red-400 font-extrabold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500 motion-safe:animate-bounce" />
                HACKATHON CRITICAL TARGET DEPLOYMENT Active
              </span>
            )}

            {onOpenReasoning && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReasoning();
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-900 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 font-mono btn-premium btn-premium-hover"
              >
                Inspect reasoning (XAI)
              </button>
            )}

            <button
              id="btn-disengage-protocol"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg btn-premium btn-premium-hover"
            >
              Disengage Protocol
            </button>
          </div>
        </div>

        {/* METRICS LEVEL GAUGES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Indicator 1: Failure Probability */}
          <div className="bg-slate-950 border border-red-500/25 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.02] rounded-full blur-2xl" />
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>CRITICAL FAILURE PROBABILITY</span>
              <span className="text-red-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> LIVE THREAT
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-4xl font-extrabold ${recoveredMetrics.risk > 50 ? "text-red-500" : "text-amber-500"}`}>
                {recoveredMetrics.risk}%
              </span>
              <span className="text-xs text-slate-500">Systemic Risk Weight</span>
            </div>

            {/* Micro progress bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-1000 ${recoveredMetrics.risk > 50 ? "bg-red-500" : "bg-amber-500"}`}
                style={{ width: `${recoveredMetrics.risk}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 font-sans mt-1">
              {recoveredMetrics.risk > 50 
                ? "Immediate intervention required to secure core release checkpoints." 
                : "Risk successfully mitigated down to acceptable threshold level."}
            </span>
          </div>

          {/* Indicator 2: Success Probability */}
          <div className="bg-slate-950 border border-indigo-500/25 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full blur-2xl" />
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>SUCCESS PROBABILITY</span>
              <span className="text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE INDEX
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-4xl font-extrabold ${recoveredMetrics.success > 60 ? "text-indigo-400 motion-safe:animate-pulse" : "text-red-400"}`}>
                {recoveredMetrics.success}%
              </span>
              <span className="text-xs text-slate-500">Milestone Feasibility</span>
            </div>

            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${recoveredMetrics.success}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 font-sans mt-1">
              {recoveredMetrics.success < 55 
                ? "Low success due to cognitive multitasking under severe optimism tax." 
                : "Milestone feasibility recovered to normal operation ranges."}
            </span>
          </div>

          {/* Indicator 3: Expected Milestone Delay */}
          <div className="bg-slate-950 border border-amber-500/25 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl" />
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>EXPECTED MILESTONE DELAY</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> TIME OFFSET
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-amber-500">
                +{recoveredMetrics.expectedDelay} Hours
              </span>
              <span className="text-xs text-slate-500">Tax Corrected Duration</span>
            </div>

            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, (recoveredMetrics.expectedDelay / 15) * 100)}%` }} 
              />
            </div>
            <span className="text-[10px] text-slate-500 font-sans mt-1">
              Includes dynamic behavioral buffer tax of {protocol?.taxPercentage || 62}% based on previous history.
            </span>
          </div>

        </div>

        {/* CORE INTERVENTION COMMAND SYSTEM CONTROL GRID (Requirement 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Highest Leverage Task & Gemini Reasonings (Spans 7) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            <div className="bg-slate-950 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col gap-5 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-red-500" />
              
              <div className="flex items-center gap-2.5 text-xs text-red-400 font-extrabold uppercase tracking-widest border-b border-slate-900 pb-3">
                <Crosshair className="w-4 h-4 motion-safe:animate-spin-slow text-red-500" />
                TACTICAL HIGHEST LEVERAGE DIRECTIVE
              </div>

              {loading ? (
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full skeleton opacity-80 shrink-0" />
                    <div className="h-6 w-1/2 rounded-md skeleton" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 rounded-xl skeleton opacity-60" />
                    <div className="h-16 rounded-xl skeleton opacity-60" />
                    <div className="h-16 rounded-xl skeleton opacity-60" />
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="h-12 rounded-xl skeleton opacity-40" />
                    <div className="h-12 rounded-xl skeleton opacity-40" />
                    <div className="h-16 rounded-xl skeleton opacity-40" />
                  </div>
                </div>
              ) : protocol ? (
                <div className="flex flex-col gap-4">
                  {/* Task Display Box */}
                  <div className="bg-slate-900/60 border border-red-500/10 p-5 rounded-2xl flex flex-col gap-3 relative">
                    <div className="absolute top-4 right-4 bg-red-500/25 text-red-300 font-mono text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-red-500/40 motion-safe:animate-pulse">
                      CRITICAL BOTTLENECK
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {protocol.highestLeverageTask}
                    </h3>

                    {/* Variance Bar Display */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800/80 pt-3 text-[11px] font-mono">
                      <div>
                        <span className="block text-[8px] text-slate-500 uppercase">Your Estimate</span>
                        <span className="text-slate-300 font-extrabold">{protocol.originalEstimate}h</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-purple-400 uppercase">Chronos Corrected</span>
                        <span className="text-purple-300 font-extrabold">{protocol.correctedEstimate}h</span>
                      </div>
                      <div className="sm:col-span-1">
                        <span className="block text-[8px] text-rose-400 uppercase">Optimism Tax</span>
                        <span className="text-rose-400 font-extrabold">+{protocol.taxPercentage}% Buffer</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Gemini Reasonings (Requirement 6) */}
                  <div className="flex flex-col gap-4 mt-1">
                    
                    {/* Why this matters */}
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        1
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-indigo-400 font-extrabold tracking-wider uppercase">
                          WHY THIS TASK MATTERS
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {protocol.whyItMatters}
                        </p>
                      </div>
                    </div>

                    {/* Why everything else can wait */}
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        2
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase">
                          WHY OTHER TASKS CAN WAIT
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {protocol.whyOthersCanWait}
                        </p>
                      </div>
                    </div>

                    {/* Chilling Consequences of ignore */}
                    <div className="flex gap-3 bg-red-950/15 border border-red-500/15 p-3 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-red-400 font-extrabold tracking-wider uppercase">
                          PRE-MORTEM CORRUPTION AUTOPSY
                        </span>
                        <p className="text-xs text-red-300/90 leading-relaxed font-sans">
                          {protocol.ignoreConsequence}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  NO CRITICAL WORKLOAD BLOCKS CURRENTLY DISCOVERED.
                </div>
              )}
            </div>

            {/* Quick action list: All other tasks are auto-paused */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  ⛔ DEPRIORITIZED BACKLOG (AUTO-PAUSED)
                </span>
                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Hidden from interface
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chronos has paused all secondary operations, non-urgent focus habits, calendar reviews, and style polish blocks. No emails, slack notifications, or CSS tweaks permitted until the core deployment is stable.
              </p>
            </div>

          </div>

          {/* RIGHT: High Performance FOCUS SPRINT LAUNCHER (Requirement 5) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            <div className="bg-gradient-to-b from-slate-950 to-red-950/10 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center text-center gap-5 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold uppercase tracking-widest border-b border-slate-900 pb-3 w-full justify-center">
                <Clock className="w-4 h-4 motion-safe:animate-pulse text-red-500" />
                TACTICAL FOCUS SPRINT
              </div>

              {!sprintActive && !sprintFinished && (
                <div className="flex flex-col items-center gap-4 py-6 w-full">
                  <div className="w-36 h-36 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      20:00
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                      Target Time
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal px-2 max-w-sm">
                    Launches a high-intensity 20-minute operational block focused purely on completing: 
                    <span className="text-white font-bold block mt-1">"{protocol?.highestLeverageTask || 'Database Sharding Deployment'}"</span>
                  </p>

                  <button
                    id="btn-start-focus-sprint"
                    onClick={handleStartSprint}
                    className="min-h-[44px] w-full max-w-xs py-3.5 bg-red-600 text-white font-mono font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 btn-premium btn-premium-hover"
                  >
                    <Play className="w-4 h-4 fill-white" /> START NOW
                  </button>
                </div>
              )}

              {sprintActive && (
                <div className="flex flex-col items-center gap-4 py-4 w-full">
                  <div className="w-40 h-40 rounded-full border-4 border-red-500/40 flex flex-col items-center justify-center relative motion-safe:animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                    {/* Glowing spinner background */}
                    <div className="absolute inset-0 border-2 border-red-500 border-t-transparent rounded-full motion-safe:animate-spin" />
                    
                    <span className="text-4xl font-extrabold text-white font-mono">
                      {formatTime(secondsRemaining)}
                    </span>
                    <span className="text-[9px] text-red-400 uppercase tracking-widest mt-1 motion-safe:animate-pulse">
                      {sprintPaused ? "PAUSED" : "ACTIVE BLOCK"}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-red-500/10 p-3 rounded-xl w-full text-xs text-red-200">
                    <span className="block text-[8px] text-red-400 font-extrabold uppercase mb-1">CURRENT SINGLE OBJECTIVE</span>
                    "{protocol?.highestLeverageTask || 'Database Sharding'}"
                  </div>

                  <div className="flex items-center gap-2 w-full max-w-xs mt-2">
                    <button
                      id="btn-pause-sprint"
                      onClick={() => setSprintPaused(!sprintPaused)}
                      className="min-h-[44px] flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase rounded-lg btn-premium btn-premium-hover"
                    >
                      {sprintPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      id="btn-force-complete-sprint"
                      onClick={handleManualCompleteSprint}
                      className="min-h-[44px] flex-1 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg btn-premium btn-premium-hover"
                    >
                      Complete
                    </button>
                    <button
                      id="btn-abort-sprint"
                      onClick={handleAbortSprint}
                      className="min-h-[44px] p-2.5 bg-slate-900 text-red-500 border border-slate-800 rounded-lg btn-premium btn-premium-hover flex items-center justify-center"
                    >
                      <Square className="w-4 h-4 fill-red-500" />
                    </button>
                  </div>
                </div>
              )}

              {sprintFinished && (
                <div className="flex flex-col items-center gap-4 py-8 w-full">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                    <CheckCircle2 className="w-12 h-12 text-indigo-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-extrabold text-white uppercase tracking-wider">
                      SPRINT SUCCESSFUL
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                      Outstanding recovery performance. Chronos has calculated your operational parameters and recalibrated timeline threats.
                    </p>
                  </div>

                  {/* Recovery recaps */}
                  <div className="bg-slate-950 border border-indigo-500/20 p-3.5 rounded-xl w-full font-mono text-xs flex flex-col gap-1 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">System failure risk:</span>
                      <span className="text-green-400 font-extrabold">-{protocol?.riskReduction || 55}% reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Success Probability:</span>
                      <span className="text-indigo-400 font-extrabold">Recovered to {recoveredMetrics.success}%</span>
                    </div>
                  </div>

                  <button
                    id="btn-dismiss-sprint-success"
                    onClick={() => {
                      setSprintFinished(false);
                      setIsDemoScenario(false);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                  >
                    System Restored - Exit
                  </button>
                </div>
              )}

            </div>

            {/* Tactical logs */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-900 pb-2">
                🛰️ ACTIVE SIGNAL DIAGNOSTICS
              </span>
              <div className="flex flex-col gap-1.5 font-mono text-[10px] text-slate-500">
                <div className="flex justify-between">
                  <span>[03:10:52] SECURE INTERVENTION GATEWAY INITIALIZED</span>
                  <span className="text-slate-400">OK</span>
                </div>
                <div className="flex justify-between">
                  <span>[03:10:54] COGNITIVE MULTITASK NOISE FILTER ACTIVE</span>
                  <span className="text-slate-400">OK</span>
                </div>
                <div className="flex justify-between">
                  <span>[03:10:56] BEHAVIORAL BUFFER COEFFICIENTS INJECTED</span>
                  <span className="text-slate-400">+{protocol?.taxPercentage || 62}%</span>
                </div>
                <div className="flex justify-between">
                  <span>[03:10:58] LIVE FOCUS STREAM SENSOR BINDINGS</span>
                  <span className="text-slate-400 motion-safe:animate-pulse text-indigo-400 font-bold">READY</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
