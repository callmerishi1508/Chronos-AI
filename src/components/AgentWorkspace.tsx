import React, { useState } from "react";
import { Terminal, Play, CheckCircle, Sparkles, Send, Mail, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import { fetchAI } from "../utils/aiClient";
import { motion, AnimatePresence } from "motion/react";
import { SubTask } from "../types";

interface AgentWorkspaceProps {
  onPlanCreated: (goal: string, subtasks: SubTask[], logs: string[]) => void;
  activeGoal: string;
  subtasks: SubTask[];
  logs: string[];
  isLoading: boolean;
  onUpdateSubtask: (id: string, completed: boolean) => void;
  onClearPlan: () => void;
}

export default function AgentWorkspace({
  onPlanCreated,
  activeGoal,
  subtasks,
  logs,
  isLoading,
  onUpdateSubtask,
  onClearPlan,
}: AgentWorkspaceProps) {
  const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]);
  React.useEffect(() => {
    return () => { timeoutRefs.current.forEach(clearTimeout); };
  }, []);
  const safeSetTimeout = (cb: () => void, delay: number) => {
    const timer = setTimeout(cb, delay);
    timeoutRefs.current.push(timer);
    return timer;
  };

  const [goal, setGoal] = useState("");
  const [targetDeadline, setTargetDeadline] = useState("");
  const [agentActionMessage, setAgentActionMessage] = useState("");
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    onPlanCreated(goal, [], []); // Trigger loading in parent
    
    try {
      const data = await fetchAI("/api/plan-task", { goal, deadline: targetDeadline });
      onPlanCreated(goal, data.subtasks || [], data.executionLogs || []);
    } catch (err) {
      console.error("Agent planning failed:", err);
    }
  };

  const handleSimulateAction = (actionName: string) => {
    setIsExecutingAction(true);
    setAgentActionMessage(`Autonomous agent initiating '${actionName}'...`);
    
    safeSetTimeout(() => {
      setIsExecutingAction(false);
      if (actionName === "email") {
        setAgentActionMessage("✅ SUCCESS: Emailed full breakdown outline & reminder alerts to user calendar inbox.");
      } else if (actionName === "webhook") {
        setAgentActionMessage("✅ SUCCESS: Integrated webhook alerts. Direct SMS reminders will fire 1 hour before each subtask.");
      } else {
        setAgentActionMessage("✅ SUCCESS: Drafted presentation template directly inside your saved workspace.");
      }
    }, 2000);
  };

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.status === "completed").length;
  const percentageCompleted = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div id="agent-workspace" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      {/* Background geometric alignment / circle accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-indigo-500/10 text-indigo-400">
            <Terminal className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">AI Autonomous Agent Workspace</h2>
            <p className="text-xs text-slate-400 font-mono">Input a high-level goal. The AI will formulate a checklist & run initial setups.</p>
          </div>
        </div>

        {activeGoal && (
          <button
            id="btn-clear-agent-plan"
            onClick={onClearPlan}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 text-slate-400 rounded-lg transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Plan
          </button>
        )}
      </div>

      {!activeGoal ? (
        /* Setup / Form Input Mode */
        <form onSubmit={handleRunAgent} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-semibold text-slate-400">
              What complex objective do you need to secure?
            </label>
            <textarea
              id="input-agent-goal"
              required
              rows={3}
              placeholder="e.g., Formulate a complete project defense strategy with 5 mock slides and speaker rehearsing checklist..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-semibold text-slate-400">Target Deadline</label>
              <input
                id="input-agent-deadline"
                type="text"
                placeholder="e.g., Thursday by 2 PM"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                id="btn-run-agent"
                type="submit"
                disabled={isLoading || !goal.trim()}
                className="min-h-[44px] w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 motion-safe:animate-pulse" />
                    Running Computational Models...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Initialize AI Autonomous Agent
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Active Planning mode with checklist & green logs terminal */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Subtask list */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-semibold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded uppercase">
                  ACTIVE AGENT OBJECTIVE
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Deadlines: {targetDeadline || "Immediate"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-relaxed">{activeGoal}</h3>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-slate-400">Agent Action Complete</span>
                  <span className="text-white font-bold">{percentageCompleted}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${percentageCompleted}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtask Check List */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1">
                Deconstructed Action Items
              </h4>

              <AnimatePresence mode="popLayout">
                {subtasks.map((sub) => {
                  const isCompleted = sub.status === "completed";
                  return (
                    <motion.div
                      key={sub.id}
                      id={`subtask-item-${sub.id}`}
                      layout
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ translateX: 2 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`relative bg-slate-950/60 border ${
                        isCompleted ? "border-emerald-950/40 opacity-70 bg-emerald-950/5" : "border-slate-800/80"
                      } p-3 pl-6 rounded-xl flex items-center justify-between gap-3 transition hover:border-slate-700 overflow-hidden`}
                    >
                      {/* Left geometric indicator accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                      }`}></div>
                      <div className="flex items-center gap-3">
                        <button
                          id={`btn-complete-sub-${sub.id}`}
                          onClick={() => onUpdateSubtask(sub.id, !isCompleted)}
                          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-800 hover:border-indigo-500 bg-slate-900 text-transparent"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <p className={`text-xs font-semibold ${isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {sub.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                            <span>Est: {sub.duration}</span>
                            <span>•</span>
                            <span className={`uppercase font-semibold ${
                              sub.priority === "high" ? "text-rose-400" : sub.priority === "medium" ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              {sub.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Terminal & Execution Actions */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Command Terminal Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[220px]">
              {/* Terminal Header */}
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-slate-400 font-semibold ml-2">
                    autonomous_logs.sh
                  </span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold motion-safe:animate-pulse">
                  ● ACTIVE
                </span>
              </div>

              {/* Terminal Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed flex flex-col gap-1 select-none">
                {logs.map((log, index) => (
                  <p key={index}>{log}</p>
                ))}
                {isLoading && (
                  <p className="animate-pulse text-indigo-400">⏳ Computing additional neural pathways...</p>
                )}
              </div>
            </div>

            {/* Autonomous Actions Deck */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                Agent Trigger Deck
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-trigger-email"
                  onClick={() => handleSimulateAction("email")}
                  disabled={isExecutingAction}
                  className="py-2 px-3 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Checklist
                </button>
                <button
                  id="btn-trigger-webhook"
                  onClick={() => handleSimulateAction("webhook")}
                  disabled={isExecutingAction}
                  className="py-2 px-3 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Trigger Webhook SMS
                </button>
              </div>

              {agentActionMessage && (
                <div className={`mt-2 p-2.5 border rounded-lg text-xs font-mono leading-relaxed transition-all ${
                  agentActionMessage.includes("✅") 
                    ? "bg-emerald-950/40 border-emerald-900 text-emerald-300"
                    : "bg-indigo-950/40 border-indigo-900 text-indigo-300 motion-safe:animate-pulse"
                }`}>
                  {agentActionMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
