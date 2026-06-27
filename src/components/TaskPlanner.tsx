import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Check, Trash2, ShieldAlert, Sparkles, Clock, Calendar, 
  Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Flame, Filter, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";

interface TaskPlannerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "completed">) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onPrioritizeBacklog: () => void;
  isPrioritizing: boolean;
  activeFocusTask: Task | null;
  setActiveFocusTask: (task: Task | null) => void;
}

export default function TaskPlanner({
  tasks,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  onPrioritizeBacklog,
  isPrioritizing,
  activeFocusTask,
  setActiveFocusTask,
}: TaskPlannerProps) {
  // Local state for the add task form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [estimatedDuration, setEstimatedDuration] = useState("1");
  const [category, setCategory] = useState<Task["category"]>("work");
  const [isAdding, setIsAdding] = useState(false);

  // Filtering
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("pending");

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes by default
  const [timerActive, setTimerActive] = useState(false);
  const [timerSessionCompleted, setTimerSessionCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      setTimerSessionCompleted(true);
      if (activeFocusTask) {
        // Automatically reward user
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, activeFocusTask]);

  const handleStartTimer = (task: Task) => {
    setActiveFocusTask(task);
    setTimerSeconds(300); // Reset to 5 mins
    setTimerActive(true);
    setTimerSessionCompleted(false);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    onAddTask({
      title,
      description,
      deadline,
      priority,
      estimatedDuration,
      category,
    });

    setTitle("");
    setDescription("");
    setDeadline("");
    setPriority("medium");
    setEstimatedDuration("1");
    setCategory("work");
    setIsAdding(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterStatus === "pending" && t.completed) return false;
      if (filterStatus === "completed" && !t.completed) return false;
      return true;
    });
  }, [tasks, filterCategory, filterPriority, filterStatus]);

  return (
    <div id="task-planner" className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Task List and Controls (Left / Spans 8) */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Task Backlog & Action items</h2>
              <p className="text-xs text-slate-400">Add tasks and run AI prioritization to find critical deadlines.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-task-trigger"
              onClick={() => setIsAdding(!isAdding)}
              className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg border border-slate-700 btn-premium btn-premium-hover flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              New Task
            </button>
            <button
              id="btn-prioritize-backlog"
              onClick={onPrioritizeBacklog}
              disabled={isPrioritizing || tasks.length === 0}
              className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg border border-indigo-500/30 btn-premium btn-premium-hover flex items-center gap-1.5 font-mono shadow-md shadow-indigo-900/20"
            >
              {isPrioritizing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300 motion-safe:animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  AI Prioritize Backlog
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add Task Form Collapsible */}
        <AnimatePresence mode="wait">
          {isAdding && (
            <motion.form
              id="form-add-task"
              onSubmit={handleFormSubmit}
              initial={{ height: 0, opacity: 0, y: -15 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl overflow-hidden relative"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Create Task</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-semibold text-slate-400">Task Title *</label>
                  <input
                    id="input-task-title"
                    type="text"
                    required
                    placeholder="e.g., Complete AI Hackathon Submission"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-semibold text-slate-400">Deadline Date & Time *</label>
                  <input
                    id="input-task-deadline"
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-semibold text-slate-400">Task Description</label>
                <textarea
                  id="input-task-description"
                  placeholder="List major requirements, link reference documents or describe files..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-semibold text-slate-400">Base Priority</label>
                  <select
                    id="input-task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-semibold text-slate-400">Est. Effort (Hours)</label>
                  <input
                    id="input-task-duration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-semibold text-slate-400">Category</label>
                  <select
                    id="input-task-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition"
                  >
                    <option value="work">💼 Work</option>
                    <option value="study">🎓 Study</option>
                    <option value="personal">🏡 Personal</option>
                    <option value="finance">💰 Finance</option>
                    <option value="health">❤️ Health</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-task"
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md shadow-indigo-950"
                >
                  Create Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-mono">Filter by:</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">📁 All Categories</option>
              <option value="work">💼 Work</option>
              <option value="study">🎓 Study</option>
              <option value="personal">🏡 Personal</option>
              <option value="finance">💰 Finance</option>
              <option value="health">❤️ Health</option>
            </select>

            {/* Priority Filter */}
            <select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">📶 All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Status Tabs */}
            <div className="flex border border-slate-800 rounded p-0.5 bg-slate-900">
              <button
                type="button"
                onClick={() => setFilterStatus("pending")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  filterStatus === "pending" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  filterStatus === "completed" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                  filterStatus === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List Container */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/40 border border-slate-800/40 border-dashed rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
                <div className="p-4 rounded-full bg-slate-800/50 group-hover:scale-110 transition-transform duration-500 ease-out">
                  <CheckCircle className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white tracking-tight text-lg">You're ahead of schedule.</p>
                  <p className="text-sm text-slate-400 mt-1">Let's create your first priority.</p>
                </div>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-2 min-h-[44px] px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg font-mono uppercase tracking-wider btn-premium btn-premium-hover flex items-center gap-2 border border-indigo-500/30"
                >
                  <Plus className="w-4 h-4 text-indigo-300" />
                  Define Next Task
                </button>
              </motion.div>
            ) : (
              filteredTasks.map((task) => {
                const taskDeadline = new Date(task.deadline);
                const isPastDue = taskDeadline.getTime() < Date.now() && !task.completed;

                // --- Calculate Cognitive Optimism Tax telemetry ---
                const estValue = parseFloat(task.estimatedDuration || "1");
                let taxPercentage = 35; // Default fallback
                const titleLower = task.title.toLowerCase();
                
                if (task.category === "work" || titleLower.includes("database") || titleLower.includes("refactor") || titleLower.includes("api") || titleLower.includes("compile") || titleLower.includes("sharding")) {
                  taxPercentage = 63; // Engineering Tasks: +63%
                } else if (titleLower.includes("design") || titleLower.includes("ui") || titleLower.includes("ux") || titleLower.includes("animate")) {
                  taxPercentage = 28; // UI/UX Tasks: +28%
                } else if (titleLower.includes("guide") || titleLower.includes("doc") || titleLower.includes("write") || titleLower.includes("readme")) {
                  taxPercentage = 15; // Documentation: +15%
                } else if (task.category === "study" || titleLower.includes("research") || titleLower.includes("audit") || titleLower.includes("spec")) {
                  taxPercentage = 41; // Research Tasks: +41%
                }

                const correctedEst = parseFloat((estValue * (1 + taxPercentage / 100)).toFixed(1));
                const taxConfidence = taxPercentage > 50 ? "Low" : taxPercentage > 25 ? "Medium" : "High";
                
                // Determine visual color of risk level
                let riskColor = "bg-slate-700";
                let riskText = "Pending Analysis";
                let riskBorder = "border-slate-800";
                let riskBadgeBg = "bg-slate-950 text-slate-400";

                if (task.completed) {
                  riskColor = "bg-emerald-500";
                  riskText = "Completed";
                  riskBorder = "border-emerald-900/30";
                  riskBadgeBg = "bg-emerald-950 text-emerald-300 border-emerald-800/30";
                } else if (task.riskScore !== undefined) {
                  if (task.riskScore >= 80 || task.urgency === "critical") {
                    riskColor = "bg-rose-500";
                    riskText = `🔴 Critical Risk (${task.riskScore}%)`;
                    riskBorder = "border-rose-900/40";
                    riskBadgeBg = "bg-rose-950 text-rose-300 border-rose-800/40";
                  } else if (task.riskScore >= 50 || task.urgency === "high") {
                    riskColor = "bg-amber-500";
                    riskText = `🟡 High Risk (${task.riskScore}%)`;
                    riskBorder = "border-amber-900/30";
                    riskBadgeBg = "bg-amber-950 text-amber-300 border-amber-800/30";
                  } else if (task.riskScore >= 25 || task.urgency === "medium") {
                    riskColor = "bg-cyan-500";
                    riskText = `🔵 Moderate Risk (${task.riskScore}%)`;
                    riskBorder = "border-cyan-900/20";
                    riskBadgeBg = "bg-cyan-950 text-cyan-300 border-cyan-800/20";
                  } else {
                    riskColor = "bg-emerald-500";
                    riskText = `🟢 Secure (${task.riskScore}%)`;
                    riskBorder = "border-emerald-900/20";
                    riskBadgeBg = "bg-emerald-950 text-emerald-300 border-emerald-800/20";
                  }
                } else if (isPastDue) {
                  riskColor = "bg-rose-500";
                  riskText = "💥 PAST DUE";
                  riskBorder = "border-rose-950";
                  riskBadgeBg = "bg-rose-950/80 text-rose-400";
                }

                return (
                  <motion.div
                    key={task.id}
                    id={`task-card-${task.id}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ translateY: -2 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`bg-slate-900/40 border ${task.completed ? "border-emerald-950/60 opacity-75" : isPastDue ? "border-rose-950/80" : riskBorder} rounded-xl p-4 pl-6 transition-all hover:bg-slate-900/80 shadow-sm relative overflow-hidden`}
                  >
                    {/* Left Indicator side accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      task.completed 
                        ? "bg-emerald-500" 
                        : task.urgency === "critical" 
                          ? "bg-red-500" 
                          : task.urgency === "high" 
                            ? "bg-amber-500" 
                            : task.urgency === "medium"
                              ? "bg-cyan-500"
                              : "bg-indigo-500"
                    }`}></div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Checkbox and Info */}
                      <div className="flex gap-3">
                        <button
                          id={`btn-complete-task-${task.id}`}
                          onClick={() => onCompleteTask(task.id)}
                          aria-label={task.completed ? "Mark task incomplete" : "Mark task completed"}
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-700 hover:border-indigo-500 bg-slate-950 text-transparent hover:text-slate-600"
                          }`}
                          title={task.completed ? "Mark incomplete" : "Mark completed"}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-bold tracking-tight ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                              {task.title}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 uppercase">
                              {task.category}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                              task.priority === "high" ? "bg-rose-500/15 text-rose-400" : task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
                            {task.description || "No description provided."}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              Due: {taskDeadline.toLocaleDateString()} {taskDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1 border-r border-slate-800 pr-3">
                              <span className="text-slate-500">Your Estimate:</span>
                              <span className="text-slate-300 font-bold">{task.estimatedDuration}h</span>
                            </span>
                            <span className="flex items-center gap-1 border-r border-slate-800 pr-3 text-purple-400">
                              <span className="text-purple-500 font-medium">Chronos:</span>
                              <span className="text-purple-300 font-extrabold">{correctedEst}h</span>
                            </span>
                            <span className="flex items-center gap-1 border-r border-slate-800 pr-3 text-rose-400">
                              <span className="text-rose-500 font-medium">Tax:</span>
                              <span className="text-rose-300 font-extrabold">+{taxPercentage}%</span>
                            </span>
                            <span className="flex items-center gap-1 text-sky-400">
                              <span className="text-sky-500 font-medium">Estimated confidence:</span>
                              <span className="text-sky-300 font-extrabold">{taxConfidence}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Scoring/Nudge Controls */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${riskBadgeBg} flex items-center gap-1`}>
                          {task.urgency === "critical" && <Flame className="w-3 h-3 text-red-400 motion-safe:animate-pulse" />}
                          {riskText}
                        </span>
                        
                        {!task.completed && (
                          <button
                            id={`btn-focus-task-${task.id}`}
                            onClick={() => handleStartTimer(task)}
                            className="px-3 py-1 text-[11px] font-semibold bg-indigo-950 hover:bg-indigo-900 active:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Play className="w-3 h-3 fill-indigo-400" />
                            Procrastination Buster (5m)
                          </button>
                        )}

                        <button
                          id={`btn-delete-task-${task.id}`}
                          onClick={() => onDeleteTask(task.id)}
                          aria-label="Delete task"
                          className="p-1 text-slate-500 hover:text-rose-400 transition ml-auto sm:ml-0 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Diagnoses expanded card inside task */}
                    {task.riskReason && !task.completed && (
                      <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col gap-2 bg-indigo-950/10 -mx-4 -mb-4 p-4 rounded-b-xl">
                        <div className="flex items-start gap-2 text-xs">
                          <span className="p-1 rounded bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3" />
                          </span>
                          <div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              <strong className="text-indigo-300 font-mono">AI DIAGNOSIS: </strong>
                              {task.riskReason}
                            </p>
                          </div>
                        </div>
                        
                        {task.nextAction && (
                          <div className="bg-slate-950 border border-indigo-950/80 rounded-lg p-2.5 mt-1 flex items-start gap-2">
                            <span className="p-1 rounded bg-amber-500/15 text-amber-400 shrink-0 mt-0.5 motion-safe:animate-pulse">
                              <Flame className="w-3 h-3" />
                            </span>
                            <div>
                              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Micro-Step to Break Procrastination:</span>
                              <p className="text-white text-xs font-semibold leading-relaxed mt-0.5">{task.nextAction}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Focus Timer and Quick Start Area (Right / Spans 4) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div id="pomodoro-timer-box" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
          {/* Background geometric alignment / circle accent */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
          </div>
          
          <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-indigo-400 mb-2 relative z-10">
            Procrastination Buster Timer
          </h3>

          {activeFocusTask ? (
            <div className="mb-4 relative z-10">
              <span className="text-xs font-mono text-slate-500 block uppercase mb-1">Active focus target:</span>
              <span className="text-sm font-bold text-white block truncate max-w-[240px] px-3 py-1 bg-slate-950 rounded border border-slate-800">
                {activeFocusTask.title}
              </span>
            </div>
          ) : (
            <div className="mb-4 text-slate-500 text-xs py-2 border border-dashed border-slate-800 rounded px-4 relative z-10">
              Select a task below to activate 5-minute initial start block.
            </div>
          )}

          {/* Large Clock Display */}
          <div className="text-5xl font-light font-mono text-indigo-400 tracking-widest my-4 flex items-center gap-1.5 relative z-10">
            <span className="relative z-10">{formatTime(timerSeconds)}</span>
            {timerActive && (
              <span className="absolute -inset-x-4 -inset-y-2 bg-indigo-500/10 rounded-xl blur-lg motion-safe:animate-pulse" />
            )}
          </div>

          {/* Progress visual */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-6 border border-slate-800 relative z-10">
            <div 
              className="bg-indigo-500 h-full transition-all duration-1000"
              style={{ width: `${(timerSeconds / 300) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-timer"
              onClick={() => setTimerActive(!timerActive)}
              disabled={!activeFocusTask}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                timerActive 
                  ? "bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950 disabled:opacity-50"
              }`}
            >
              {timerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-amber-400" />
                  Pause Nudge
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Start Focus Block
                </>
              )}
            </button>

            <button
              id="btn-reset-timer"
              onClick={() => {
                setTimerSeconds(300);
                setTimerActive(false);
              }}
              aria-label="Reset timer"
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {timerSessionCompleted && (
            <div className="mt-5 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex flex-col items-center gap-2 motion-safe:animate-bounce">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 motion-safe:animate-pulse" />
                CONGRATULATIONS!
              </span>
              <p className="text-[11px] text-slate-300">
                You successfully pushed through the first 5 minutes. That is 90% of the friction! Ready to mark it completed?
              </p>
              {activeFocusTask && (
                <button
                  id="btn-complete-focus-task"
                  onClick={() => {
                    onCompleteTask(activeFocusTask.id);
                    setActiveFocusTask(null);
                    setTimerSessionCompleted(false);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded"
                >
                  Yes, Mark Completed!
                </button>
              )}
            </div>
          )}
        </div>

        {/* Psychological Anti-Procrastination Toolbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Chronos Toolkit
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:bg-slate-950 transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-slate-200">The 2-Minute Rule</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If a micro-step takes less than 2 minutes to perform (e.g. naming the slide deck, installing a library), execute it right now. No planning required.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:bg-slate-950 transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-200">Temptation Stacking</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stack a boring chore with a luxury reward. Code your React submission whilst listening to your favorite low-fi tracks or chewing favorite candy.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:bg-slate-950 transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-200">Identity Alignment</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Shift your framing. Instead of "I have to write this paper", say "I am a researcher who builds clean projects". Change your identity to match your output.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
