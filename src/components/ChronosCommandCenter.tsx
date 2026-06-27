import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSharedState } from "../utils/useSharedState";
import { 
  ShieldAlert, Flame, Radio, Zap, Play, Square, Pause, AlertTriangle, 
  CheckCircle2, ShieldCheck, RefreshCw, Sparkles, ArrowRight, Crosshair, 
  Terminal, Clock, EyeOff, Activity, Layers, Calendar, HelpCircle, AlertCircle,
  Brain, CheckSquare, Sliders, ChevronRight, Lock, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { fetchAI } from "../utils/aiClient";
import CalendarDefenseSystem from "./CalendarDefenseSystem";

interface ChronosCommandCenterProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, "id" | "completed">) => void;
  onAutoScheduleFocusBlocks: (blocks: { title: string; durationMinutes: number; taskId: string }[]) => void;
  onOpenEmergency: () => void;
  onOpenReasoning?: () => void;
  isRecoveryPlanCommitted?: boolean;
  onRecoveryPlanCommitted?: (committed: boolean) => void;
  isEmergencyMode?: boolean;
}

interface InterventionLog {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "success" | "critical";
}

interface AlternateFuture {
  title: string;
  date: string;
  description: string;
  riskValue: number;
  probability: number;
  consequencesOrGains: string;
}

export default function ChronosCommandCenter({
  tasks,
  onCompleteTask,
  onAddTask,
  onAutoScheduleFocusBlocks,
  onOpenEmergency,
  onOpenReasoning,
  isRecoveryPlanCommitted: propRecoveryPlanCommitted,
  onRecoveryPlanCommitted,
  isEmergencyMode = false
}: ChronosCommandCenterProps) {
  // Loading & Data States
  const [loading, setLoading] = useState(false);
  const [missionName, setMissionName] = useSharedState("chronos_cmd_missionName", "Operation Hackathon Final Deadline");
  const [isEditingMission, setIsEditingMission] = useState(false);
  
  // Tactical Metrics (Single Source of Truth)
  const [metrics, setMetrics] = useState({
    failureProb: 74,
    optimismTax: 62,
    concurrencyDebt: 48,
    scopeOverload: 55,
    successProb: 44,
    timeRemaining: "11h 42m"
  });

  // Active future tab selector
  const [activeFuture, setActiveFuture] = useState<"current" | "recovered" | "failure">("recovered");

  // Hover states for radar
  const [activeRadarSector, setActiveRadarSector] = useSharedState<string | null>("chronos_cmd_activeRadarSector", null);

  // Active intervention feed state
  const [interventions, setInterventions] = useState<InterventionLog[]>([
    { id: "1", timestamp: "20:20:12", message: "Chronos Threat Analyzer initialized. Concurrency debt active.", type: "info" },
    { id: "2", timestamp: "20:21:05", message: "Tactical Warning: Under judge concurrency load, response times will degrade.", type: "warning" },
    { id: "3", timestamp: "20:22:15", message: "Chronos detected +62% engineering optimism bias on database components.", type: "critical" },
    { id: "4", timestamp: "20:23:44", message: "Predictive AI recommends immediate 20-min focused sprint on sharding.", type: "success" }
  ]);

  // Recovery Engine parameters for Simulation Slider Hud
  const [simulationParams, setSimulationParams] = useState({
    overtimeHours: 2,
    sprintSessions: 1,
    descopeLow: false,
    deferMedium: false
  });

  const [localRecoveryPlanCommitted, setLocalRecoveryPlanCommitted] = useState(false);
  const isRecoveryPlanCommitted = propRecoveryPlanCommitted !== undefined ? propRecoveryPlanCommitted : localRecoveryPlanCommitted;
  const setIsRecoveryPlanCommitted = (val: boolean) => {
    setLocalRecoveryPlanCommitted(val);
    if (onRecoveryPlanCommitted) {
      onRecoveryPlanCommitted(val);
    }
  };

  // Execution Focus Block State
  const [executionMode, setExecutionMode] = useSharedState("chronos_cmd_executionMode", false);
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [sprintActive, setSprintActive] = useState(false);
  const [sprintPaused, setSprintPaused] = useState(false);
  const [sprintFinished, setSprintFinished] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Task | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resolve highest leverage target if none explicitly loaded
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const primaryTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  // Sync internal metrics based on tasks count & simulation parameters
  useEffect(() => {
    const pendingCount = pendingTasks.length;
    let baseFailure = Math.min(96, Math.max(12, 35 + pendingCount * 12));
    let baseOptimism = 45;
    
    // Check if any work/database tasks exist
    const hasWork = pendingTasks.some(t => t.category === "work" || t.title.toLowerCase().includes("database") || t.title.toLowerCase().includes("refactor"));
    if (hasWork) {
      baseOptimism = 63;
    }

    let baseConcurrency = Math.min(90, Math.max(10, pendingCount * 15));
    let baseScope = Math.min(95, Math.max(15, pendingCount * 10));

    // Apply isRecoveryPlanCommitted impact to the layout
    if (isRecoveryPlanCommitted) {
      baseFailure -= 44;
      baseConcurrency -= 25;
      baseScope -= 15;
    }

    // Apply simulation parameters dynamically to metrics
    if (simulationParams.descopeLow) {
      baseScope -= 25;
      baseFailure -= 15;
    }
    if (simulationParams.deferMedium) {
      baseConcurrency -= 20;
      baseFailure -= 10;
    }
    if (simulationParams.sprintSessions > 0) {
      baseFailure -= (simulationParams.sprintSessions * 8);
      baseOptimism -= (simulationParams.sprintSessions * 5);
    }
    if (simulationParams.overtimeHours > 0) {
      baseFailure -= (simulationParams.overtimeHours * 4);
    }

    // Guard bounds
    const failureProb = Math.max(5, Math.min(98, baseFailure));
    const optimismTax = Math.max(10, Math.min(95, baseOptimism));
    const concurrencyDebt = Math.max(5, Math.min(95, baseConcurrency));
    const scopeOverload = Math.max(5, Math.min(95, baseScope));
    const successProb = Math.max(2, Math.min(99, 100 - failureProb));

    setMetrics({
      failureProb,
      optimismTax,
      concurrencyDebt,
      scopeOverload,
      successProb,
      timeRemaining: pendingCount > 0 ? `${Math.max(1, pendingCount * 2)}h 15m` : "0h 00m"
    });
  }, [tasks, simulationParams, isRecoveryPlanCommitted]);

  // Alternate Futures Data compiled dynamically
  const futures: Record<"current" | "recovered" | "failure", AlternateFuture> = {
    current: {
      title: "Current Baseline Future",
      date: "Midnight Tonight",
      description: "You will experience critical milestone drift. Workload will spill over into the late-night fatigue window.",
      riskValue: metrics.failureProb,
      probability: metrics.failureProb,
      consequencesOrGains: "A cumulative delay of +5.5 hours. Downstream task blocks lock up, reducing the final product's polish score by 35%."
    },
    recovered: {
      title: "Chronos Recovered Path",
      date: "22:30 Tonight (Secure)",
      description: "All critical deliverables completed during peak cognitive performance. Non-essential elements safely shelved.",
      riskValue: Math.max(8, Math.round(metrics.failureProb * 0.3)),
      probability: Math.min(98, 100 - Math.round(metrics.failureProb * 0.3)),
      consequencesOrGains: "Saves +4 hours of uncorrected planning overhead. Eliminates late-night debugging marathons completely."
    },
    failure: {
      title: "Unmitigated Collapse Scenario",
      date: "02:45 AM (Crash State)",
      description: "Severe cognitive fatigue sets in. Attempting to deploy sharding without isolation will result in replica crash.",
      riskValue: Math.min(99, metrics.failureProb + 22),
      probability: Math.min(99, metrics.failureProb + 22),
      consequencesOrGains: "Database cluster saturates connection limit. Judges experience 504 Gateway Timeouts on application evaluation."
    }
  };

  // Start execution pomodoro sprint
  const handleStartFocusSprint = () => {
    const activeTarget = primaryTask || tasks[0];
    if (!activeTarget) {
      // Create a mock task if user has nothing to execute
      onAddTask({
        title: "Deploy Database Sharding Schema & Run Integration Suite",
        description: "Critical database mitigation. Under heavy concurrent loads, the replication layer overflows.",
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "2.5",
        category: "work",
        riskScore: 88,
        urgency: "critical",
        riskReason: "High concurrency connection pool overflow threat.",
        nextAction: "Construct custom server configuration script"
      });
      // The state will pick up the newly created task on next render
    }
    setSelectedObjective(activeTarget || null);
    setSecondsRemaining(20 * 60);
    setSprintActive(true);
    setSprintPaused(false);
    setSprintFinished(false);
    setExecutionMode(true);

    addLogLine("Focused tactical sprint initiated. Distractions blacked out.", "warning");
  };

  // Execution Timer Logic
  useEffect(() => {
    if (executionMode && !sprintPaused && secondsRemaining > 0) {
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
  }, [executionMode, sprintPaused, secondsRemaining]);

  const handleSprintComplete = () => {
    setSprintActive(false);
    setSprintFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Recalibrate and complete task
    if (selectedObjective) {
      onCompleteTask(selectedObjective.id);
      addLogLine(`Tactical Sprint Success: Finished objective '${selectedObjective.title}'`, "success");
    } else {
      addLogLine("Focus sprint completed. Buffer buffer updated.", "success");
    }

    // Complete focus bonus logs
    addLogLine("Chronos recalculation: Failure probability reduced by -15%. Only core paths active.", "info");
  };

  const handleAbortSprint = () => {
    setExecutionMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
    addLogLine("Focus sprint aborted. System integrity re-evaluating.", "critical");
  };

  const _logCounter = React.useRef(0);
  const addLogLine = (message: string, type: "info" | "warning" | "success" | "critical") => {
    const time = new Date().toTimeString().split(" ")[0];
    _logCounter.current += 1;
    setInterventions((prev) => [
      { id: `log-${Date.now()}-${_logCounter.current}`, timestamp: time, message, type },
      ...prev.slice(0, 8)
    ]);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Action Buttons Handlers
  const handleRunRecoveryPlan = async () => {
    setLoading(true);
    addLogLine("Triggered Chronos Intelligence analysis. Compiling real-time descope vectors...", "info");
    try {
      const data = await fetchAI("/api/recovery", { tasks });
      if (data && data.recovery) {
        addLogLine(`Strategy: ${data.recovery.overallStrategy}`, "success");
        addLogLine(`Timeline corrected risk: ${data.recovery.totalTimelineRisk}%`, "info");
        
        // Auto apply some descope logic visually
        setSimulationParams(prev => ({
          ...prev,
          descopeLow: true,
          deferMedium: true
        }));
      }
    } catch (err) {
      // Fallback
      setSimulationParams(prev => ({ ...prev, descopeLow: true }));
      addLogLine("Applied offline Recovery Strategy: Auto-descope non-essential blocks.", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFuture = async () => {
    setLoading(true);
    addLogLine("Scanning alternative future paths with active bias parameters...", "info");
    try {
      const data = await fetchAI("/api/narrative", {
          tasks,
          successProb: metrics.successProb,
          delayHours: 3.5,
          optimismFactor: metrics.optimismTax,
          switchingCost: metrics.concurrencyDebt,
          concurrencyDebt: metrics.concurrencyDebt,
          procrastinationRisk: 40,
          scopeRecommendations: { minimumViablePlan: [], postpone: [], remove: [], criticalPath: [] },
          isDemoActive: false
        });
      if (data && data.narrative) {
        addLogLine(`Simulated Failure Trigger: "${data.narrative.failureFuture.criticalTrigger}"`, "warning");
        addLogLine(`Simulated Saving Grace: "${data.narrative.recoveredFuture.savingGrace}"`, "success");
      }
    } catch (err) {
      addLogLine("Simulated Future Path established: Critical database choke point identified.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitToCalendar = () => {
    if (primaryTask) {
      onAutoScheduleFocusBlocks([
        { title: `[Focus Block] ${primaryTask.title}`, durationMinutes: 45, taskId: primaryTask.id }
      ]);
      addLogLine(`Scheduled high-focus blocks for '${primaryTask.title}' on Focus Agenda.`, "success");
    } else {
      addLogLine("No active targets found to schedule. Add a task to commit.", "warning");
    }
  };

  // Determine threat style
  const getThreatStyle = (failProb: number) => {
    if (failProb > 80) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", badge: "bg-red-500" };
    if (failProb > 55) return { label: "HIGH RISK", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", badge: "bg-orange-500" };
    if (failProb > 30) return { label: "MODERATE", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "bg-amber-500" };
    return { label: "GREEN", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500" };
  };

  const threat = getThreatStyle(metrics.failureProb);

  // SVG coordinate calculator for Radar Radar sectors
  const radarPoints = [
    { name: "Failure Probability", val: metrics.failureProb, x: 0, y: -1 },
    { name: "Optimism Tax", val: metrics.optimismTax, x: 1, y: 0 },
    { name: "Concurrency Debt", val: metrics.concurrencyDebt, x: 0, y: 1 },
    { name: "Scope Overload", val: metrics.scopeOverload, x: -1, y: 0 }
  ];

  const radarSize = 130;
  const radarCenter = 150;

  const getPointsString = () => {
    return radarPoints.map(p => {
      const factor = p.val / 100;
      const rx = radarCenter + p.x * radarSize * factor;
      const ry = radarCenter + p.y * radarSize * factor;
      return `${rx},${ry}`;
    }).join(" ");
  };

  // SECTION 3 & 4 - Cinematic States and Storytelling Outcomes
  let hudBgClass = "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 border-slate-800/80 shadow-2xl";
  let topBarClass = "bg-gradient-to-r from-red-500 via-amber-500 to-indigo-500";
  let statusBannerText = "";
  let outcomeDescriptionText = "Secure your deliverables by shielding the critical execution path from cognitive fatigue.";

  if (isEmergencyMode) {
    hudBgClass = "bg-gradient-to-br from-red-950/30 via-slate-950 to-slate-950 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)] motion-safe:animate-pulse";
    topBarClass = "bg-red-600";
    statusBannerText = "🚨 DEFCON CRISIS PROTOCOL IN EFFECT: COGNITIVE EXHAUSTION SYSTEM BIAS ACTIVE";
    outcomeDescriptionText = "CRITICAL COGNITIVE DEPLETION: System latency high. Initiate direct focus shields to avoid delivery block failure.";
  } else if (!isRecoveryPlanCommitted && metrics.successProb < 50) {
    hudBgClass = "bg-gradient-to-br from-amber-950/20 via-slate-950 to-red-950/20 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)] motion-safe:animate-pulse";
    topBarClass = "bg-gradient-to-r from-red-500 to-amber-500";
    statusBannerText = "⚠️ FUTURE COLLAPSE RISK: PROJECT IS DEVIATING FROM DEADLINE SAFE RANGE";
    outcomeDescriptionText = "At your pace, this project is projected to miss the review deadline by 43 minutes due to database concurrency overload.";
  } else if (isRecoveryPlanCommitted) {
    hudBgClass = "bg-gradient-to-br from-emerald-950/15 via-slate-950 to-indigo-950/10 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]";
    topBarClass = "bg-emerald-500";
    statusBannerText = "🛡️ FUTURE TIMELINE SECURED: RECOVERY COMMITMENT SHIELD IS ACTIVE";
    outcomeDescriptionText = "Chronos has optimized execution lanes. Calendar Recovery actions have reclaimed approximately 5.2 hours of high-performance flow.";
  }

  return (
    <div aria-busy={loading} className="w-full text-slate-100 font-mono select-none relative min-h-screen pb-12">
      {/* Dynamic CRT Scan Line Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0" />

      {/* FULL SCREEN EXECUTION MODE OVERLAY (SECTION 6) */}
      <AnimatePresence mode="wait">
        {executionMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">CHRONOS TACTICAL EXECUTION BLOCKS ACTIVE</span>
            </div>

            <div className="relative max-w-2xl w-full text-center flex flex-col items-center gap-8 z-10">
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-red-400 bg-red-950/80 border border-red-500/30 px-3 py-1 rounded font-extrabold uppercase tracking-widest">
                  Active Objective
                </span>
                <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider leading-relaxed">
                  {selectedObjective ? selectedObjective.title : "Deploy Database Sharding Schema"}
                </h1>
                {selectedObjective?.description && (
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-sans">
                    {selectedObjective.description}
                  </p>
                )}
              </div>

              {/* GIANT COUNTDOWN TIMER */}
              <div className="w-64 h-64 rounded-full border-4 border-red-500/20 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                <div className="absolute inset-0 border-2 border-red-500 border-t-transparent rounded-full motion-safe:animate-spin" style={{ animationDuration: "3s" }} />
                
                <span className="text-6xl font-black text-white leading-none">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-[10px] text-red-400 font-extrabold tracking-widest mt-2 uppercase motion-safe:animate-pulse">
                  {sprintPaused ? "PAUSED" : "FOCUS BURST"}
                </span>
              </div>

              {/* EXPECTED IMPACT READOUTS */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md bg-slate-900/60 border border-red-500/10 p-4 rounded-xl">
                <div className="text-center">
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Expected Success Impact</span>
                  <span className="text-indigo-400 text-lg font-black font-mono">+18% Confidence</span>
                </div>
                <div className="text-center border-l border-slate-800">
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Immediate Failure Mitigation</span>
                  <span className="text-red-400 text-lg font-black font-mono">-35% Risk Reduction</span>
                </div>
              </div>

              {/* TIMELINE CONTROLS */}
              <div className="flex items-center gap-3 w-full max-w-md justify-center">
                <button
                  onClick={() => setSprintPaused(!sprintPaused)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold uppercase rounded-xl transition flex-1"
                >
                  {sprintPaused ? "RESUME" : "PAUSE"}
                </button>
                <button
                  onClick={handleSprintComplete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex-1 shadow-lg shadow-red-950"
                >
                  COMPLETE OBJECTIVE
                </button>
                <button
                  onClick={handleAbortSprint}
                  aria-label="Abort focus sprint"
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-500 border border-slate-800 hover:border-red-500/20 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col gap-6 pt-4">

        {/* SECTION 1 — STREAMLINED ABOVE-THE-FOLD HUD */}
        <div className={`border transition-all duration-500 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden ${hudBgClass}`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${topBarClass}`} />
          
          {statusBannerText && (
            <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black font-mono tracking-wider flex items-center justify-between gap-2 border transition-all duration-500 ${
              isEmergencyMode 
                ? "bg-red-500/10 border-red-500/25 text-red-400 motion-safe:animate-pulse" 
                : !isRecoveryPlanCommitted && metrics.successProb < 50
                ? "bg-amber-500/10 border-amber-500/25 text-amber-400 motion-safe:animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current animate-ping shrink-0" />
                <span>{statusBannerText}</span>
              </div>
              <span className="hidden md:inline text-[9px] text-slate-500 font-mono">ACTIVE DRIFT MATRIX</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* 1. MISSION (xl:col-span-4) */}
            <div className="flex flex-col gap-2 justify-center xl:col-span-4">
              <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-[0.25em] flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5 text-indigo-400 motion-safe:animate-pulse" />
                ACTIVE COMMAND MISSION
              </span>
              {isEditingMission ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    className="bg-slate-900 border border-indigo-500/40 text-white text-lg font-bold font-mono px-3 py-1.5 rounded-lg focus:outline-none w-full"
                  />
                  <button
                    onClick={() => setIsEditingMission(false)}
                    className="px-3 py-1 bg-indigo-600 text-white font-mono text-xs rounded cursor-pointer shrink-0"
                  >
                    SAVE
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 group">
                  <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                    {missionName}
                  </h1>
                  <button
                    onClick={() => setIsEditingMission(true)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-300 text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    [EDIT]
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                {outcomeDescriptionText}
              </p>
            </div>

            {/* 2. HUMAN OS — BEHAVIORAL GENOME (xl:col-span-3) */}
            <div className="p-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col justify-between gap-3 xl:col-span-3 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-1.5 bg-indigo-500/15 rounded-bl-lg">
                <Brain className="w-3.5 h-3.5 text-indigo-400 motion-safe:animate-pulse" />
              </div>
              <div>
                <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono block">● HUMAN OS GENOME</span>
                <span className="text-sm font-black text-white uppercase font-sans mt-0.5 block">Optimistic Builder</span>
              </div>
              <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 mt-1 border-t border-slate-900 pt-2">
                <div className="flex justify-between">
                  <span>ENGINEERING BIAS:</span>
                  <span className="text-amber-400 font-bold">+63%</span>
                </div>
                <div className="flex justify-between">
                  <span>TESTING DELAY RISK:</span>
                  <span className="text-red-400 font-bold">+54%</span>
                </div>
                <div className="flex justify-between">
                  <span>PEAK FOCUS:</span>
                  <span className="text-emerald-400">9AM–12PM</span>
                </div>
                <div className="flex justify-between">
                  <span>CONFIDENCE:</span>
                  <span className="text-indigo-400 font-bold">87%</span>
                </div>
              </div>
            </div>

            {/* 3. SUCCESS PROBABILITY & THREAT (xl:col-span-2) */}
            <div className="flex flex-col sm:flex-row xl:flex-col gap-3 justify-center xl:col-span-2">
              {/* Success Probability */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col justify-center items-center gap-1 text-center relative group flex-1">
                <div className="flex items-center justify-between w-full gap-2 px-1">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">SUCCESS PROB</span>
                  {onOpenReasoning && (
                    <button
                      onClick={onOpenReasoning}
                      disabled={loading}
                      title="Inspect the AI's reasoning — see how Gemini calculated this score"
                      aria-label="Open AI Reasoning Inspector"
                      className="min-h-[44px] min-w-[44px] text-[9px] font-mono font-bold text-indigo-400 hover:text-indigo-300 transition uppercase cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      [WHY?]
                    </button>
                  )}
                </div>
                <span className={`text-3xl font-black tracking-tight ${metrics.successProb < 50 ? "text-red-400" : metrics.successProb < 75 ? "text-amber-400" : "text-emerald-400"}`}>
                  {metrics.successProb}%
                </span>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">ESTIMATION MODEL</span>
              </div>

              {/* Threat Level */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col justify-center items-center gap-1 text-center relative group flex-1">
                <div className="flex items-center justify-between w-full gap-2 px-1">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">THREAT</span>
                  {onOpenReasoning && (
                    <button
                      onClick={onOpenReasoning}
                      disabled={loading}
                      title="Inspect the AI's reasoning — see how Gemini calculated this threat level"
                      aria-label="Open AI Reasoning Inspector"
                      className="min-h-[44px] min-w-[44px] text-[9px] font-mono font-bold text-amber-400 hover:text-amber-300 transition uppercase cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      [WHY?]
                    </button>
                  )}
                </div>
                <span className={`text-2xl font-black tracking-tight uppercase ${threat.color}`}>
                  {threat.label}
                </span>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">COGNITIVE INDEX</span>
              </div>
            </div>

            {/* 4. CRITICAL ACTION (xl:col-span-3) */}
            <div className="p-5 bg-red-500/[0.02] border border-red-500/20 rounded-2xl flex flex-col justify-between gap-3 xl:col-span-3">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[8px] text-red-400 font-extrabold uppercase tracking-widest font-mono block">CRITICAL MITIGATION REQUIRED</span>
                  <span className="text-xs font-black text-white uppercase font-sans mt-0.5 block">Prune Documentation & Defer Secondary Features</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-normal">
                Prunes non-critical task friction. Saves ~4.2 hours of delivery overhead and instantly boosts success probability by +44%.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunRecoveryPlan}
                  disabled={isRecoveryPlanCommitted || loading}
                  className={`min-h-[44px] px-4 py-2 text-[10px] font-black font-mono uppercase tracking-wider rounded-lg transition-all flex-1 text-center cursor-pointer ${
                    isRecoveryPlanCommitted || loading
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 pointer-events-none opacity-50" 
                      : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40"
                  }`}
                >
                  {loading ? "Generating..." : isRecoveryPlanCommitted ? "✓ Recovery Plan Committed" : "Apply Critical Recovery Plan"}
                </button>
                {onOpenReasoning && (
                  <button
                    onClick={onOpenReasoning}
                    disabled={loading}
                    className="min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition font-mono uppercase cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Why?
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SECONDARY SYSTEM OVERVIEW METRICS (Moved below above-the-fold block) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-4">
          <div className="flex flex-col gap-0.5 text-center sm:text-left">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">MISSION TIME REMAINING</span>
            <span className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Clock className="w-4 h-4 text-slate-400" />
              {metrics.timeRemaining}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-900 pl-4 text-center sm:text-left">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">PENDING TASKS</span>
            <span className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Layers className="w-4 h-4 text-slate-400" />
              {pendingTasks.length} Blocks
            </span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-900 pl-4 text-center sm:text-left">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">CONCURRENCY DEBT</span>
            <span className="text-sm font-bold text-slate-300 tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Zap className="w-4 h-4 text-amber-500" />
              {metrics.concurrencyDebt}%
            </span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-900 pl-4 text-center sm:text-left">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">COGNITIVE BIAS TAX</span>
            <span className="text-sm font-bold text-slate-300 tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              <Brain className="w-4 h-4 text-indigo-400" />
              {metrics.optimismTax}%
            </span>
          </div>
        </div>

        {/* MAIN HUD INTERACTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: THREAT RADAR VISUALIZER (SECTION 2 - SPANS 5) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-5 relative overflow-hidden shadow-xl min-h-[420px] justify-center">
              <div className="absolute top-4 left-6 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-slate-400 motion-safe:animate-spin-slow" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">THREAT PROFILE SCANNER</span>
              </div>

              {/* DYNAMIC RADAR VISUALIZATION */}
              <div className="relative w-[300px] h-[300px] flex items-center justify-center mt-4">
                
                {/* Background Radar Rings */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                  {/* Outer ring */}
                  <circle cx="150" cy="150" r={radarSize} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  {/* Middle rings */}
                  <circle cx="150" cy="150" r={radarSize * 0.75} fill="none" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="150" cy="150" r={radarSize * 0.5} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="150" cy="150" r={radarSize * 0.25} fill="none" stroke="#1e293b" strokeWidth="1" />
                  
                  {/* Diagonal Axes */}
                  <line x1={150 - radarSize} y1="150" x2={150 + radarSize} y2="150" stroke="#1e293b" strokeWidth="1" />
                  <line x1="150" y1={150 - radarSize} x2="150" y2={150 + radarSize} stroke="#1e293b" strokeWidth="1" />

                  {/* Sweep Scanning Vector Overlay */}
                  <g className="animate-spin" style={{ animationDuration: "8s", transformOrigin: "150px 150px" }}>
                    <line x1="150" y1="150" x2={150 + radarSize} y2="150" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1.5" />
                    <polygon points={`150,150 ${150 + radarSize},150 ${150 + radarSize * 0.96},130`} fill="url(#sweepGrad)" />
                  </g>

                  {/* Poly-glowing Radar Threat Contour Graph */}
                  <polygon 
                    points={getPointsString()} 
                    fill="rgba(239, 68, 68, 0.12)" 
                    stroke="#ef4444" 
                    strokeWidth="2.5" 
                    className="transition-all duration-700 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(239,68,68,0)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0.18)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Hover Targets overlay */}
                {radarPoints.map((p, idx) => {
                  const factor = p.val / 100;
                  const rx = radarCenter + p.x * radarSize * factor;
                  const ry = radarCenter + p.y * radarSize * factor;
                  return (
                    <button
                      key={p.name}
                      onMouseEnter={() => setActiveRadarSector(p.name)}
                      onMouseLeave={() => setActiveRadarSector(null)}
                      className="absolute min-h-[44px] min-w-[44px] p-2 bg-slate-900 border border-red-500 rounded-full focus:outline-none transition-transform duration-300 hover:scale-125 z-10 flex items-center justify-center cursor-help shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      style={{
                        left: `${rx - 12}px`,
                        top: `${ry - 12}px`,
                        width: "24px",
                        height: "24px"
                      }}
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    </button>
                  );
                })}

                {/* Radar HUD label indices */}
                <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Failure Prob</span>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Optimism</span>
                <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Concurrency</span>
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Scope load</span>
              </div>

              {/* DYNAMIC RADAR METRICS LEGEND */}
              <div className="w-full grid grid-cols-2 gap-3 mt-2 text-[11px]">
                <div 
                  className={`p-2 rounded-lg border transition ${activeRadarSector === "Failure Probability" ? "bg-red-950/20 border-red-500/40" : "bg-slate-900/40 border-slate-800/80"}`}
                >
                  <span className="block text-[8px] text-slate-500 uppercase font-mono">FAILURE RISK</span>
                  <span className="text-red-400 font-extrabold">{metrics.failureProb}% Project Drift</span>
                </div>
                <div 
                  className={`p-2 rounded-lg border transition ${activeRadarSector === "Optimism Tax" ? "bg-red-950/20 border-red-500/40" : "bg-slate-900/40 border-slate-800/80"}`}
                >
                  <span className="block text-[8px] text-purple-400 uppercase font-mono">OPTIMISM TAX</span>
                  <span className="text-purple-300 font-extrabold">+{metrics.optimismTax}% Delay Tax</span>
                </div>
                <div 
                  className={`p-2 rounded-lg border transition ${activeRadarSector === "Concurrency Debt" ? "bg-red-950/20 border-red-500/40" : "bg-slate-900/40 border-slate-800/80"}`}
                >
                  <span className="block text-[8px] text-amber-400 uppercase font-mono">CONCURRENCY DEBT</span>
                  <span className="text-amber-300 font-extrabold">{metrics.concurrencyDebt}% Multitasking</span>
                </div>
                <div 
                  className={`p-2 rounded-lg border transition ${activeRadarSector === "Scope Overload" ? "bg-red-950/20 border-red-500/40" : "bg-slate-900/40 border-slate-800/80"}`}
                >
                  <span className="block text-[8px] text-indigo-400 uppercase font-mono">SCOPE OVERLOAD</span>
                  <span className="text-indigo-300 font-extrabold">{metrics.scopeOverload}% Capacity</span>
                </div>
              </div>
            </div>

            {/* LIVE TACTICAL COMMAND PARAMETERS HUD */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest border-b border-slate-800/60 pb-2">
                🎛️ COMMAND TUNING CONSOLE
              </span>
              
              <div className="flex flex-col gap-3 font-sans text-xs text-slate-300">
                
                {/* Descope Non-Essential */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white text-[11px] uppercase">Shelve Non-Essential Scope</span>
                    <span className="text-[10px] text-slate-500">Deactivates low-priority features to recover planning buffers.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulationParams.descopeLow}
                    onChange={(e) => setSimulationParams(p => ({ ...p, descopeLow: e.target.checked }))}
                    className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Defer Medium Priority */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-white text-[11px] uppercase">Defer Medium Priority</span>
                    <span className="text-[10px] text-slate-500">Postpone secondary deliverables into post-milestone stage.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulationParams.deferMedium}
                    onChange={(e) => setSimulationParams(p => ({ ...p, deferMedium: e.target.checked }))}
                    className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Focus Sprints Session Count slider */}
                <div className="flex flex-col gap-1 border-t border-slate-900 pt-3">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-white uppercase font-bold">Planned Focus Sprints</span>
                    <span className="text-indigo-400 font-bold">{simulationParams.sprintSessions} Blocks (20m ea)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={simulationParams.sprintSessions}
                    onChange={(e) => setSimulationParams(p => ({ ...p, sprintSessions: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT: TACTICAL COMMAND DECISIONS & TIMELINE (SPANS 7) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* SECTION 4 — COMMAND ACTIONS */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest border-b border-slate-800/60 pb-2">
                ⚡ CRITICAL PATH ACTIONS
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* START FOCUS SPRINT */}
                <button
                  onClick={handleStartFocusSprint}
                  className="p-5 bg-gradient-to-br from-indigo-900/40 to-slate-950 hover:from-indigo-900/60 hover:to-slate-900 border border-indigo-500/30 hover:border-indigo-400 text-left rounded-2xl transition group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/[0.04] rounded-full blur-xl" />
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">
                    <Target className="w-4 h-4 text-indigo-400 group-hover:animate-bounce" />
                    START FOCUS SPRINT
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Instantly quarantine all distractors and execute a 20-minute hyper-focus burst on your highest priority backlog bottleneck.
                  </p>
                </button>

                {/* RUN RECOVERY PLAN */}
                <button
                  onClick={handleRunRecoveryPlan}
                  className="p-5 bg-gradient-to-br from-amber-950/40 to-slate-950 hover:from-amber-950/60 hover:to-slate-900 border border-amber-500/30 hover:border-amber-400 text-left rounded-2xl transition group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.04] rounded-full blur-xl" />
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
                    RUN RECOVERY PLAN
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Trigger the intelligent descope recovery algorithm to secure buffers, re-weight planning biases, and reclaim lost timelines.
                  </p>
                </button>

                {/* SIMULATE FUTURE PATHS */}
                <button
                  onClick={handleSimulateFuture}
                  className="p-5 bg-gradient-to-br from-purple-950/40 to-slate-950 hover:from-purple-950/60 hover:to-slate-900 border border-purple-500/30 hover:border-purple-400 text-left rounded-2xl transition group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.04] rounded-full blur-xl" />
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    SIMULATE FUTURE
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Run predictive future autopsy reports to forecast how cognitive overload and concurrency debt will impact tonight's release.
                  </p>
                </button>

                {/* COMMIT FOCUS BLOCKS TO CALENDAR */}
                <button
                  onClick={handleCommitToCalendar}
                  className="p-5 bg-gradient-to-br from-emerald-950/40 to-slate-950 hover:from-emerald-950/60 hover:to-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-left rounded-2xl transition group relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.04] rounded-full blur-xl" />
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    COMMIT TO AGENDA
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Synchronize your optimized focus block timeline directly with the Focus Agenda calendar view to guarantee implementation slot.
                  </p>
                </button>

              </div>
            </div>

            {/* SECTION 5 — FUTURE TIMELINE */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  🔮 TIMELINE PREDICTOR & ALTERNATE FUTURES
                </span>
                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" /> Real-time Simulation Engine
                </span>
              </div>

              {/* Instant Switch tabs */}
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-900/40 p-1 rounded-xl border border-slate-800/80">
                {[
                  { id: "recovered", label: "Recovered Future", color: "text-emerald-400", dot: "bg-emerald-400" },
                  { id: "current", label: "Current Timeline", color: "text-amber-400", dot: "bg-amber-400" },
                  { id: "failure", label: "Failure Autopsy", color: "text-red-400", dot: "bg-red-400" }
                ].map((f) => {
                  const isActive = activeFuture === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFuture(f.id as any)}
                      className={`min-h-[44px] flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isActive 
                          ? "bg-slate-800/80 text-white border border-slate-700/60 shadow-lg" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${f.dot} ${isActive ? 'animate-pulse' : 'opacity-40'}`} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Future Readout details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFuture}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{futures[activeFuture].title}</span>
                      {onOpenReasoning && (
                        <button
                          onClick={onOpenReasoning}
                          disabled={loading}
                          title="Inspect the AI's reasoning — see Gemini's full justification for this future scenario"
                          aria-label="Open AI Reasoning Inspector"
                          className="min-h-[44px] min-w-[44px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[8px] text-indigo-400 font-mono font-bold rounded cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        >
                          WHY?
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{futures[activeFuture].date}</span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {futures[activeFuture].description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3 text-[11px] font-mono">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">TIMELINE RISK WEIGHT</span>
                      <span className={`font-black ${activeFuture === 'failure' ? 'text-red-400' : activeFuture === 'recovered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {futures[activeFuture].riskValue}% Threat Density
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">PROBABILITY MATRIX</span>
                      <span className="text-slate-300 font-extrabold">{futures[activeFuture].probability}% Confidence Index</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex gap-2.5 items-start">
                    <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${activeFuture === 'failure' ? 'text-red-500' : activeFuture === 'recovered' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Autopsy Outcome Summary</span>
                      <p className="text-xs text-slate-300/90 font-sans leading-relaxed">
                        {futures[activeFuture].consequencesOrGains}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* SECTION 3 — ACTIVE INTERVENTION FEED (Live intelligence stream) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest border-b border-slate-800/60 pb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 motion-safe:animate-pulse text-indigo-500" />
                ACTIVE INTELLIGENCE LOG STREAM
              </span>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {interventions.map((log) => {
                    const typeColor = 
                      log.type === "critical" ? "text-red-400 bg-red-950/30 border-red-500/20" :
                      log.type === "warning" ? "text-amber-400 bg-amber-950/30 border-amber-500/20" :
                      log.type === "success" ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20" :
                      "text-slate-300 bg-slate-900/40 border-slate-800/80";

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`p-3 rounded-xl border text-[11px] flex gap-2 items-start ${typeColor}`}
                      >
                        <span className="text-[9px] text-slate-500 font-mono shrink-0 mt-0.5">[{log.timestamp}]</span>
                        <div className="flex-1 font-mono leading-relaxed">
                          {log.message}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>

        {/* GOOGLE CALENDAR DEFENSE & SYNCHRONIZATION HUD */}
        <div className="mt-8">
          <CalendarDefenseSystem 
            tasks={tasks}
            onAutoScheduleFocusBlocks={onAutoScheduleFocusBlocks}
            onOpenReasoning={onOpenReasoning}
            onUpdateSuccessProb={(prob) => {
              setIsRecoveryPlanCommitted(prob === 88);
            }}
            onAddLog={(msg, type) => {
              const timeStr = new Date().toTimeString().split(' ')[0];
              setInterventions(prev => [
                { id: `log-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, timestamp: timeStr, message: msg, type },
                ...prev
              ]);
            }}
            onPlanCommitted={() => {
              setIsRecoveryPlanCommitted(true);
            }}
          />
        </div>

      </div>
    </div>
  );
}
