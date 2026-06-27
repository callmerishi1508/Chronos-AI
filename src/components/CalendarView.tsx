import React, { useState } from "react";
import { Calendar, Clock, Sparkles, AlertTriangle, CheckCircle, RefreshCcw, Eye, EyeOff } from "lucide-react";
import { CalendarEvent, Task } from "../types";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAutoSchedule: () => void;
  isScheduling: boolean;
  onClearAIScheduled: () => void;
  onCompleteTask: (id: string) => void;
}

export default function CalendarView({
  events,
  tasks,
  onAutoSchedule,
  isScheduling,
  onClearAIScheduled,
  onCompleteTask,
}: CalendarViewProps) {
  const [showAISlotsOnly, setShowAISlotsOnly] = useState(false);

  // Filter events
  const filteredEvents = showAISlotsOnly
    ? events.filter((e) => e.isAIScheduled)
    : events;

  // Render a simple day list (Next 5 Days)
  const getNextNDays = (n: number) => {
    const days = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const daysToShow = getNextNDays(5);

  const getEventsForDay = (day: Date, allEvents: CalendarEvent[]) => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <div id="calendar-view" className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
      {/* Background geometric alignment / circle accent */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="h-[400px] w-[400px] border-[40px] border-indigo-500 rounded-full"></div>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Daily Agenda & Focus Slots</h2>
            <p className="text-xs text-slate-400">See manual events and auto-scheduled deep work blocks.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-toggle-ai-slots"
            onClick={() => setShowAISlotsOnly(!showAISlotsOnly)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition flex items-center gap-1.5 font-mono"
          >
            {showAISlotsOnly ? (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Showing AI Slots Only
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Show All Slots
              </>
            )}
          </button>

          <button
            id="btn-clear-ai-schedule"
            onClick={onClearAIScheduled}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-950 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 rounded-lg transition flex items-center gap-1.5 font-mono"
            title="Clear AI Generated slots"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
            Clear AI Slots
          </button>

          <button
            id="btn-auto-schedule"
            onClick={onAutoSchedule}
            disabled={isScheduling}
            className="min-h-[44px] px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 shadow-lg shadow-indigo-950 flex items-center gap-1.5 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 motion-safe:animate-pulse" />
            {isScheduling ? "AI Scheduling..." : "AI Auto-Schedule Tasks"}
          </button>
        </div>
      </div>

      {/* Main Agenda Visual Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {daysToShow.map((day, idx) => {
          const dayEvents = getEventsForDay(day, filteredEvents);
          // Sort events by start time
          dayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          const isToday = idx === 0;

          return (
            <div
              key={idx}
              id={`agenda-day-${idx}`}
              className={`bg-slate-950/60 border ${
                isToday ? "border-indigo-500/30 ring-1 ring-indigo-500/10" : "border-slate-800/80"
              } rounded-xl p-3 flex flex-col h-[320px] transition hover:border-slate-700`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                <span className="text-xs font-bold text-white font-mono">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  isToday ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"
                }`}>
                  {day.getDate()}
                </span>
              </div>

              {/* Day Events Scrollbox */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                {dayEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-[10px] text-slate-600 py-10 border border-dashed border-slate-900 rounded-lg">
                    <span>Empty agenda</span>
                  </div>
                ) : (
                  dayEvents.map((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const isCompleted = event.taskId 
                      ? tasks.find((t) => t.id === event.taskId)?.completed 
                      : false;

                    // Neon styling for AI blocks
                    const cardBg = event.isAIScheduled
                      ? isCompleted
                        ? "bg-slate-950 text-slate-500 border-slate-900"
                        : "bg-indigo-950/40 border-indigo-900/50 hover:bg-indigo-950/60 hover:border-indigo-800 text-indigo-200"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300";

                    return (
                      <div
                        key={event.id}
                        id={`agenda-item-${event.id}`}
                        className={`p-2.5 pl-4 rounded-lg border text-left transition-all ${cardBg} relative overflow-hidden`}
                      >
                        {/* Left border indicator line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          event.isAIScheduled 
                            ? isCompleted ? "bg-slate-800" : "bg-indigo-500" 
                            : "bg-slate-500"
                        }`}></div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono opacity-80 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          
                          {event.isAIScheduled && (
                            <span className="text-[8px] tracking-wider font-bold bg-amber-500/10 text-amber-400 font-mono px-1 rounded uppercase">
                              AI Focus
                            </span>
                          )}
                        </div>
                        
                        <h4 className={`text-xs font-bold truncate leading-tight ${isCompleted ? "line-through text-slate-600" : ""}`}>
                          {event.title}
                        </h4>
                        
                        {event.description && (
                          <p className="text-[10px] opacity-70 mt-1 line-clamp-2 leading-normal">
                            {event.description}
                          </p>
                        )}

                        {event.isAIScheduled && event.taskId && !isCompleted && (
                          <button
                            id={`btn-complete-cal-task-${event.id}`}
                            onClick={() => onCompleteTask(event.taskId!)}
                            className="w-full mt-2 text-[9px] font-bold font-mono py-1 px-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition text-center"
                          >
                            Mark Goal Completed
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start gap-2 text-xs">
        <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div>
          <p className="text-slate-300 leading-normal">
            <strong className="text-white">AI Scheduling Engine Activated:</strong> Auto-Schedule uses advanced logic to read your backlog and automatically map time-blocks to your gaps, maximizing your peak biological cognitive zones (morning deep focus window) and dodging other meetings.
          </p>
        </div>
      </div>
    </div>
  );
}
