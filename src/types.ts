export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string (YYYY-MM-DDTHH:MM)
  priority: "low" | "medium" | "high";
  estimatedDuration: string; // hours, e.g. "1.5"
  completed: boolean;
  category: "work" | "study" | "personal" | "finance" | "health";
  riskScore?: number; // 0-100%
  urgency?: "low" | "medium" | "high" | "critical";
  riskReason?: string;
  nextAction?: string; // AI generated micro-step
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  description?: string;
  isAIScheduled?: boolean;
  taskId?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly";
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  category: string;
}

export interface SubTask {
  id: string;
  title: string;
  duration: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  title: string;
  type: "immediate" | "planning" | "habit";
  description: string;
  impact: string;
  reasoning?: ReasoningContext;
  multiFactorScores?: RecommendationFactors;
  source?: "Gemini AI" | "Chronos Local Intelligence";
  _meta?: { provider: string };
}

export interface NotificationNudge {
  id: string;
  title: string;
  message: string;
  taskId: string;
  time: string;
  urgency: "warning" | "danger" | "info";
  actionTaken: boolean;
}

export interface ScenarioSimulation {
  completeNow: { estimatedOutcome: string; pros: string[]; cons: string[] };
  delay: { estimatedOutcome: string; pros: string[]; cons: string[] };
  ignore: { estimatedOutcome: string; risk: string };
}

export interface ReasoningContext {
  context: string;
  evidence: string[];
  patternDetection: string;
  riskAssessment: string;
  scenarioSimulation: ScenarioSimulation;
  confidenceBand: "Very High" | "High" | "Moderate" | "Low" | "Insufficient Evidence";
  evidenceQuality: "Strong" | "Moderate" | "Limited" | "None";
  explanation: string;
}

export interface RecommendationFactors {
  urgency: number;
  impact: number;
  effort: number;
  dependency: number;
  energyMatch: number;
  timeFit: number;
  risk: number;
}

export interface BehavioralSummary {
  preferredWorkWindow: string;
  averageCompletionDelay: string;
  frequentlyPostponedCategory: string;
  ignoredRecommendationsRate: string;
  averageTaskCompletionRate: string;
  recurringPattern: string;
}

export interface ChronosContext {
  calendar: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  behavioralSummary: BehavioralSummary;
  systemTime: string;
}
