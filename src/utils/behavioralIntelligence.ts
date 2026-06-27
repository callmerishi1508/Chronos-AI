import { Task, CalendarEvent, Habit, BehavioralSummary, ChronosContext } from "../types";
import { safeParseStorage, setSafeStorage } from "./storageGuard";

export function trackRecommendationIgnored(id: string) {
  const metrics = safeParseStorage("chronos_behavior_metrics", { ignored: 0, total: 0 });
  metrics.ignored += 1;
  setSafeStorage("chronos_behavior_metrics", metrics);
}

export function trackRecommendationAccepted(id: string) {
  const metrics = safeParseStorage("chronos_behavior_metrics", { ignored: 0, total: 0 });
  metrics.total += 1;
  setSafeStorage("chronos_behavior_metrics", metrics);
}

export function generateBehavioralSummary(tasks: Task[], events: CalendarEvent[]): BehavioralSummary {
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  const metrics = safeParseStorage("chronos_behavior_metrics", { ignored: 0, total: 0 });
  const totalShown = Math.max(metrics.total + metrics.ignored, 1); // avoid div zero
  const ignoredRate = Math.round((metrics.ignored / totalShown) * 100);

  // Deriving preferred work window and delayed tasks (Mocking some advanced logic for demo)
  const preferredWorkWindow = completedTasks.length > 0 ? "9:00 AM - 11:30 AM" : "Flexible";
  const averageCompletionDelay = completedTasks.length > 0 ? "18 minutes" : "0 minutes";
  const frequentlyPostponedCategory = "Assignments";
  const recurringPattern = "Coding completed earlier than writing tasks.";

  return {
    preferredWorkWindow,
    averageCompletionDelay,
    frequentlyPostponedCategory,
    ignoredRecommendationsRate: `${ignoredRate}%`,
    averageTaskCompletionRate: `${completionRate}%`,
    recurringPattern
  };
}

export function buildChronosContext(tasks: Task[], events: CalendarEvent[], habits: Habit[]): ChronosContext {
  return {
    calendar: events,
    tasks,
    habits,
    behavioralSummary: generateBehavioralSummary(tasks, events),
    systemTime: new Date().toISOString()
  };
}
