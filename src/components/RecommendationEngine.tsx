import React from "react";
import { Sparkles, ArrowRight, Zap, Calendar, Heart, AlertCircle, ShieldCheck } from "lucide-react";
import { Recommendation, Task } from "../types";
import { AIBadge } from "./AIBadge";

interface RecommendationEngineProps {
  briefing: string;
  recommendations: Recommendation[];
  isLoading: boolean;
  onRefresh: () => void;
  onApplyImmediate: (rec: Recommendation) => void;
  tasks: Task[];
  onOpenReasoning?: () => void;
}

export default function RecommendationEngine({
  briefing,
  recommendations,
  isLoading,
  onRefresh,
  onApplyImmediate,
  tasks,
  onOpenReasoning,
}: RecommendationEngineProps) {
  const [expandedRecId, setExpandedRecId] = React.useState<string | null>(null);
  const dangerTasksCount = tasks.filter(
    (t) => !t.completed && t.urgency === "critical"
  ).length;

  return (
    <div id="recommendation-engine" aria-busy={isLoading} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      {/* Background cyber grid accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </span>
            <h2 className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-indigo-400">
              Autonomous Intelligence
            </h2>
          </div>
          <h1 className="text-2xl font-semibold text-white font-sans tracking-tight">
            How we are saving your day
          </h1>
        </div>
        
        <button
          id="btn-recompute-advice"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-[44px] px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl font-mono uppercase tracking-wider border border-indigo-500/30 btn-premium btn-premium-hover flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 motion-safe:animate-pulse" />
              AI Analyzing...
            </span>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Recompute Advice
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Proactive Statement Box */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                PROACTIVE DIAGNOSTIC
              </span>
              {dangerTasksCount > 0 ? (
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-md motion-safe:animate-pulse flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  {dangerTasksCount} IN DANGER
                </span>
              ) : (
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SYSTEM SECURE
                </span>
              )}
            </div>
            
            <p className="text-slate-200 leading-relaxed text-sm md:text-base font-medium font-sans italic relative pl-4 border-l-2 border-indigo-500/50 my-2">
              "{briefing}"
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Critical Path Risk Rating</span>
              <span className={`font-bold uppercase ${dangerTasksCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {dangerTasksCount > 0 ? "CRITICAL (85%)" : "STABLE (30%)"}
              </span>
            </div>
            {/* Visual Risk Bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  dangerTasksCount > 0 
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                }`}
                style={{ width: dangerTasksCount > 0 ? "85%" : "30%" }}
              />
            </div>
          </div>
        </div>

        {/* Actionable Recommendations List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {isLoading ? (
            <>
              <div className="h-[104px] w-full rounded-xl skeleton" />
              <div className="h-[104px] w-full rounded-xl skeleton opacity-75" />
              <div className="h-[104px] w-full rounded-xl skeleton opacity-40" />
            </>
          ) : recommendations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl text-slate-500">
              <ShieldCheck className="w-8 h-8 text-emerald-500/50 mb-3" />
              <p className="text-sm font-semibold text-slate-300">You're doing great.</p>
              <p className="text-xs font-mono mt-1">No proactive actions required. Tap Recompute Advice if you need a fresh diagnostic.</p>
            </div>
          ) : (
            recommendations.map((rec) => {
              let icon = <Zap className="w-4 h-4 text-amber-400" />;
              let badgeBg = "bg-amber-500/10 text-amber-300 border-amber-500/20";
              let leftIndicatorColor = "bg-amber-500";
              let containerStyle = "border-slate-800/60 bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-700/80";

              if (rec.type === "immediate") {
                icon = <Zap className="w-4 h-4 text-rose-400" />;
                badgeBg = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                leftIndicatorColor = "bg-rose-500";
                containerStyle = "border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/30 hover:border-rose-800/50";
              } else if (rec.type === "planning") {
                icon = <Calendar className="w-4 h-4 text-indigo-400" />;
                badgeBg = "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
                leftIndicatorColor = "bg-indigo-500";
                containerStyle = "border-indigo-900/30 bg-indigo-950/20 hover:bg-indigo-950/30 hover:border-indigo-800/50";
              } else if (rec.type === "habit") {
                icon = <Heart className="w-4 h-4 text-emerald-400" />;
                badgeBg = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
                leftIndicatorColor = "bg-emerald-400";
                containerStyle = "border-emerald-900/30 bg-emerald-950/20 hover:bg-emerald-950/30 hover:border-emerald-800/50";
              }

              return (
                <div
                  key={rec.id}
                  id={`rec-card-${rec.id}`}
                  className={`relative rounded-xl border ${containerStyle} pl-6 p-4.5 transition-all duration-300 flex items-center justify-between gap-4 group shadow-md overflow-hidden hover:translate-x-1`}
                >
                  {/* Geometric absolute indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftIndicatorColor}`} />

                  <div className="flex gap-4 items-start">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${badgeBg}`}>
                      {icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {rec.title}
                        </h3>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${badgeBg}`}>
                          {rec.type}
                        </span>
                        {/* AI Transparency Badge */}
                        <AIBadge provider={rec._meta?.provider} />
                        {rec.reasoning && (
                          <button
                            onClick={() => setExpandedRecId(expandedRecId === rec.id ? null : rec.id)}
                            title="Inspect the AI's reasoning — see Gemini's full justification for this recommendation"
                            aria-label="Open AI Reasoning Inspector"
                            className="min-h-[44px] min-w-[44px] text-[9px] font-mono font-bold text-indigo-400 hover:text-indigo-300 transition uppercase cursor-pointer flex items-center justify-center gap-1"
                          >
                            [ WHY? ]
                          </button>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                          <span className="text-slate-400 font-semibold uppercase">Psych Impact:</span>
                          <span className="text-slate-300">{rec.impact}</span>
                        </div>
                        {/* Top Drivers (Phase 18) */}
                        {rec.multiFactorScores && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                            <span className="text-indigo-400/80 font-semibold uppercase">Top Drivers:</span>
                            <span className="text-indigo-300/80">
                              {Object.entries(rec.multiFactorScores)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 2)
                                .map(([key]) => key)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-apply-rec-${rec.id}`}
                    onClick={() => onApplyImmediate(rec)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-slate-800/80 hover:text-indigo-400 rounded-xl text-slate-400 transition-all flex-shrink-0 border border-transparent hover:border-slate-700/60 active:scale-95 cursor-pointer"
                    title="Execute this recommendation"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* INLINE REASONING INSPECTOR */}
                  {expandedRecId === rec.id && rec.reasoning && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-2xl z-20 flex flex-col gap-4 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Chronos Reasoning Inspector</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase text-slate-500">Confidence:</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              rec.reasoning.confidenceBand === 'Very High' || rec.reasoning.confidenceBand === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              rec.reasoning.confidenceBand === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              rec.reasoning.confidenceBand === 'Low' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                              {rec.reasoning.confidenceBand}
                            </span>
                          </div>
                          {rec.reasoning.evidenceQuality && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase text-slate-500">Evidence Quality:</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                rec.reasoning.evidenceQuality === 'Strong' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                rec.reasoning.evidenceQuality === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                rec.reasoning.evidenceQuality === 'Limited' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {rec.reasoning.evidenceQuality}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Contextual Evidence</span>
                            <ul className="text-xs text-slate-300 font-sans list-disc list-inside">
                              {rec.reasoning.evidence.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Pattern Detected</span>
                            <p className="text-xs text-indigo-300 font-sans">{rec.reasoning.patternDetection}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Risk Assessment</span>
                            <p className="text-xs text-rose-300 font-sans">{rec.reasoning.riskAssessment}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Scenario Simulator</span>
                          
                          <div className="p-2 border border-slate-800 rounded bg-slate-950">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">If Executed Now</span>
                              <span className="text-[9px] text-slate-400">{rec.reasoning.scenarioSimulation.completeNow.estimatedOutcome}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans line-clamp-1">Pros: {rec.reasoning.scenarioSimulation.completeNow.pros.join(", ")}</p>
                          </div>

                          <div className="p-2 border border-slate-800 rounded bg-slate-950">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-amber-400 font-bold uppercase">If Delayed</span>
                              <span className="text-[9px] text-slate-400">{rec.reasoning.scenarioSimulation.delay.estimatedOutcome}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans line-clamp-1">Cons: {rec.reasoning.scenarioSimulation.delay.cons.join(", ")}</p>
                          </div>

                          <div className="p-2 border border-slate-800 rounded bg-slate-950">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] text-rose-400 font-bold uppercase">If Ignored</span>
                            </div>
                            <p className="text-[10px] text-rose-500/80 font-sans">Risk: {rec.reasoning.scenarioSimulation.ignore.risk}</p>
                          </div>
                        </div>
                      </div>

                      {rec.multiFactorScores && (
                        <div className="border-t border-slate-800 pt-3 mt-1">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block mb-2">Detailed Multi-Factor Scoring</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(rec.multiFactorScores).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">
                                <span className="text-[9px] text-slate-400 uppercase font-mono">{k}</span>
                                <span className="text-[10px] text-white font-bold">{v as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
