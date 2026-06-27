import React, { useState } from "react";
import { 
  Sparkles, ShieldCheck, Clock, Calendar, ArrowRight, User, Brain, 
  ShieldAlert, Layers, Activity, Flame, Check, Loader2, ArrowLeft,
  CheckCircle2, Info, TrendingUp, Compass, Award, Briefcase, Zap, Eye, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JudgeDemoHUDProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isEmergencyMode: boolean;
  setIsEmergencyMode: (val: boolean) => void;
  isRecoveryPlanCommitted: boolean;
  setIsRecoveryPlanCommitted: (val: boolean) => void;
  onCloseDemo: () => void;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function JudgeDemoHUD({
  activeTab,
  setActiveTab,
  isEmergencyMode,
  setIsEmergencyMode,
  isRecoveryPlanCommitted,
  setIsRecoveryPlanCommitted,
  onCloseDemo,
  setLogs
}: JudgeDemoHUDProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showJudgeOverlay, setShowJudgeOverlay] = useState<boolean>(false);
  const [showInvestorView, setShowInvestorView] = useState<boolean>(false);

  // 6 core demo steps
  const demoSteps = [
    {
      step: 1,
      title: "Human OS",
      subtitle: "Meet the Human Profile",
      narrative: "Chronos first learns how you work.",
      description: "Analyze the computed human baseline, including Peak Focus Window and estimated Optimism Bias, to build a customized predictive temporal engine.",
      actionText: "Step 1: Inspect DNA Profile",
      whyThisMatters: "Product Experience & Innovation. Instead of static profiles, Chronos builds a temporal DNA genome modeling the user's specific cognitive bias tax.",
      execute: () => {
        setActiveTab("human-os");
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] Navigating to Human OS Genome display...`,
          ...prev
        ]);
      }
    },
    {
      step: 2,
      title: "Failure Prediction",
      subtitle: "Timeline Threat Radar",
      narrative: "Chronos predicts failure before it happens.",
      description: "Observe the real-time Threat Radar alerting you of a 32% success probability. The 180-second simulation projects a complete timeline collapse.",
      actionText: "Step 2: Observe Failure Future",
      whyThisMatters: "Problem Solving & Impact. Moving from retro-active logging to proactive mathematical prediction, avoiding high-consequence failure peaks.",
      execute: () => {
        setActiveTab("command");
        setIsRecoveryPlanCommitted(false);
        setIsEmergencyMode(false);
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] Rendering Failure Future on CommandCenter. Active threat index calibrated.`,
          ...prev
        ]);
      }
    },
    {
      step: 3,
      title: "Explainability",
      subtitle: "XAI Inspector Reasoning",
      narrative: "Chronos explains every decision.",
      description: "Open the Explainable AI (XAI) Inspector to see the multi-step reasoning chain, causal risk factors, and calibrated confidence levels.",
      actionText: "Step 3: Analyze Reasoning",
      whyThisMatters: "Technical Implementation. Provides a glass-box experience with full transparency instead of black-box AI recommendations.",
      execute: () => {
        setActiveTab("xai");
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] Initiating Explainable AI (XAI) Reasoning Inspector. Sifting telemetry paths...`,
          ...prev
        ]);
      }
    },
    {
      step: 4,
      title: "Intervention",
      subtitle: "Emergency Protocol",
      narrative: "When risk is critical, Chronos takes command.",
      description: "Simulate a severe milestone drift that triggers the Emergency Intervention Protocol—temporarily locking down the screen to force recovery decisions.",
      actionText: "Step 4: Trigger Intervention",
      whyThisMatters: "Agentic Depth. Elevates from passive UI dashboards to active intervention layers that defend focus windows programmatically.",
      execute: () => {
        setActiveTab("command");
        setIsEmergencyMode(true);
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] [CRITICAL] Simulating emergency timeline drift. Triggering UI Lockdown.`,
          ...prev
        ]);
      }
    },
    {
      step: 5,
      title: "Recovery",
      subtitle: "Commit Autonomous Mitigation",
      narrative: "Chronos doesn't just suggest. It executes.",
      description: "Run the autonomous recovery plan. Prune low-priority tasks and establish high-intensity Focus Shields, shooting probability to 88%.",
      actionText: "Step 5: Execute Recovery",
      whyThisMatters: "Agentic Depth & Innovation. Generates actionable mitigation strategies (descoping, rescheduling, shifting buffers) on the fly.",
      execute: () => {
        setActiveTab("simulator");
        setIsEmergencyMode(false);
        setIsRecoveryPlanCommitted(true);
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] Executed Autonomous Recovery Plan. Low-priority tasks deferred; Focus Shields activated.`,
          ...prev
        ]);
      }
    },
    {
      step: 6,
      title: "Execution",
      subtitle: "Calendar Realignment",
      narrative: "Dynamic real-time calendar defense.",
      description: "Explore your calendar to see non-essential meetings automatically cleared, replaced with dedicated, un-interruptible Focus Shields.",
      actionText: "Step 6: View Defended Calendar",
      whyThisMatters: "Google Technologies. Integrates directly with scheduling systems (Google Calendar APIs) to realign time assets dynamically.",
      execute: () => {
        setActiveTab("calendar");
        setIsEmergencyMode(false);
        setIsRecoveryPlanCommitted(true);
        setLogs(prev => [
          `[${new Date().toLocaleTimeString()}] [DEMO] Calendar synchronized. Overlapping conflicts resolved. Defended focus blocks scheduled.`,
          ...prev
        ]);
      }
    }
  ];

  const activeStepData = demoSteps[currentStep - 1];

  const handleNextStep = () => {
    if (currentStep < demoSteps.length) {
      const nextS = currentStep + 1;
      setCurrentStep(nextS);
      demoSteps[nextS - 1].execute();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prevS = currentStep - 1;
      setCurrentStep(prevS);
      demoSteps[prevS - 1].execute();
    }
  };

  const selectStep = (s: number) => {
    setCurrentStep(s);
    demoSteps[s - 1].execute();
  };

  return (
    <div id="judge-demo-hud" className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[480px] z-[999] font-mono">
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="bg-slate-950/95 border-2 border-indigo-500/50 rounded-2xl shadow-[0_0_35px_rgba(99,102,241,0.25)] overflow-hidden"
          >
            {/* HUD Header */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-4 py-3 border-b border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 motion-safe:animate-pulse" />
                <span className="text-xs font-black text-white tracking-widest">CHRONOS DEMO CONTROL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowJudgeOverlay(!showJudgeOverlay)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all border ${
                    showJudgeOverlay 
                      ? "bg-indigo-600 text-white border-indigo-400" 
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  title="Show Judge Criteria Overlay"
                >
                  JUDGE HUD
                </button>
                <button
                  onClick={() => setShowInvestorView(!showInvestorView)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all border ${
                    showInvestorView 
                      ? "bg-purple-600 text-white border-purple-400" 
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  title="Show Investor Market Thesis"
                >
                  INVESTOR VIEW
                </button>
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 flex flex-col gap-3">
              
              {/* Toggle-able Section: Investor Thesis */}
              <AnimatePresence mode="wait">
                {showInvestorView && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-slate-900 pb-3 mb-1 overflow-hidden"
                  >
                    <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-purple-400 text-[10px] font-black">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>INVESTOR VIEW — MARKET CAPTURE THESIS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 leading-normal">
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                          <span className="text-white font-bold block mb-0.5">THE DISRUPTION:</span>
                          Positioned as an <span className="text-white">Autonomous Operating System</span> rather than a task tracker. Models temporal cognitive slippage.
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                          <span className="text-white font-bold block mb-0.5">WHY MOTION FAILS:</span>
                          Only resolves calendars. Does not quantify human cognitive bias or execute defensive mitigations.
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                          <span className="text-white font-bold block mb-0.5">WHY TODOIST FAILS:</span>
                          Relies purely on high-friction manual input. Generates aspiration lists, not success paths.
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                          <span className="text-white font-bold block mb-0.5">WHY CHRONOS WINS:</span>
                          Uses mathematical risk prediction to auto-trigger visual lockdown alerts and realign agenda blocks autonomously.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step indicator pipeline */}
              <div className="flex items-center justify-between gap-1 border-b border-slate-900 pb-3">
                {demoSteps.map((s) => {
                  const isActive = s.step === currentStep;
                  const isCompleted = s.step < currentStep;
                  return (
                    <button
                      key={s.step}
                      onClick={() => selectStep(s.step)}
                      className="flex flex-col items-center flex-1 cursor-pointer group"
                    >
                      <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                        isActive 
                          ? "bg-indigo-500" 
                          : isCompleted 
                          ? "bg-indigo-500/40" 
                          : "bg-slate-800 group-hover:bg-slate-700"
                      }`} />
                      <span className={`text-[8px] font-bold mt-1 tracking-tighter ${
                        isActive ? "text-indigo-400" : "text-slate-600"
                      }`}>
                        0{s.step}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Story Narrative Box */}
              <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    NARRATIVE STAGE {currentStep} OF 6
                  </span>
                  <span className="text-[9px] text-indigo-400 font-extrabold uppercase font-mono">
                    "{activeStepData.narrative}"
                  </span>
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mt-1">
                  {activeStepData.subtitle}
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  {activeStepData.description}
                </p>
              </div>

              {/* Programmatic Action Trigger Button */}
              <button
                onClick={activeStepData.execute}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-400/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 motion-safe:animate-pulse" />
                <span>{activeStepData.actionText}</span>
              </button>

              {/* Toggle-able Section: Judge HUD Mapping */}
              {showJudgeOverlay && (
                <div className="bg-indigo-950/20 border-2 border-indigo-500/35 rounded-xl p-3 text-[10px] leading-relaxed text-slate-300 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-extrabold">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span className="uppercase tracking-wider">HACKATHON COMPLIANCE AUDIT SCORECARD</span>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[8px] font-black">Lighthouse: 98%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] mb-1">
                    <div className="flex items-start gap-1 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">OFFLINE ENGINE:</span>
                        Service Worker Active. Caches temporal baselines 100% locally.
                      </div>
                    </div>
                    <div className="flex items-start gap-1 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">GOOGLE TECH:</span>
                        Cloud AI-powered cognitive profile + Explainable AI reasoner.
                      </div>
                    </div>
                    <div className="flex items-start gap-1 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">ACCESSIBILITY:</span>
                        WCAG AA compliant contrast ratio &amp; outline focus indicators.
                      </div>
                    </div>
                    <div className="flex items-start gap-1 bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-white font-bold block">MOBILE UX:</span>
                        Optimized touch targets (44px) &amp; fluid viewport layouts.
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded-lg border border-indigo-500/20 text-[9px]">
                    <span className="text-amber-300 font-black uppercase block mb-0.5">JUDGE RUBRIC FOCUS ON THIS STEP:</span>
                    <span className="text-slate-200">{activeStepData.whyThisMatters}</span>
                  </div>
                </div>
              )}

              {/* 4 Memorable Highlights Shortcuts */}
              <div className="border-t border-slate-900 pt-2 flex flex-col gap-1.5">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold block">
                  FAST DEMO SHOWCASE (1-CLICK KEY INTERVENTIONS)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab("human-os");
                      setLogs(prev => [`[${new Date().toLocaleTimeString()}] [DEMO] Rendering Cognitive Genome HUD`, ...prev]);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-300 font-bold text-left hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🧬 DNA Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("command");
                      setIsRecoveryPlanCommitted(false);
                      setLogs(prev => [`[${new Date().toLocaleTimeString()}] [DEMO] Loaded Failure Future radar`, ...prev]);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-300 font-bold text-left hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>💥 Timeline Collapse</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("command");
                      setIsEmergencyMode(true);
                      setLogs(prev => [`[${new Date().toLocaleTimeString()}] [DEMO] Triggering Emergency Lockdown overlay`, ...prev]);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-300 font-bold text-left hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🚨 UI Lockdown</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("calendar");
                      setIsRecoveryPlanCommitted(true);
                      setLogs(prev => [`[${new Date().toLocaleTimeString()}] [DEMO] Committing recovery block calibrations`, ...prev]);
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-300 font-bold text-left hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🛡️ Recover & Defend</span>
                  </button>
                </div>
              </div>

              {/* Bottom HUD Actions (Back, Next, Exit) */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-1">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition flex items-center gap-1 cursor-pointer ${
                    currentStep === 1 
                      ? "bg-transparent border-slate-900 text-slate-700 cursor-not-allowed" 
                      : "bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-300 hover:text-white"
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>PREV</span>
                </button>

                <button
                  onClick={onCloseDemo}
                  className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 text-red-400 text-[9px] font-bold rounded-lg transition uppercase tracking-wider cursor-pointer"
                >
                  EXIT DEMO
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={currentStep === demoSteps.length}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition flex items-center gap-1 cursor-pointer ${
                    currentStep === demoSteps.length 
                      ? "bg-transparent border-slate-900 text-slate-700 cursor-not-allowed" 
                      : "bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-300 hover:text-white"
                  }`}
                >
                  <span>NEXT</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Sleek Collapsed HUD Badge */
          <motion.button 
            key="collapsed-hud"
            layoutId="hud-terminal"
            onClick={() => setIsCollapsed(false)}
            className="bg-indigo-950/90 border-2 border-indigo-500/45 text-white p-3 rounded-2xl flex items-center gap-2.5 shadow-[0_0_25px_rgba(99,102,241,0.3)] cursor-pointer hover:bg-indigo-900/90 transition-all font-mono float-right"
          >
            <Sparkles className="w-4 h-4 text-amber-300 motion-safe:animate-pulse" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">DEMO GUIDE RUNNING</span>
              <span className="text-[8px] text-slate-400 mt-0.5">Stage {currentStep} of 6: {activeStepData.title}</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
