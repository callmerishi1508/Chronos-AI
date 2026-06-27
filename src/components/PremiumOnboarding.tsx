import React, { useState } from "react";
import { Play, ShieldAlert, Sparkles, ArrowRight, Check } from "lucide-react";

interface PremiumOnboardingProps {
  onComplete: (data: any) => void;
  onStartDemo?: () => void;
}

export default function PremiumOnboarding({ onComplete, onStartDemo }: PremiumOnboardingProps) {
  const [step, setStep] = useState(1);

  const handleFinish = () => {
    onComplete({
      mission: "Launch Startup Demo",
      identity: "Founder",
      challenge: "Overcommitment",
      workStyle: "I plan too much.",
      archetype: "Over-Planner",
      biasValue: 50,
      tasks: []
    });
  };

  return (
    <div id="premium-onboarding" className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center text-slate-100 font-mono p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="max-w-xl w-full relative z-10 flex flex-col gap-6 p-8 bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4 justify-center">
          {[1, 2, 3].map((s) => (
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

        {step === 1 && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Play className="w-8 h-8 text-indigo-400 ml-1" />
            </div>
            <h2 className="text-3xl font-black text-white">Start Judge Demo</h2>
            <p className="text-sm text-slate-400 font-sans">
              Instantly load a pre-configured hackathon scenario. Experience how Chronos predicts and mitigates timeline failure.
            </p>
            <div className="flex flex-col gap-3 w-full mt-4">
              {onStartDemo && (
                <button
                  onClick={onStartDemo}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Launch Judge Demo
                </button>
              )}
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Next Feature
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Generate Recovery Plan</h2>
            <p className="text-sm text-slate-400 font-sans">
              When a deadline is at risk, Chronos automatically generates a defensive recovery plan—pruning non-essential tasks to secure core deliverables.
            </p>
            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={() => setStep(3)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Open XAI Inspector</h2>
            <p className="text-sm text-slate-400 font-sans">
              Chronos is fully transparent. Use the Explainable AI (XAI) Inspector to see exactly why the model made a scheduling decision.
            </p>
            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Dismiss Forever & Start
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
