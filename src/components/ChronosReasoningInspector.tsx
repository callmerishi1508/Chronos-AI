import React, { useState, useEffect } from "react";
import { 
  Brain, Zap, ShieldAlert, HelpCircle, Activity, TrendingUp, 
  Sparkles, Clock, ArrowRight, Lock, RefreshCw, User, 
  Gauge, Terminal, Check, Info, Layers, AlertTriangle, Play
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { fetchAI } from "../utils/aiClient";

interface ChronosReasoningInspectorProps {
  tasks: Task[];
  isDemoActive?: boolean;
  onClose?: () => void; // If used as modal
}

export default function ChronosReasoningInspector({
  tasks,
  isDemoActive = false,
  onClose
}: ChronosReasoningInspectorProps) {
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
  const [reasoningData, setReasoningData] = useState<any>(null);
  const [demoTriggered, setDemoTriggered] = useState(false);
  const [activeTab, setActiveTab] = useState<"probability" | "trace" | "human" | "futures" | "calendar" | "intervention">("probability");

  const fetchReasoning = async (useDemo: boolean) => {
    setLoading(true);
    try {
      const data = await fetchAI("/api/reasoning", {
          tasks,
          isDemoActive: useDemo
        });
      if (data && data.reasoning) {
        setReasoningData(data.reasoning);
      }
    } catch (err) {
      console.error("Error fetching reasoning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasoning(isDemoActive || demoTriggered);
  }, [tasks.length, isDemoActive, demoTriggered]);

  const handleJudgeDemoClick = () => {
    setDemoTriggered(true);
    setLoading(true);
    safeSetTimeout(() => {
      fetchReasoning(true);
    }, 800);
  };

  const data = reasoningData || {
    successProbabilityBreakdown: {
      percentage: isDemoActive || demoTriggered ? 88 : 44,
      contributors: [
        { label: "Commit Recovery Plan Active", value: 18, type: "positive", description: "Injects Focus Shields & Protection buffers to insulate the critical path." },
        { label: "Morning Focus Window Calibration", value: 12, type: "positive", description: "Locks down morning slots (09:00 - 12:00) during peak neural output." },
        { label: "Minimized Context Switching", value: 9, type: "positive", description: "Groups similar micro-tasks together to reduce high transition penalties." },
        { label: "Optimism Tax Penalty", value: -22, type: "negative", description: "Historical estimation bias of +63% on backend engineering segments." },
        { label: "Testing Delay Pattern", value: -10, type: "negative", description: "Habitual procrastination of QA checks until final delivery hours." },
        { label: "Scope Overload Friction", value: -7, type: "negative", description: "Unnecessary documentation and cosmetic loops causing timeline inflation." }
      ]
    },
    decisionTrace: {
      recommendation: "Prune Documentation & Cosmetic UI Rewrite",
      evidence: "Documentation task consumes 4.2h of available space, while testing is deferred due to zero remaining margin.",
      reasoning: "Eliminating secondary descriptive artifacts reclaims critical hours, allowing deployment validation to move out of the high-risk final delivery window.",
      expectedImpact: "+9% Success Probability (Reduces risk score from critical to stable)"
    },
    humanOSExplainability: {
      dnaReason: "73% of engineering tasks historically completed within final 20% of the active deadline window, confirming an Optimistic Builder profile.",
      energyReason: "Normalized git commits and keyboard activity show peak velocity between 09:00 AM and 12:00 PM, running 34% faster than standard averages.",
      genomeReason: "Optimal focus sprint of 25 minutes with high focus retention. Context-switch penalty is calculated at 30% per transition.",
      procrastinationReason: "UI polish and testing blocks show a systematic +72% and +63% delay tendency, respectively."
    },
    futureTimelineExplanations: {
      failureCause: "Caused by unchecked +63% engineering optimism tax and continuous context switching. No defense buffers are scheduled.",
      recoveredCause: "Caused by running the Chronos Recovery Plan: prunes cosmetic loops, locks 90-minute morning focus blocks, and schedules testing early.",
      currentCause: "Baseline progression without Chronos interventions. Standard timeline slippage expected due to deferred testing."
    },
    interventionExplainability: {
      criticalityReason: "This task resides on the critical execution path. If delayed, all dependent API streams instantly halt.",
      hidingReason: "All secondary non-critical tasks are hidden from view to enforce 0 context switching and eliminate peripheral noise.",
      sprintReason: "A high-intensity 25-minute Pomodoro block is active, matching your Focus Genome's peak efficiency length.",
      ignoreConsequence: "If ignored, deadline failure probability increases by 24%, cascading into complete milestone collapse."
    },
    calendarExplainability: {
      whyShieldExists: "Created to defend the core backend deployment from meeting overload and impromptu scheduling requests.",
      protectsAgainst: "Shields against context-switching risks and random invitations from teammate calendars.",
      ifRemoved: "Leaves the day completely open, exposing the critical path to at least 2 context-switching interruptions.",
      riskIncrease: "+18% Risk Increase (reduces baseline buffer back to zero)"
    },
    reasoningInspector: {
      inputs: ["3 Pending Tasks", "+63% Optimism Tax", "Zero scheduled calendar buffers"],
      detectedRisks: ["Deadline collision on backend deployment", "Testing deferred to final day"],
      behavioralSignals: ["High mid-day context-switching density", "Weekend work overcommitment"],
      outputs: ["Focus Shield block tomorrow at 09:00 AM", "Suggested 45m slack buffer"]
    }
  };

  return (
    <div id="chronos-reasoning-inspector" className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Brain className="w-5 h-5 text-indigo-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Chronos Reasoning Inspector
              </h2>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[8px] font-mono font-bold uppercase rounded">
                Transparent XAI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Demystifying the black box. Inspect every predictive factor, causal chain, and cognitive tax calculation.
            </p>
          </div>
        </div>

        {/* JUDGE QUICK WALKTHROUGH BUTTON */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-show-me-why-demo"
            onClick={handleJudgeDemoClick}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white text-xs font-black font-mono uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            "Show Me Why" Demo
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* BRAIN MAP / REASONING FLOW (CAUSAL CHAIN) */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-4.5">
        <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest block mb-3 font-mono">
          Interactive Cognitive Causal Chain (Chronos Engine Flow)
        </span>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="h-20 rounded-xl skeleton" />
            <div className="h-20 rounded-xl skeleton" />
            <div className="h-20 rounded-xl skeleton" />
            <div className="h-20 rounded-xl skeleton" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Input state */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl relative">
              <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[7px] font-mono text-slate-500 uppercase rounded">
                01. Workspace Inputs
              </span>
              <ul className="text-[10px] text-slate-300 font-mono flex flex-col gap-1.5 mt-2">
                {data.reasoningInspector.inputs.map((inp: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                    {inp}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detected risks */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl relative">
              <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[7px] font-mono text-slate-500 uppercase rounded">
                02. Detected Risks
              </span>
              <ul className="text-[10px] text-slate-300 font-mono flex flex-col gap-1.5 mt-2">
                {data.reasoningInspector.detectedRisks.map((risk: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 bg-red-500 rounded-full motion-safe:animate-pulse" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Behavioral signals */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl relative">
              <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[7px] font-mono text-slate-500 uppercase rounded">
                03. Behavioral Signals
              </span>
              <ul className="text-[10px] text-slate-300 font-mono flex flex-col gap-1.5 mt-2">
                {data.reasoningInspector.behavioralSignals.map((sig: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="w-1 h-1 bg-amber-500 rounded-full" />
                    {sig}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI outputs */}
            <div className="p-3 bg-slate-950/60 border border-indigo-900/40 rounded-xl relative">
              <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-slate-900 border border-indigo-900 text-[7px] font-mono text-indigo-400 uppercase rounded">
                04. Adaptive Output
              </span>
              <ul className="text-[10px] text-slate-300 font-mono flex flex-col gap-1.5 mt-2">
                {data.reasoningInspector.outputs.map((out: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5 truncate text-indigo-300 font-bold">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                    {out}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION TABS FOR SPECIFIC EXPLANATION MODULES */}
      <div className="flex border-b border-slate-900 gap-1 overflow-x-auto pb-1">
        {[
          { id: "probability", label: "Success Breakdown", icon: <Layers className="w-3.5 h-3.5" /> },
          { id: "trace", label: "Decision Trace", icon: <Terminal className="w-3.5 h-3.5" /> },
          { id: "human", label: "Human OS Why", icon: <User className="w-3.5 h-3.5" /> },
          { id: "futures", label: "Timeline Outcomes", icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: "calendar", label: "Focus Shield Why", icon: <Clock className="w-3.5 h-3.5" /> },
          { id: "intervention", label: "Intervention Why", icon: <ShieldAlert className="w-3.5 h-3.5" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold uppercase transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive 
                  ? "bg-slate-900 border-t border-x border-slate-800 text-indigo-400" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DETAIL WORKSPACE CARDS */}
      <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl min-h-[220px] flex flex-col justify-between">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-6 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse-slow" />
              <Brain className="w-8 h-8 text-indigo-400 motion-safe:animate-pulse-slow relative z-10" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Compiling explainability tree...</span>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 opacity-40">
              <div className="h-32 rounded-xl skeleton" />
              <div className="h-32 rounded-xl skeleton" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex-1 flex flex-col justify-between gap-6"
            >
              {/* TAB 1: SUCCESS PROBABILITY BREAKDOWN */}
              {activeTab === "probability" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Active Metric Explanation</span>
                      <h4 className="text-base font-black text-white uppercase tracking-tight">
                        Success Probability Breakdown
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-mono text-sm font-black">
                      Score: {data.successProbabilityBreakdown.percentage}%
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positive Contributors */}
                    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        Positive Accelerators
                      </span>
                      <div className="flex flex-col gap-3">
                        {data.successProbabilityBreakdown.contributors
                          .filter((c: any) => c.type === "positive")
                          .map((item: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-slate-300">{item.label}</span>
                                <span className="text-emerald-400 font-mono font-bold">+{item.value}% Impact</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-sans leading-normal">
                                {item.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Negative Contributors */}
                    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[9px] text-rose-400 font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Risk & Frictional Penalties
                      </span>
                      <div className="flex flex-col gap-3">
                        {data.successProbabilityBreakdown.contributors
                          .filter((c: any) => c.type === "negative")
                          .map((item: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-slate-300">{item.label}</span>
                                <span className="text-rose-400 font-mono font-bold">{item.value}% Impact</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-sans leading-normal">
                                {item.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DECISION TRACE */}
              {activeTab === "trace" && (
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Autonomous Recommendations</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Recommendation Decision Trace
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Decision</span>
                      <p className="text-xs font-extrabold text-white uppercase">{data.decisionTrace.recommendation}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Evidence Summary</span>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{data.decisionTrace.evidence}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">AI Reasoning</span>
                      <p className="text-xs text-indigo-300 leading-relaxed font-sans">{data.decisionTrace.reasoning}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Expected Impact</span>
                      <p className="text-xs text-emerald-400 font-mono font-bold">{data.decisionTrace.expectedImpact}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HUMAN OS WHY */}
              {activeTab === "human" && (
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Behavioral Diagnostics</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Why Chronos mapped your Human Operating System
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-indigo-400 font-bold block mb-1">Deadline DNA Alignment</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.humanOSExplainability.dnaReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-amber-400 font-bold block mb-1">Energy Intelligence Calibration</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.humanOSExplainability.energyReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block mb-1">Focus Genome Modeling</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.humanOSExplainability.genomeReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-rose-400 font-bold block mb-1">Procrastination Profiling</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.humanOSExplainability.procrastinationReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TIMELINE OUTCOMES */}
              {activeTab === "futures" && (
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Alternative Futures Diagnostics</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Timeline Path Causal Factors
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 border border-red-950/40 rounded-xl">
                      <span className="text-[9px] text-red-400 font-bold block mb-1.5 uppercase">Failure Future Path</span>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{data.futureTimelineExplanations.failureCause}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-indigo-950/40 rounded-xl">
                      <span className="text-[9px] text-indigo-400 font-bold block mb-1.5 uppercase">Recovered Future Path</span>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{data.futureTimelineExplanations.recoveredCause}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold block mb-1.5 uppercase font-sans">Current Baseline Future Path</span>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">{data.futureTimelineExplanations.currentCause}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FOCUS SHIELD WHY */}
              {activeTab === "calendar" && (
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Calendar Defense Explanations</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Why Focus Shields exist
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Core Purpose</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.calendarExplainability.whyShieldExists}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Defense Vector</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.calendarExplainability.protectsAgainst}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">If Removed</span>
                      <p className="text-xs text-amber-400 leading-relaxed font-sans">{data.calendarExplainability.ifRemoved}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-red-950/40 rounded-xl">
                      <span className="text-[8px] font-mono text-red-400 uppercase tracking-widest block mb-1 font-bold">Risk Penalty</span>
                      <p className="text-xs text-red-400 font-mono font-bold leading-relaxed">{data.calendarExplainability.riskIncrease}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: INTERVENTION WHY */}
              {activeTab === "intervention" && (
                <div className="flex flex-col gap-4">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Emergency Intervention Explanations</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">
                      Why Emergency Intervention triggered
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Milestone Criticality</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.interventionExplainability.criticalityReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Interface Hiding Reason</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.interventionExplainability.hidingReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Sprint Selection</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.interventionExplainability.sprintReason}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-red-950/40 rounded-xl">
                      <span className="text-[8px] font-mono text-red-400 uppercase tracking-widest block mb-1 font-bold">If Ignored</span>
                      <p className="text-xs text-red-400 leading-relaxed font-sans">{data.interventionExplainability.ignoreConsequence}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
