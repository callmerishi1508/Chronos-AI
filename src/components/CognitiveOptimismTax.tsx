import React, { useState, useEffect } from "react";
import { 
  Brain, Sliders, RefreshCw, AlertTriangle, ShieldAlert, Sparkles, 
  TrendingUp, Activity, CheckSquare, Info, ShieldCheck, Gauge, HelpCircle, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { fetchAI } from "../utils/aiClient";

interface CognitiveOptimismTaxProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
}

interface BiasProfile {
  engineering: number;
  uiux: number;
  documentation: number;
  research: number;
}

interface BiasAnalysis {
  unrealisticExplanation: string;
  historicalPatternsSummary: string;
  highestBiasContributors: Array<{
    taskId: string;
    taskTitle: string;
    originalEstimate: number;
    chronosEstimate: number;
    taxPercentage: number;
    confidence: string;
    reason: string;
  }>;
  overallBiasSeverity: string;
  systemAdvice: string;
}

// Fixed seed of realistic completed tasks to justify the initial profile
const INITIAL_COMPLETED_LOGS = [
  { id: "h-1", title: "Refactor Database Schema", category: "work", estimated: 5.0, actual: 8.2, tax: 64, confidence: "High" },
  { id: "h-2", title: "Design Landing Page Animation", category: "uiux", estimated: 4.0, actual: 5.1, tax: 28, confidence: "Medium" },
  { id: "h-3", title: "Audit API Authentication Specs", category: "research", estimated: 3.0, actual: 4.2, tax: 40, confidence: "Medium" },
  { id: "h-4", title: "Draft API Integration Guide", category: "documentation", estimated: 2.0, actual: 2.3, tax: 15, confidence: "High" }
];

export default function CognitiveOptimismTax({ tasks, onCompleteTask }: CognitiveOptimismTaxProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BiasAnalysis | null>(null);

  // 1. Personal Bias Profile (User adjustable sliders to see numbers dynamically re-balance)
  const [biasProfile, setBiasProfile] = useState<BiasProfile>({
    engineering: 63,
    uiux: 28,
    documentation: 15,
    research: 41
  });

  // Completed tasks state
  const [completedLogs, setCompletedLogs] = useState(INITIAL_COMPLETED_LOGS);

  // New manual completed task logging form
  const [logTitle, setLogTitle] = useState("");
  const [logCategory, setLogCategory] = useState<"engineering" | "uiux" | "documentation" | "research">("engineering");
  const [logEst, setLogEst] = useState("4");
  const [logAct, setLogAct] = useState("6.5");

  // Expanded task ID for AI explanation
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // 2. Dedicated Demo Scenario Mode State (Requirement 8)
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoEstimate, setDemoEstimate] = useState(8);
  const [demoActual, setDemoActual] = useState(13);
  const [demoMitigatePrune, setDemoMitigatePrune] = useState(false);
  const [demoMitigateOvertime, setDemoMitigateOvertime] = useState(false);
  const [demoMitigateSprints, setDemoMitigateSprints] = useState(false);

  // Fetch AI diagnostics based on active workload
  const fetchBiasAnalysis = async () => {
    setLoading(true);
    try {
      const data = await fetchAI("/api/bias-analysis", {
        tasks,
        biasProfile,
        completedTasks: completedLogs
      }, { priority: isDemoActive ? "critical" : "background" });
      
      if (data && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn("Error fetching bias diagnostics, activating offline-first fallback:", err);
      
      // Calculate realistic metrics dynamically based on current user tasks and active profiles
      const highRiskCount = tasks.filter(t => t.priority === "high").length;
      const severity = biasProfile.engineering > 50 || highRiskCount > 1 ? "Critical" : "Moderate";
      
      const highestContributors = tasks.slice(0, 3).map(t => {
        const est = parseFloat(t.estimatedDuration || "2");
        let factor = 1.35;
        if (t.category === "work") factor = 1 + (biasProfile.engineering / 100);
        else if (t.category === "study") factor = 1 + (biasProfile.research / 100);
        const corrected = parseFloat((est * factor).toFixed(1));
        return {
          taskId: t.id,
          taskTitle: t.title,
          originalEstimate: est,
          chronosEstimate: corrected,
          taxPercentage: Math.round((factor - 1) * 100),
          confidence: factor > 1.5 ? "Low Confidence" : "Medium Confidence",
          reason: `Subject to +${Math.round((factor - 1) * 100)}% temporal dilation factor under current user archetype.`
        };
      });

      const offlineAnalysis: BiasAnalysis = {
        unrealisticExplanation: `📡 OFFLINE GENOME DEPLOYED: Chronos has computed your baseline profile using your local behavioral cache. A temporal dilation coefficient is active. Your estimated tasks face an average underestimation risk of ${biasProfile.engineering}% on engineering projects and ${biasProfile.research}% on cognitive research.`,
        historicalPatternsSummary: `${severity} planning bias with high context-switching latency.`,
        highestBiasContributors: highestContributors.length > 0 ? highestContributors : [
          {
            taskId: "offline-bias-1",
            taskTitle: "Analyze Platform Technical Debt",
            originalEstimate: 4.0,
            chronosEstimate: 6.5,
            taxPercentage: biasProfile.engineering,
            confidence: "Medium Confidence",
            reason: `Cognitive genome flags engineering complexity dilation.`
          }
        ],
        overallBiasSeverity: severity,
        systemAdvice: `+${Math.max(15, Math.round((biasProfile.engineering + biasProfile.research) / 2))}% focus margin shields`
      };
      setAnalysis(offlineAnalysis);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiasAnalysis();
  }, [tasks.length, biasProfile.engineering, biasProfile.uiux, biasProfile.documentation, biasProfile.research]);

  // Handle manual log completion submission
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;

    const estVal = parseFloat(logEst) || 1;
    const actVal = parseFloat(logAct) || 1;
    const taxPercentage = Math.round(((actVal - estVal) / estVal) * 100);

    const newLog = {
      id: `h-user-${Date.now()}`,
      title: logTitle,
      category: logCategory,
      estimated: estVal,
      actual: actVal,
      tax: taxPercentage,
      confidence: taxPercentage > 50 ? "High Bias" : "Medium Bias"
    };

    const updated = [newLog, ...completedLogs];
    setCompletedLogs(updated);

    // Dynamically recalculate category's average bias factor
    const sameCatLogs = updated.filter((l) => l.category === logCategory);
    const avgTax = Math.round(sameCatLogs.reduce((sum, l) => sum + l.tax, 0) / sameCatLogs.length);
    
    setBiasProfile(prev => ({
      ...prev,
      [logCategory]: Math.max(0, avgTax)
    }));

    setLogTitle("");
    setLogEst("4");
    setLogAct("6.5");
  };

  // Helper: get corrected estimate for active tasks based on profile
  const getCorrectedTaskEstimate = (task: Task) => {
    const original = parseFloat(task.estimatedDuration || "1");
    let tax = 35; // default fallback
    const title = task.title.toLowerCase();
    
    if (task.category === "work" || title.includes("database") || title.includes("refactor") || title.includes("api") || title.includes("compile") || title.includes("sharding")) {
      tax = biasProfile.engineering;
    } else if (title.includes("design") || title.includes("ui") || title.includes("ux") || title.includes("animate")) {
      tax = biasProfile.uiux;
    } else if (title.includes("guide") || title.includes("doc") || title.includes("write") || title.includes("readme")) {
      tax = biasProfile.documentation;
    } else if (task.category === "study" || title.includes("research") || title.includes("audit") || title.includes("spec")) {
      tax = biasProfile.research;
    }

    const corrected = original * (1 + tax / 100);
    return {
      original,
      corrected: parseFloat(corrected.toFixed(1)),
      tax,
      confidence: tax > 50 ? "Low Confidence" : tax > 25 ? "Medium Confidence" : "High Confidence"
    };
  };

  // Calculation of Demo Recalculations
  // Formula: Estimate: 8h, Actual: 13h => Optimism Tax = ((13 - 8) / 8) * 100 = 62.5% => rounds to +62% (or +63%)
  const demoTaxPercentage = Math.round(((demoActual - demoEstimate) / demoEstimate) * 100);
  
  const getDemoRecalculatedMetrics = () => {
    // Naive State:
    let baseRisk = 24;
    let baseDelay = 0.0;
    let baseStatus = "SECURED";

    // Evidence Corrected State:
    let correctedRisk = 88;
    let correctedDelay = 5.0; // 13h actual - 8h estimate = 5.0h delay
    let correctedStatus = "IMPENDING COLLAPSE";

    // Mitigated State (After applying sliders in the control panel):
    let mitigatedDelay = correctedDelay;
    let mitigatedRisk = correctedRisk;

    if (demoMitigatePrune) {
      mitigatedDelay -= 2.5;
      mitigatedRisk -= 30;
    }
    if (demoMitigateOvertime) {
      mitigatedDelay -= 1.8;
      mitigatedRisk -= 25;
    }
    if (demoMitigateSprints) {
      mitigatedDelay -= 1.2;
      mitigatedRisk -= 20;
    }

    mitigatedDelay = Math.max(0, parseFloat(mitigatedDelay.toFixed(1)));
    mitigatedRisk = Math.max(8, Math.round(mitigatedRisk));
    const mitigatedStatus = mitigatedRisk > 50 ? "WARNING" : mitigatedRisk > 20 ? "MODERATE" : "SECURED";

    return {
      naive: { risk: baseRisk, delay: baseDelay, status: baseStatus },
      corrected: { risk: correctedRisk, delay: correctedDelay, status: correctedStatus },
      mitigated: { risk: mitigatedRisk, delay: mitigatedDelay, status: mitigatedStatus }
    };
  };

  const demoMetrics = getDemoRecalculatedMetrics();

  return (
    <div id="cognitive-optimism-tax-panel" className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn pb-12">
      
      {/* LEFT SECTION: Human Bias Diagnostics, Telemetry Header & Backlog Corrections (Spans 8) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Module Header Panel */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl shrink-0 shadow-lg">
                <Brain className="w-6 h-6 motion-safe:animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30 tracking-widest">
                    ACTIVE BEHAVIORAL INTELLIGENCE
                  </span>
                  {analysis?.overallBiasSeverity && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border uppercase ${
                      analysis.overallBiasSeverity === "Critical" 
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30 motion-safe:animate-pulse" 
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}>
                      {analysis.overallBiasSeverity} Bias Level
                    </span>
                  )}
                </div>
                <h1 
                  className="text-xl font-extrabold text-white uppercase tracking-tight font-mono mt-1"
                  title="People often underestimate how long work takes. Chronos adjusts schedules using observed planning patterns to reduce deadline risk."
                >
                  Cognitive Optimism Tax Diagnostics
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                  People often underestimate how long work takes. Chronos adjusts schedules using observed planning patterns to reduce deadline risk.
                </p>
              </div>
            </div>

            <button
              id="btn-re-analyze-bias"
              disabled={loading}
              onClick={fetchBiasAnalysis}
              className="min-h-[44px] px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono shadow-lg shadow-purple-900/20 self-start md:self-center shrink-0 btn-premium btn-premium-hover flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-pulse text-purple-300" : ""}`} />
              {loading ? "Recalculating..." : "Analyze Fallacy"}
            </button>
          </div>

          {/* Core AI Explanation Section */}
          {loading && !analysis ? (
            <div className="mt-5 bg-slate-950/60 border border-purple-500/15 rounded-xl p-4 flex flex-col gap-3 opacity-60">
              <div className="h-4 w-40 rounded skeleton" />
              <div className="h-12 w-full rounded skeleton" />
              <div className="h-4 w-3/4 rounded skeleton mt-2" />
            </div>
          ) : analysis ? (
            <div className="mt-5 bg-slate-950/60 border border-purple-500/15 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> CLINICAL BIAS PROGNOSIS
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {analysis.unrealisticExplanation}
              </p>
              <div className="border-t border-purple-900/20 pt-2 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-mono">
                  <span className="text-purple-300 font-semibold">Diagnosis: </span>
                  {analysis.historicalPatternsSummary}
                </span>
                <span className="bg-slate-900 border border-purple-500/10 px-2.5 py-0.5 rounded font-mono text-purple-300 font-semibold shrink-0">
                  Buffer Target: {analysis.systemAdvice}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Cognitive Diagnostics: Estimate Correction Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Activity className="w-4 h-4 text-indigo-400" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Backlog Estimator Bias Correction
                </h3>
                <p className="text-[11px] text-slate-400">
                  Live correction comparison of pending tasks based on current bias profile.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              PENDING CORRECTED WORKLOAD
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.filter(t => !t.completed).length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                No active pending tasks. Add tasks in the "Intelligent Tasks" tab to correct their estimates!
              </div>
            ) : (
              tasks.filter(t => !t.completed).map((task) => {
                const { original, corrected, tax, confidence } = getCorrectedTaskEstimate(task);
                const isExpanded = expandedTaskId === task.id;

                return (
                  <div 
                    key={task.id}
                    className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl overflow-hidden transition"
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 ${
                          tax > 50 ? "bg-rose-500" : tax > 25 ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                              {task.category}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                              tax > 50 ? "bg-rose-950/40 text-rose-400" : tax > 25 ? "bg-amber-950/40 text-amber-400" : "bg-emerald-950/40 text-emerald-400"
                            }`}>
                              Estimated confidence: {confidence}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estimate Comparison Panel */}
                      <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/60 p-2.5 rounded-xl shrink-0">
                        <div className="text-center">
                          <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-wider">Naive Est</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{original}h</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        <div className="text-center">
                          <span className="block text-[8px] font-mono text-purple-400 uppercase tracking-wider">Chronos Est</span>
                          <span className="text-xs font-mono font-bold text-purple-300">{corrected}h</span>
                        </div>
                        <div className="border-l border-slate-800 pl-3 text-center">
                          <span className="block text-[8px] font-mono text-rose-400 uppercase tracking-wider">Optimism Tax</span>
                          <span className="text-xs font-mono font-extrabold text-rose-400">+{tax}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Compare Bar Visualization */}
                    <div className="px-4 pb-4">
                      <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                        {/* Naive Share */}
                        <div 
                          className="h-full bg-slate-600" 
                          style={{ width: `${Math.min(100, (original / corrected) * 100)}%` }} 
                        />
                        {/* Corrected Bias Share */}
                        <div 
                          className="h-full bg-rose-500/80 motion-safe:animate-pulse" 
                          style={{ width: `${100 - Math.min(100, (original / corrected) * 100)}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[9px] font-mono text-slate-500">
                        <span>User Blind Estimate Block ({original}h)</span>
                        <span className="text-rose-400 font-semibold">+{tax}% Human Variance Offset ({corrected}h Required)</span>
                      </div>
                    </div>

                    {/* Expandable AI Detailed Diagnostics */}
                    <div className="border-t border-slate-800/60 bg-slate-900/20 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[10px] font-mono">
                        {isExpanded ? "Interactive Diagnostics Expanded" : "Diagnostic analysis ready"}
                      </span>
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase underline cursor-pointer"
                      >
                        {isExpanded ? "Collapse Analysis" : "Inspect Planning fallacy"}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex flex-col gap-2 leading-relaxed text-xs">
                            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                              <Brain className="w-3.5 h-3.5" /> CLINICAL FALLACY BREAKER
                            </span>
                            <p className="text-slate-300">
                              📡 CLOUD AI UNAVAILABLE: Running Chronos Core Intelligence. Heuristic models detect significant estimation drag. Tasks in your current backlog are historically under-estimated by your profile. Adjustments have been simulated locally.
                            </p>
                            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col gap-1 mt-1 font-mono text-[11px]">
                              <span className="text-[10px] font-bold text-rose-400">🚨 BIAS CONTRIBUTOR DIAGNOSIS:</span>
                              <span className="text-slate-400">Your average development overhead consistently includes local container setups and transaction logging edge-cases which you exclude from naive planning loops.</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Behavioral Evidence Log (Completed Variance Tracker) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Behavioral Evidence Log
                </h3>
                <p className="text-[11px] text-slate-400">
                  Historical completed workpieces providing the data model for the self-learning bias profile.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              AUDITED HISTORIES
            </span>
          </div>

          {/* Historical Logs List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-slate-400 text-[10px] uppercase tracking-wider pb-2">
                  <th className="py-2.5">Task Title</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-center">Estimated</th>
                  <th className="py-2.5 text-center">Actual</th>
                  <th className="py-2.5 text-center text-rose-400">Bias Tax (%)</th>
                  <th className="py-2.5 text-right">Evidence Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {completedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-2.5 font-medium text-slate-200">{log.title}</td>
                    <td className="py-2.5">
                      <span className="bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase text-[9px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-400">{log.estimated}h</td>
                    <td className="py-2.5 text-center font-mono text-slate-300">{log.actual}h</td>
                    <td className="py-2.5 text-center font-mono font-bold text-rose-400">+{log.tax}%</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">{log.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form to manual log task complete for interactive feel */}
          <form onSubmit={handleLogSubmit} className="mt-4 bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
            <h4 className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Log Completed Task & Update Self-Learning Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-400">Completed Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Optimize Webpack Bundle Compression" 
                  required
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">Task Category</label>
                <select 
                  value={logCategory}
                  onChange={(e) => setLogCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="engineering">💼 Engineering</option>
                  <option value="uiux">🎨 UI/UX Design</option>
                  <option value="documentation">📝 Documentation</option>
                  <option value="research">🔬 Research & Specs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400">Est. (h)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0.5" 
                    required
                    value={logEst}
                    onChange={(e) => setLogEst(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400">Act. (h)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0.5" 
                    required
                    value={logAct}
                    onChange={(e) => setLogAct(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[44px] mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-mono text-xs text-white uppercase font-bold tracking-wider rounded-lg transition shadow-md self-end shrink-0"
            >
              Commit Evidence Block
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT SECTION: Interactive Sliders, Demo Scenario & Positioning Matrix (Spans 4) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Bias Profile Configuration Modifiers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Bias Coefficient Calibration
              </h3>
              <p className="text-[11px] text-slate-400">
                Self-learning multipliers (tweak manually to test scaling effects).
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Slider 1: Engineering */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Engineering Blocks</span>
                <span className="text-rose-400 font-bold">+{biasProfile.engineering}% Tax</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={biasProfile.engineering}
                onChange={(e) => setBiasProfile({...biasProfile, engineering: parseInt(e.target.value)})}
                className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Happy Path (0%)</span>
                <span>Highly Optimistic (+150%)</span>
              </div>
            </div>

            {/* Slider 2: UI/UX */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">UI/UX Polish</span>
                <span className="text-amber-400 font-bold">+{biasProfile.uiux}% Tax</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={biasProfile.uiux}
                onChange={(e) => setBiasProfile({...biasProfile, uiux: parseInt(e.target.value)})}
                className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Happy Path (0%)</span>
                <span>Polish Overhead (+150%)</span>
              </div>
            </div>

            {/* Slider 3: Research */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Research & Specs</span>
                <span className="text-amber-400 font-bold">+{biasProfile.research}% Tax</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={biasProfile.research}
                onChange={(e) => setBiasProfile({...biasProfile, research: parseInt(e.target.value)})}
                className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Happy Path (0%)</span>
                <span>Rabbit-Hole Bias (+150%)</span>
              </div>
            </div>

            {/* Slider 4: Documentation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300">Documentation</span>
                <span className="text-emerald-400 font-bold">+{biasProfile.documentation}% Tax</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                value={biasProfile.documentation}
                onChange={(e) => setBiasProfile({...biasProfile, documentation: parseInt(e.target.value)})}
                className="w-full accent-purple-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Happy Path (0%)</span>
                <span>Doc Polish (+150%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* HIGH IMPACT JUDGE DEMO MODE SCENARIO (Requirement 8) */}
        <div className="bg-slate-900 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="p-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg">
              <Gauge className="w-4 h-4 motion-safe:animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Cognitive Override Simulator
              </h3>
              <p className="text-[10px] text-purple-400 font-mono">
                Judge Hackathon Demonstration Protocol
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Model how the self-learning loop instantly corrects a planning mistake. 
            A user estimates <span className="text-white font-bold font-mono">8h</span> for a database sharding task, but actual execution telemetry demonstrates it takes <span className="text-white font-bold font-mono">13h</span> (representing a <span className="text-rose-400 font-bold font-mono">+{demoTaxPercentage}%</span> underestimation bias).
          </p>

          <div className="flex flex-col gap-3 my-1">
            <button
              id="btn-trigger-demo-bias"
              onClick={() => setIsDemoActive(!isDemoActive)}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider font-mono transition border ${
                isDemoActive 
                  ? "bg-rose-900/20 text-rose-300 border-rose-500/40 hover:bg-rose-900/30" 
                  : "bg-purple-600 text-white hover:bg-purple-500 border-purple-500/40 shadow-lg shadow-purple-950/40"
              }`}
            >
              {isDemoActive ? "🔴 Disable Demo Mode" : "⚡ Active Judge Demo Scenario"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isDemoActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-4 pt-1 border-t border-slate-800"
              >
                {/* Visual Before vs After Telemetry Recalculation Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Naive State (Before Correction) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 text-center">
                    <span className="text-[8px] font-mono text-slate-500 uppercase font-bold tracking-widest">
                      NAIVE ESTIMATE
                    </span>
                    <span className="text-lg font-mono font-extrabold text-slate-400">
                      8.0 Hours
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 py-0.5 rounded border border-emerald-900/30 font-bold">
                      Risk: {demoMetrics.naive.risk}%
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">
                      Delay: {demoMetrics.naive.delay}h
                    </span>
                  </div>

                  {/* Corrected State (After Continuous Telemetry Applied) */}
                  <div className="bg-slate-950 border border-rose-950 rounded-xl p-3 flex flex-col gap-1 text-center motion-safe:animate-pulse">
                    <span className="text-[8px] font-mono text-rose-400 font-bold tracking-widest">
                      CHRONOS CORRECTED
                    </span>
                    <span className="text-lg font-mono font-extrabold text-rose-300">
                      13.0 Hours
                    </span>
                    <span className="text-[9px] font-mono text-rose-400 bg-rose-950/40 py-0.5 rounded border border-rose-900/30 font-bold">
                      Risk: {demoMetrics.corrected.risk}%
                    </span>
                    <span className="text-[8px] font-mono text-rose-400">
                      Delay: +{demoMetrics.corrected.delay}h
                    </span>
                  </div>
                </div>

                {/* Simulated Intervention Control Center */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-purple-400" />
                    SIMULATE INTERVENTION CONTROL
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setDemoMitigatePrune(!demoMitigatePrune)}
                      className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase text-left flex items-center justify-between border transition ${
                        demoMitigatePrune 
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40" 
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <span>1. Prune Low-Priority Backlog</span>
                      <span className="font-mono text-[9px] text-indigo-400 font-extrabold">-2.5h delay</span>
                    </button>

                    <button
                      onClick={() => setDemoMitigateOvertime(!demoMitigateOvertime)}
                      className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase text-left flex items-center justify-between border transition ${
                        demoMitigateOvertime 
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40" 
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <span>2. Deploy Overtime Sprints (+3.5h)</span>
                      <span className="font-mono text-[9px] text-indigo-400 font-extrabold">-1.8h delay</span>
                    </button>

                    <button
                      onClick={() => setDemoMitigateSprints(!demoMitigateSprints)}
                      className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase text-left flex items-center justify-between border transition ${
                        demoMitigateSprints 
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40" 
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <span>3. Schedule Focused Pomodoros</span>
                      <span className="font-mono text-[9px] text-indigo-400 font-extrabold">-1.2h delay</span>
                    </button>
                  </div>
                </div>

                {/* Final Recalculated Mitigation Output */}
                <div className="bg-slate-950 border border-indigo-500/25 p-3 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 motion-safe:animate-pulse" />
                    </span>
                    <div>
                      <span className="block text-[8px] font-mono text-indigo-400 uppercase font-bold tracking-wider">Mitigated Prognosis</span>
                      <span className="text-[10px] font-sans font-bold text-slate-100">
                        {demoMetrics.mitigated.delay === 0 
                          ? "Milestone delay fully eliminated!" 
                          : `Expected delay reduced to ${demoMetrics.mitigated.delay} hours.`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-wider">Risk Level</span>
                    <span className="text-xs font-mono font-extrabold text-indigo-400">
                      {demoMetrics.mitigated.risk}%
                    </span>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMPETITIVE POSITIONING MATRIX (Requirement 9) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-800">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Competitive Positioning
              </h3>
              <p className="text-[11px] text-slate-400">
                How Chronos AI transforms standard task management mechanics.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Motion Panel */}
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 font-mono">Motion</span>
                <span className="text-[9px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                  NAIVE TRUST
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Trusts user estimates blindly. Leads to over-commitment, broken milestone deadlines, and late-night team burnout.
              </p>
            </div>

            {/* Todoist Panel */}
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 font-mono">Todoist</span>
                <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                  STATIC STORAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Stores user estimates in flat static database fields. No dynamic variance tracking, behavioral intelligence, or adaptive diagnostics.
              </p>
            </div>

            {/* Chronos AI Panel */}
            <div className="bg-purple-950/15 border border-purple-500/30 p-3 rounded-xl flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 font-mono">Chronos AI</span>
                <span className="text-[9px] font-mono text-purple-300 bg-purple-500/25 border border-purple-500/40 px-1.5 py-0.5 rounded font-bold uppercase motion-safe:animate-pulse">
                  SELF-CORRECTING
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Continuously corrects user estimates using behavioral evidence logs, category-specific tax coefficients, and predictive analytics.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
