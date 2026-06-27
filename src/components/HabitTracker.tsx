import React, { useState } from "react";
import { Flame, Check, Plus, Trash2, Heart, Award, Sparkles, AlertCircle } from "lucide-react";
import { Habit } from "../types";

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, "id" | "streak" | "lastCompleted">) => void;
  onCompleteHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
}

export default function HabitTracker({
  habits,
  onAddHabit,
  onCompleteHabit,
  onDeleteHabit,
}: HabitTrackerProps) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [category, setCategory] = useState("health");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title,
      frequency,
      category,
    });

    setTitle("");
    setFrequency("daily");
    setCategory("health");
    setIsAdding(false);
  };

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div id="habit-tracker" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      {/* Background geometric alignment / circle accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-emerald-500/10 text-emerald-400">
            <Heart className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Habits & Accountability Routines</h2>
            <p className="text-xs text-slate-400">Keep up your daily streaks to build non-negotiable mental loops.</p>
          </div>
        </div>

        <button
          id="btn-add-habit-trigger"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition flex items-center gap-1.5 font-mono"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          {isAdding ? "Close Panel" : "Create Routine"}
        </button>
      </div>

      {/* Add Habit Form Collapsible */}
      {isAdding && (
        <form
          id="form-add-habit"
          onSubmit={handleSubmit}
          className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 mb-6 shadow-inner"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Habit Title</label>
              <input
                id="input-habit-title"
                type="text"
                required
                placeholder="e.g., Code for 30 Minutes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition"
              />
            </div>

            <div className="sm:col-span-3 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Frequency</label>
              <select
                id="input-habit-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Category</label>
              <select
                id="input-habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition"
              >
                <option value="health">Health</option>
                <option value="study">Study</option>
                <option value="mind">Mind</option>
                <option value="work">Work</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              id="btn-submit-habit"
              type="submit"
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg transition shadow-md shadow-emerald-950"
            >
              Add Routine
            </button>
          </div>
        </form>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6 text-slate-600" />
            <p className="text-xs font-semibold">No habits tracked yet.</p>
            <p className="text-[11px] text-slate-600">Establish standard routines to secure mental flow states.</p>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompletedToday = habit.lastCompleted === getTodayString();

            return (
              <div
                key={habit.id}
                id={`habit-card-${habit.id}`}
                className={`relative bg-slate-950 border ${
                  isCompletedToday ? "border-emerald-950/60 bg-emerald-950/5 opacity-90" : "border-slate-800/80"
                } rounded-xl p-4 pl-6 flex items-center justify-between gap-4 transition hover:border-slate-700 overflow-hidden`}
              >
                {/* Left indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isCompletedToday ? "bg-emerald-500" : "bg-indigo-500"
                }`}></div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    id={`btn-complete-habit-${habit.id}`}
                    onClick={() => onCompleteHabit(habit.id)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                      isCompletedToday
                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                        : "border-slate-800 hover:border-emerald-500 bg-slate-900 text-transparent hover:text-emerald-500"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="overflow-hidden">
                    <h4 className={`text-xs font-bold truncate ${isCompletedToday ? "line-through text-slate-500" : "text-white"}`}>
                      {habit.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                      <span className="capitalize">{habit.frequency}</span>
                      <span>•</span>
                      <span className="capitalize text-slate-400">{habit.category}</span>
                    </div>
                  </div>
                </div>

                {/* Streak size Flame */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-0.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800/60">
                    <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? "text-amber-400 fill-amber-500/10 motion-safe:animate-pulse" : "text-slate-600"}`} />
                    <span className="text-[11px] font-bold font-mono text-white">{habit.streak}</span>
                  </div>

                  <button
                    id={`btn-delete-habit-${habit.id}`}
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1 hover:text-rose-400 text-slate-600 transition"
                    title="Remove Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-950/60 rounded-xl flex items-start gap-2 text-xs">
        <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
          <Award className="w-3.5 h-3.5" />
        </span>
        <div>
          <p className="text-slate-300 leading-normal">
            <strong className="text-white">The AI Habit Accountability Loop:</strong> Creating non-negotiable streaks builds neural pathways that reduce executive dysfunction. Complete your tracking daily to increase streak levels and beat procrastination.
          </p>
        </div>
      </div>
    </div>
  );
}
