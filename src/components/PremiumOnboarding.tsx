import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, ShieldCheck, Clock, Calendar, ArrowRight, User, Brain, 
  ShieldAlert, Layers, Activity, Flame, Check, Loader2, ArrowLeft,
  CheckCircle2, Wifi, Key, Database, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface PremiumOnboardingProps {
  onComplete: (data: {
    mission: string;
    identity: string;
    challenge: string;
    workStyle: string;
    archetype: string;
    biasValue: number;
    tasks: any[];
  }) => void;
  onStartDemo?: () => void;
}

export default function PremiumOnboarding({ onComplete, onStartDemo }: PremiumOnboardingProps) {
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState("");
  const [challenge, setChallenge] = useState("");
  const [workStyle, setWorkStyle] = useState("");
  const [customMission, setCustomMission] = useState("");
  const [isCalendarConnecting, setIsCalendarConnecting] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Focus ref for text input on Step 5
  const missionInputRef = useRef<HTMLInputElement>(null);
  
  // Trap focus within onboarding
  const trapRef = useFocusTrap(true);
  
  // Track all timeouts for garbage collection on unmount
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      // Clear all active timeouts when component unmounts to prevent memory leaks
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const safeSetTimeout = (cb: () => void, delay: number) => {
    const timer = setTimeout(cb, delay);
    timeoutRefs.current.push(timer);
    return timer;
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Step 1: Welcome (Press Enter to start)
      if (step === 1 && e.key === "Enter") {
        setStep(2);
      }
      // Step 2: Identity (1-7 keys)
      else if (step === 2) {
        const num = parseInt(e.key);
        const options = ["Student", "Founder", "Developer", "Product Manager", "Researcher", "Professional", "Other"];
        if (num >= 1 && num <= options.length) {
          setIdentity(options[num - 1]);
          safeSetTimeout(() => setStep(3), 200);
        }
      }
      // Step 3: Challenge (1-6 keys)
      else if (step === 3) {
        const num = parseInt(e.key);
        const options = ["Procrastination", "Overcommitment", "Poor Estimation", "Context Switching", "Perfectionism", "Unclear Priorities"];
        if (num >= 1 && num <= options.length) {
          setChallenge(options[num - 1]);
          safeSetTimeout(() => setStep(4), 200);
        }
      }
      // Step 4: Work Style (1-5 keys)
      else if (step === 4) {
        const num = parseInt(e.key);
        const options = [
          "I start late but finish fast.",
          "I plan too much.",
          "I underestimate everything.",
          "I constantly switch tasks.",
          "I chase perfection."
        ];
        if (num >= 1 && num <= options.length) {
          setWorkStyle(options[num - 1]);
          safeSetTimeout(() => setStep(5), 200);
        }
      }
      // Step 5: Mission (Enter to proceed if text exists)
      else if (step === 5 && e.key === "Enter" && customMission.trim().length > 0) {
        setStep(6);
      }
      // Step 6: Calendar (Enter/Space to connect, Escape/S to skip)
      else if (step === 6) {
        if (e.key.toLowerCase() === "s") {
          handleSkipCalendar();
        }
      }
      // Step 8: First AI Insight (Enter to proceed)
      else if (step === 8 && e.key === "Enter") {
        setStep(9);
      }
      // Step 9: Recovery blueprint (Enter to finish)
      else if (step === 9 && e.key === "Enter") {
        handleFinish();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, customMission, identity, challenge, workStyle]);

  // Focus mission input automatically
  useEffect(() => {
    if (step === 5) {
      safeSetTimeout(() => missionInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Handle skip calendar
  const handleSkipCalendar = () => {
    setStep(7);
    triggerProfileGeneration();
  };

  // Handle connect calendar
  const handleConnectCalendar = () => {
    setIsCalendarConnecting(true);
    safeSetTimeout(() => {
      setIsCalendarConnecting(false);
      setCalendarConnected(true);
      safeSetTimeout(() => {
        setStep(7);
        triggerProfileGeneration();
      }, 1000);
    }, 1500);
  };

  // Trigger loading logs simulator
  const triggerProfileGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationLogs([]);

    const logSequence = [
      { text: "Initializing Chronos DNA sequencer...", delay: 200, progress: 10 },
      { text: "Analyzing work-style temporal patterns...", delay: 500, progress: 25 },
      { text: "Mapping behavioral heuristics to cognitive genome...", delay: 900, progress: 45 },
      { text: `Detected primary bias model: ${getArchetypeFromStyle(workStyle)}`, delay: 1300, progress: 68 },
      { text: "Evaluating timeline safety probability bounds...", delay: 1700, progress: 85 },
      { text: "Calibrating custom Focus Shields and buffer profiles...", delay: 2000, progress: 95 },
      { text: "Human Operating System fully indexed.", delay: 2200, progress: 100 }
    ];

    logSequence.forEach((item) => {
      safeSetTimeout(() => {
        setGenerationLogs((prev) => [...prev, item.text]);
        setGenerationProgress(item.progress);
        if (item.progress === 100) {
          safeSetTimeout(() => {
            setIsGenerating(false);
            setStep(8);
          }, 600);
        }
      }, item.delay);
    });
  };

  // Get Archetype
  const getArchetypeFromStyle = (style: string) => {
    if (style.includes("start late")) return "Last-Minute Sprinter";
    if (style.includes("plan too much")) return "Over-Planner";
    if (style.includes("underestimate")) return "Optimistic Builder";
    if (style.includes("switch tasks")) return "Chronic Context Switcher";
    if (style.includes("perfection")) return "Perfectionist Refiner";
    return "Optimistic Builder";
  };

  const getBiasValue = (style: string) => {
    if (style.includes("underestimate")) return 63;
    if (style.includes("start late")) return 45;
    if (style.includes("switch tasks")) return 52;
    if (style.includes("perfection")) return 38;
    return 30;
  };

  const currentArchetype = getArchetypeFromStyle(workStyle);

  const getFailurePattern = (style: string) => {
    if (style.includes("underestimate")) return "Systematic underestimation of database & integration tasks";
    if (style.includes("start late")) return "High-intensity bursts causing near-miss deadline crunches";
    if (style.includes("switch tasks")) return "Micro-context switching draining focus resilience";
    if (style.includes("perfection")) return "Polishing documentation and UI at the expense of core features";
    return "Ad-hoc task priority drift under stress";
  };

  const getPeakFocusWindow = (style: string) => {
    if (style.includes("start late")) return "4:00 PM - 8:00 PM";
    if (style.includes("underestimate")) return "9:00 AM - 12:00 PM";
    return "10:00 AM - 1:00 PM";
  };

  const getAIInsight = () => {
    if (workStyle.includes("underestimate")) {
      return "Your deadlines fail because you consistently underestimate implementation work by up to 63%. Your engineering optimism acts as a tax on your delivery confidence, leaving zero buffers for testing bottlenecks.";
    }
    if (workStyle.includes("switch tasks")) {
      return "You are losing up to 4.2 hours of focus per day to context switching rather than actual procrastination. Every interruption incurs a severe cognitive penalty, reducing your delivery speed by 30%.";
    }
    if (workStyle.includes("start late")) {
      return "You thrive on high-urgency adrenaline, which creates severe testing bottlenecks near final releases. Your delivery risk escalates to 75% in the final 4 hours of any milestone.";
    }
    if (workStyle.includes("perfection")) {
      return "Your focus loops are locked into high-visibility aesthetic details. You routinely spend 3x more time refining visual documentation than stabilizing underlying database replication layers.";
    }
    return "You tend to overcommit during planning stages, establishing rigid paths that cannot handle the friction of real-world concurrent scheduling conflicts.";
  };

  // Generate mock tasks based on mission and style
  const getOnboardingTasks = (missionName: string, style: string) => {
    const primaryA = getArchetypeFromStyle(style);
    return [
      {
        id: "onb-task-1",
        title: `Submit ${missionName || "Project"} Final Template`,
        description: "Submit core deliverables, slides, and verify API endpoints before deadline evaluation.",
        deadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "2",
        completed: false,
        category: "study",
        riskScore: 75,
        urgency: "high",
        riskReason: "Final submission window. High visibility impact.",
        nextAction: "Complete the submission checklist form."
      },
      {
        id: "onb-task-2",
        title: "Deploy Database Replication Cluster",
        description: "Critical database mitigation. Replication buffers overflow under load. Underestimated by builder profile.",
        deadline: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "5",
        completed: false,
        category: "work",
        riskScore: 92,
        urgency: "critical",
        riskReason: `Systematic bias (+${getBiasValue(style)}%) detected. Needs defensive focus shield.`,
        nextAction: "Verify local connection pool settings."
      },
      {
        id: "onb-task-3",
        title: "Verify API Endpoints & Run Integration Suite",
        description: "Validate client-server connectivity state before judges trigger load reviews.",
        deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        estimatedDuration: "3",
        completed: false,
        category: "study",
        riskScore: 60,
        urgency: "high",
        riskReason: "High correlation to database failure points.",
        nextAction: "Execute local integration suite shell script."
      }
    ];
  };

  const handleFinish = () => {
    onComplete({
      mission: customMission || "Complete Critical Deliverables",
      identity,
      challenge,
      workStyle,
      archetype: currentArchetype,
      biasValue: getBiasValue(workStyle),
      tasks: getOnboardingTasks(customMission, workStyle)
    });
  };

  return (
    <div id="premium-onboarding" className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center text-slate-100 font-mono p-4 overflow-y-auto">
      {/* Cinematic Glowing Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] motion-safe:animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px] motion-safe:animate-pulse" />
        {/* Fine grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="max-w-2xl w-full relative z-10 flex flex-col gap-8 py-8 px-2">
        
        {/* Header HUD / Stepper progress */}
        {step > 1 && step < 7 && (
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-2">
            <button 
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5, 6].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step 
                      ? "w-8 bg-indigo-500" 
                      : s < step 
                      ? "w-3 bg-indigo-500/40" 
                      : "w-3 bg-slate-800"
                  }`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider">CALIBRATING SYSTEM...</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: WELCOME SCREEN */}
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 text-center items-center"
            >
              <div className="relative h-20 w-20 flex items-center justify-center shrink-0 mb-4">
                <motion.div 
                  className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute inset-0 border-2 border-dashed border-indigo-500/35 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                />
                <motion.div 
                  className="relative h-12 w-12 rounded-full bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.6)] flex items-center justify-center"
                >
                  <Cpu className="w-6 h-6 text-white motion-safe:animate-pulse" />
                </motion.div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-[0.3em] font-mono">CHRONOS COGNITIVE SYSTEM</span>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                  Welcome to <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">Chronos AI</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-400 font-sans max-w-lg mt-2 leading-relaxed">
                  The first Autonomous Deadline Intelligence Platform. Most productivity tools manage static tasks. <span className="text-indigo-400 font-semibold">Chronos manages the probability of success.</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-3.5 mt-4 w-full sm:w-auto">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] border border-indigo-500/20 text-xs w-full sm:w-auto cursor-pointer"
                >
                  <span>Begin Analysis</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>
                
                {onStartDemo && (
                  <button
                    onClick={onStartDemo}
                    className="min-h-[44px] px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-500/35 rounded-xl text-[10px] transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 motion-safe:animate-pulse" />
                    <span>Start Judge Demo (Bypass)</span>
                  </button>
                )}

                <span className="text-[10px] text-slate-500 hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 font-mono text-[9px]">Enter</kbd> to proceed</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: IDENTITY DISCOVERY */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">STEP 1 OF 5 — IDENTITY</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Who are you?</h2>
                <p className="text-xs text-slate-400 font-sans">Select your current focus domain. Helps customize the predictive deadline model.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  { label: "Founder", desc: "Building from scratch. Zero buffer tolerances." },
                  { label: "Developer", desc: "Refactoring code pipelines and shipping blocks." },
                  { label: "Product Manager", desc: "Balancing timelines, features, and stakeholder metrics." },
                  { label: "Student", desc: "CS homework, hackathons, and extreme crunch crutches." },
                  { label: "Researcher", desc: "Sifting academic logs and long-term milestones." },
                  { label: "Professional", desc: "Structuring deliverables, reports, and sync lanes." },
                  { label: "Other", desc: "Mapping deadlines across custom environments." }
                ].map((opt, idx) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setIdentity(opt.label);
                      safeSetTimeout(() => setStep(3), 200);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                      identity === opt.label 
                        ? "bg-slate-900 border-indigo-500 text-white" 
                        : "bg-slate-950/60 hover:bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wide uppercase">{opt.label}</span>
                      <span className="text-[9px] text-slate-600 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                        Key [{idx + 1}]
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">{opt.desc}</p>
                    {identity === opt.label && (
                      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: DEADLINE CHALLENGE */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">STEP 2 OF 5 — FRICTION</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">What causes your deadlines to fail most?</h2>
                <p className="text-xs text-slate-400 font-sans">Identifying the cognitive blocker that costs you the most buffer time.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  { label: "Procrastination", desc: "Starting tasks late, creating severe back-end crunches." },
                  { label: "Overcommitment", desc: "Planning too many high-density items in one window." },
                  { label: "Poor Estimation", desc: "Underestimating implementation time by half or more." },
                  { label: "Context Switching", desc: "Losing deep flow to chats, emails, and small micro-tasks." },
                  { label: "Perfectionism", desc: "Polishing UI details and neglecting core infrastructure." },
                  { label: "Unclear Priorities", desc: "Drifting to secondary goals when difficulty rises." }
                ].map((opt, idx) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setChallenge(opt.label);
                      safeSetTimeout(() => setStep(4), 200);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                      challenge === opt.label 
                        ? "bg-slate-900 border-indigo-500 text-white" 
                        : "bg-slate-950/60 hover:bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wide uppercase">{opt.label}</span>
                      <span className="text-[9px] text-slate-600 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                        Key [{idx + 1}]
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">{opt.desc}</p>
                    {challenge === opt.label && (
                      <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: WORK STYLE */}
          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">STEP 3 OF 5 — BEHAVIOR</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Which statement sounds most like you?</h2>
                <p className="text-xs text-slate-400 font-sans">Self-calibration of your primary deadline archetype.</p>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                {[
                  { text: "I start late but finish fast.", label: "Last-Minute Sprinter" },
                  { text: "I plan too much.", label: "Over-Planner" },
                  { text: "I underestimate everything.", label: "Optimistic Builder" },
                  { text: "I constantly switch tasks.", label: "Chronic Context Switcher" },
                  { text: "I chase perfection.", label: "Perfectionist Refiner" }
                ].map((opt, idx) => (
                  <button
                    key={opt.text}
                    onClick={() => {
                      setWorkStyle(opt.text);
                      safeSetTimeout(() => setStep(5), 200);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between relative group cursor-pointer ${
                      workStyle === opt.text 
                        ? "bg-slate-900 border-indigo-500 text-white" 
                        : "bg-slate-950/60 hover:bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold font-sans">"{opt.text}"</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline text-[9px] text-slate-400 uppercase font-mono">{opt.label}</span>
                      <span className="text-[9px] text-slate-600 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                        [{idx + 1}]
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: CURRENT MISSION */}
          {step === 5 && (
            <motion.div 
              key="step-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">STEP 4 OF 5 — MISSION</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">What is your primary objective right now?</h2>
                <p className="text-xs text-slate-400 font-sans">This becomes your Active Command Mission. Focus shields will be calibrated around it.</p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <div className="relative">
                  <input
                    ref={missionInputRef}
                    type="text"
                    placeholder="e.g., Launch CS Hackathon Submission before Midnight..."
                    value={customMission}
                    onChange={(e) => setCustomMission(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-600 focus:outline-none transition font-sans shadow-inner"
                  />
                  {customMission.trim().length > 0 && (
                    <button
                      onClick={() => setStep(6)}
                      className="absolute right-3 top-3 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer"
                    >
                      CONTINUE →
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Launch Startup Demo",
                      "Ship Production API",
                      "Submit Hackathon Template",
                      "Prepare Presentation",
                      "Pass CS Final Exam"
                    ].map((sug) => (
                      <button
                        key={sug}
                        onClick={() => {
                          setCustomMission(sug);
                        }}
                        className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-[10px] text-slate-400 hover:text-indigo-400 rounded-xl transition font-mono cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: CALENDAR CONNECTION */}
          {step === 6 && (
            <motion.div 
              key="step-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6 text-center items-center py-4"
            >
              <div className="relative h-16 w-16 flex items-center justify-center shrink-0 mb-2">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg" />
                <div className="absolute inset-0 border border-dashed border-indigo-500/30 rounded-full motion-safe:animate-[spin_6s_linear_infinite]" />
                <Calendar className="w-8 h-8 text-indigo-400" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono">STEP 5 OF 5 — INTEGRATION</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Secure your schedule</h2>
                <p className="text-sm text-slate-400 font-sans max-w-md leading-relaxed">
                  Chronos can actively defend your agenda and execute recovery plans automatically when scheduling overlaps are detected.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-4 w-full sm:max-w-xs">
                {isCalendarConnecting ? (
                  <div className="px-5 py-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center gap-3 text-indigo-400 text-xs font-mono">
                    <Loader2 className="w-4 h-4 motion-safe:animate-spin text-indigo-400" />
                    <span>SYNING CHRONOS ORBITS...</span>
                  </div>
                ) : calendarConnected ? (
                  <div className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 motion-safe:animate-pulse" />
                    <span>✓ CALENDAR SECURED</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleConnectCalendar}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider rounded-2xl transition-all duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50"
                    >
                      <Calendar className="w-4 h-4 text-indigo-200" />
                      <span>Connect Google Calendar</span>
                    </button>
                    <button
                      onClick={handleSkipCalendar}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs uppercase tracking-widest rounded-2xl transition font-mono cursor-pointer"
                    >
                      Skip For Now (Press S)
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 7: INSTANT HUMAN OS GENERATION */}
          {step === 7 && (
            <motion.div 
              key="step-7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 text-center items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                  <Brain className="w-8 h-8 text-indigo-400 motion-safe:animate-pulse relative z-10" />
                </div>
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest font-mono mt-4">ANALYZING RESPONSE MATRIX</span>
                <h2 className="text-2xl font-bold text-white tracking-tight">Sequencing Deadline DNA Profile...</h2>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col gap-3 font-mono text-[10px] shadow-inner max-h-[220px] overflow-y-auto mt-2">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-1 text-slate-500">
                  <span>TELEMETRY CHANNEL</span>
                  <span>STATUS: RUNNING</span>
                </div>
                {generationLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-400">
                    <span className="text-indigo-500 shrink-0">►</span>
                    <span className="leading-relaxed font-mono">{log}</span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 8: FIRST AI INSIGHT */}
          {step === 8 && (
            <motion.div 
              key="step-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest font-mono">ANALYSIS COMPLETE — HUMAN OS MATCH</span>
                <h2 className="text-3xl font-black text-white tracking-tight">You are a <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-400 to-indigo-400">{currentArchetype}</span></h2>
              </div>

              {/* DNA Profile Bento block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-2">
                  <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-wider font-mono">ESTIMATED COGNITIVE TAX</span>
                  <span className="text-3xl font-black text-white tracking-tight">+{getBiasValue(workStyle)}%</span>
                  <span className="text-[10px] text-slate-400 font-sans leading-relaxed">Average systematic planning optimism delay detected.</span>
                </div>

                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-2">
                  <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wider font-mono">PEAK PERFORMANCE LENS</span>
                  <span className="text-lg font-black text-white tracking-tight">{getPeakFocusWindow(workStyle)}</span>
                  <span className="text-[10px] text-slate-400 font-sans leading-relaxed">High-energy window calibrated to response profile.</span>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-indigo-950/20 via-slate-900/80 to-slate-950 border border-indigo-500/20 rounded-2xl flex items-start gap-4 shadow-lg shadow-indigo-950/20">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 motion-safe:animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest font-mono">CHRONOS DEEP INSIGHT</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                    {getAIInsight()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 mt-2">
                <button
                  onClick={() => setStep(9)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50 text-xs"
                >
                  <span>Build First Recovery Plan</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 font-mono text-[9px]">Enter</kbd> to proceed</span>
              </div>
            </motion.div>
          )}

          {/* STEP 9: FIRST RECOVERY PLAN */}
          {step === 9 && (
            <motion.div 
              key="step-9"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">RECOVERY BLUEPRINT GENERATED</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Command Dashboard initialized</h2>
                <p className="text-xs text-slate-400 font-sans">Chronos has mapped defensive metrics to secure your deliverables.</p>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-900 rounded-3xl flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-[0.2em] font-mono">CHRONOS ACTIVE DIRECTIVE</span>
                  <span className="text-sm font-black text-white uppercase tracking-wide font-mono block">
                    MISSION: {customMission || "Launch CS Deliverables"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-center">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">BASELINE SUCCESS PROB</span>
                    <span className="text-2xl font-black text-red-400 tracking-tight">32%</span>
                  </div>

                  <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-center">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">THREAT INDEX</span>
                    <span className="text-lg font-black text-amber-400 tracking-tight">CRITICAL DRIFT</span>
                  </div>
                </div>

                <div className="p-4 bg-red-500/[0.02] border border-red-500/20 rounded-2xl flex items-start gap-3">
                  <span className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[8px] text-red-400 font-extrabold uppercase tracking-widest font-mono block">FIRST CRITICAL ACTION REQUIRED</span>
                    <span className="text-[11px] font-black text-white uppercase font-sans mt-0.5 block">Prune secondary documentation & defer 3 conflicts</span>
                    <p className="text-[10px] text-slate-400 font-sans leading-normal mt-1">
                      Saves up to 5.2 hours of planning overhead. Instantly boosts deadline success probability to 88%.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleFinish}
                  className="w-full py-4.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-indigo-500/20 text-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 motion-safe:animate-pulse" />
                  <span>INITIALIZE CHRONOS CONTROL</span>
                </button>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 font-mono text-[9px]">Enter</kbd> to launch</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
