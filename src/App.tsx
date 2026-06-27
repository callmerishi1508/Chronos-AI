import React, { useState, useEffect } from "react";
import { 
  Sparkles, ShieldCheck, Wifi, Flame, Clock, Calendar, 
  Terminal, MessageSquare, Mic, Heart, AlertTriangle, Play, HelpCircle, Activity, Hourglass, ShieldAlert, Brain, Crosshair,
  ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { A11yProvider } from "./context/A11yContext";

import { Task, CalendarEvent, Habit, SubTask, ChatMessage, Recommendation, NotificationNudge } from "./types";
const RecommendationEngine = React.lazy(() => import("./components/RecommendationEngine"));
const TaskPlanner = React.lazy(() => import("./components/TaskPlanner"));
const ChronosCommandCenter = React.lazy(() => import("./components/ChronosCommandCenter"));
const PremiumOnboarding = React.lazy(() => import("./components/PremiumOnboarding"));
const JudgeDemoHUD = React.lazy(() => import("./components/JudgeDemoHUD"));
const EmergencyIntervention = React.lazy(() => import("./components/EmergencyIntervention"));

const CalendarView = React.lazy(() => import("./components/CalendarView"));
const HabitTracker = React.lazy(() => import("./components/HabitTracker"));
const AgentWorkspace = React.lazy(() => import("./components/AgentWorkspace"));
const VoiceAssistant = React.lazy(() => import("./components/VoiceAssistant"));
const AICompanionChat = React.lazy(() => import("./components/AICompanionChat"));
const FutureSelfSimulator = React.lazy(() => import("./components/FutureSelfSimulator"));
const PersonalTimeIntelligence = React.lazy(() => import("./components/PersonalTimeIntelligence"));
const ChronosReasoningInspector = React.lazy(() => import("./components/ChronosReasoningInspector"));
import ErrorBoundary from "./components/ErrorBoundary";
import HealthMonitor from "./components/HealthMonitor";
import ChaosTestingHUD from "./components/ChaosTestingHUD";
import { fetchAI } from "./utils/aiClient";
import { safeParseStorage, setSafeStorage } from "./utils/storageGuard";
import { useSharedState } from "./utils/useSharedState";
import { buildChronosContext, trackRecommendationAccepted } from "./utils/behavioralIntelligence";
import { useAIProvider, AIBanner } from "./context/AIProviderContext";
import { SettingsPanel } from "./components/SettingsPanel";
import { AIBadge } from "./components/AIBadge";

export default function App() {
  const { activeProvider } = useAIProvider();
  // --- STATE ---
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return Boolean(safeParseStorage("chronos_onboarded", false));
  });
  const [tasks, setTasks] = useSharedState<Task[]>("lifesaver_tasks", []);
  const [events, setEvents] = useSharedState<CalendarEvent[]>("lifesaver_events", []);
  const [habits, setHabits] = useSharedState<Habit[]>("lifesaver_habits", []);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [logs, setLogs] = useSharedState<string[]>("lifesaver_logs", []);
  const [activeGoal, setActiveGoal] = useSharedState<string>("lifesaver_goal", "");
  const [messages, setMessages] = useSharedState<ChatMessage[]>("lifesaver_messages", []);
  const [briefing, setBriefing] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Loading & statuses
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPlanningAgent, setIsPlanningAgent] = useState(false);
  const [isRefreshingAdvice, setIsRefreshingAdvice] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false);

  // Active view navigation
  const [activeTab, setActiveTab] = useSharedState<"command" | "tasks" | "calendar" | "agent" | "habits" | "speech" | "chat" | "human-os" | "xai" | "simulator">("chronos_activeTab", "tasks");
  const [activeFocusTask, setActiveFocusTask] = useSharedState<Task | null>("chronos_activeFocusTask", null);

  // In-app alert nudges
  const [alerts, setAlerts] = useState<NotificationNudge[]>([]);

  // Emergency Intervention Protocol State
  const [isEmergencyMode, setIsEmergencyMode] = useSharedState<boolean>("chronos_emergencyMode", false);

  // Judge Demo state
  const [isJudgeDemoActive, setIsJudgeDemoActive] = useSharedState<boolean>("chronos_demoMode", false);
  const [isRecoveryPlanCommitted, setIsRecoveryPlanCommitted] = useState(false);
  const [showSecondaryTools, setShowSecondaryTools] = useState(false);
  const [preDemoState, setPreDemoState] = useState<{tasks: Task[], events: CalendarEvent[], goal: string} | null>(null);

  // Google Calendar integration
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<any>(null);

  // Demo Dataset Injector (5 clicks)
  const [logoClicks, setLogoClicks] = useState(0);
  const [demoToast, setDemoToast] = useState(false);

  useEffect(() => {
    if (logoClicks > 0 && logoClicks < 5) {
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
    if (logoClicks >= 5) {
      setLogoClicks(0);
      setDemoToast(true);
      setTimeout(() => setDemoToast(false), 3000);
      triggerNarrativeDemo();
    }
  }, [logoClicks]);

  const triggerNarrativeDemo = () => {
    // Demo Sandbox Reset: Guarantee pristine state
    localStorage.clear();

    // 1. Narrative Tasks
    const narrativeTasks: Task[] = [
      {
        id: "demo-task-1",
        title: "Launch Startup MVP",
        description: "Deploy the core application to production servers.",
        deadline: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "4",
        completed: false,
        category: "work",
        riskScore: 90,
        urgency: "critical",
        riskReason: "Underestimated. Complex infrastructure dependencies.",
        nextAction: "Verify database migrations."
      },
      {
        id: "demo-task-2",
        title: "Prepare Financial Projection",
        description: "Draft 12-month runway spreadsheet for seed round.",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "2",
        completed: false,
        category: "finance",
        riskScore: 60,
        urgency: "medium",
        riskReason: "Data is stable, moderate cognitive load.",
        nextAction: "Export Q3 analytics."
      },
      {
        id: "demo-task-3",
        title: "Fix Critical Bug",
        description: "Resolve the 504 Gateway Timeout on user signup.",
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "1",
        completed: false,
        category: "work",
        riskScore: 95,
        urgency: "critical",
        riskReason: "Immediate blocker for launch timeline.",
        nextAction: "Check server load balancers."
      },
      {
        id: "demo-task-4",
        title: "Record Demo Video",
        description: "Record 3-minute pitch video for the hackathon submission.",
        deadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "1.5",
        completed: false,
        category: "study",
        riskScore: 70,
        urgency: "high",
        riskReason: "Requires multiple takes and quiet environment.",
        nextAction: "Write video script."
      },
      {
        id: "demo-task-5",
        title: "Submit Hackathon",
        description: "Final submission on Devpost.",
        deadline: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "0.5",
        completed: false,
        category: "study",
        riskScore: 85,
        urgency: "high",
        riskReason: "Hard deadline. No extensions.",
        nextAction: "Upload video and code."
      }
    ];

    // 2. Narrative Calendar Events
    const narrativeEvents: CalendarEvent[] = [
      {
        id: "demo-evt-1",
        title: "Investor Meeting",
        start: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        description: "Seed round pitch with VC partners."
      },
      {
        id: "demo-evt-2",
        title: "Team Standup",
        start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
        description: "Daily synchronization."
      },
      {
        id: "demo-evt-3",
        title: "Pitch Practice",
        start: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
        description: "Rehearse demo video script."
      },
      {
        id: "demo-evt-4",
        title: "Customer Interview",
        start: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        description: "Beta tester feedback session."
      },
      {
        id: "demo-evt-5",
        title: "Post-launch Retrospective",
        start: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 74 * 60 * 60 * 1000).toISOString(),
        description: "Team review of launch metrics."
      }
    ];

    setTasks(narrativeTasks);
    setEvents(narrativeEvents);
    setActiveGoal("Launch MVP and secure seed funding before hackathon deadline.");
  };

  // Onboarding complete handler
  const handleOnboardingComplete = (data: {
    mission: string;
    identity: string;
    challenge: string;
    workStyle: string;
    archetype: string;
    biasValue: number;
    tasks: any[];
  }) => {
    setSafeStorage("chronos_onboarded", "true");
    setIsOnboarded(true);

    // Save and apply active goal
    setActiveGoal(data.mission);
    setSafeStorage("lifesaver_goal", data.mission);

    // Save and apply tasks safely
    setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    setSafeStorage("lifesaver_tasks", Array.isArray(data.tasks) ? data.tasks : []);

    // Create corresponding events
    const initialEvents: CalendarEvent[] = [
      {
        id: "demo-event-1",
        title: "🚨 Teammate Chat Sync (Conflict)",
        start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        description: "General coordination chat."
      },
      {
        id: "demo-event-2",
        title: "🚨 Non-essential Prep (Conflict)",
        start: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        description: "Status review session."
      }
    ];
    setEvents(initialEvents);
    setSafeStorage("lifesaver_events", initialEvents);

    // Add cinematic diagnostic logs
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs([
      `[${timeStr}] [SUCCESS] Chronos OS fully initialized for ${data.identity}.`,
      `[${timeStr}] [INFO] Temporal archetype calibrated: ${data.archetype}.`,
      `[${timeStr}] [INFO] System planning optimism bias calibrated to +${data.biasValue}%.`,
      `[${timeStr}] [SUCCESS] Active command mission locked: ${data.mission}.`,
      `[${timeStr}] [WARNING] Threat level CRITICAL: overlapping calendar conflicts detected.`
    ]);
  };

  // Trigger Judge Demo Scenario
  const triggerJudgeDemo = () => {
    setIsJudgeDemoActive(true);
    setIsRecoveryPlanCommitted(false); // start in vulnerable Failure Future state
    setActiveTab("command"); // instantly take them to the Command Center
    setShowSecondaryTools(false);

    // 1. Load Hackathon backlog
    const hackathonTasks: Task[] = [
      {
        id: "demo-task-1",
        title: "Submit CS Hackathon Template",
        description: "Submit PDF slides, source repo URL, and verify the backend API endpoints before midnight evaluation.",
        deadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "2",
        completed: false,
        category: "study",
        riskScore: 75,
        urgency: "high",
        riskReason: "Final deadline is fast approaching with critical unresolved technical fields.",
        nextAction: "Complete the submission form overview."
      },
      {
        id: "demo-task-2",
        title: "Deploy Database Replication Cluster",
        description: "Critical database mitigation. Under heavy concurrent loads, the replication layer overflows. Essential to avoid 504 errors.",
        deadline: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        estimatedDuration: "5",
        completed: false,
        category: "work",
        riskScore: 92,
        urgency: "critical",
        riskReason: "Underestimated. Systematic underestimation bias detected. Requires dedicated Focus Shields to complete safely.",
        nextAction: "Configure and verify replication connection pools."
      },
      {
        id: "demo-task-3",
        title: "Verify API Endpoints & Run Integration Suite",
        description: "Validate connection state and ensure the platform handles traffic spikes during judge review.",
        deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        estimatedDuration: "3",
        completed: false,
        category: "study",
        riskScore: 60,
        urgency: "high",
        riskReason: "Tied to database deployment blocks. High failure probability.",
        nextAction: "Run basic local API response test."
      },
      {
        id: "demo-task-4",
        title: "Rewrite Complete Project Documentation",
        description: "Polishing details and descriptions. Low functional risk but consumes valuable cognitive energy.",
        deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        estimatedDuration: "4.5",
        completed: false,
        category: "study",
        riskScore: 78,
        urgency: "high",
        riskReason: "Unnecessary documentation overhead. Recommended for immediate descope/pruning.",
        nextAction: "Draft general summary intro paragraphs."
      }
    ];

    setPreDemoState({ tasks, events, goal: activeGoal });
    setTasks(hackathonTasks);

    // 2. Load conflicting calendar events (causing high Threat Level!)
    const hackathonEvents: CalendarEvent[] = [
      {
        id: "demo-event-1",
        title: "🚨 Teammate Chat Sync (Conflict)",
        start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        description: "General coordination chat."
      },
      {
        id: "demo-event-2",
        title: "🚨 Q&A Session (Conflict)",
        start: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        description: "Non-essential general info panel."
      },
      {
        id: "demo-event-3",
        title: "🚨 Project Prep review (Conflict)",
        start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 7.5 * 60 * 60 * 1000).toISOString(),
        description: "Pre-submission status review."
      }
    ];

    setEvents(hackathonEvents);

    // 3. Set Active Goal
    setActiveGoal("Secure 88% Success Probability on Hackathon Submission and eliminate all database deployment risk before 10 PM tonight.");

    // 4. Set dynamic briefing
    setBriefing("Chronos AI Diagnostic loaded: Optimistic Builder profile detected. Critical +63% underestimation bias on 'Deploy Database Replication Cluster'. Current baseline success probability is 32% (Unmitigated Collapse Scenario). Action Required: Deploy defensive Focus Shields and activate descope of non-essential documentation.");

    // 5. Populate Logs
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs([
      `[${timeStr}] [CRITICAL] Chronos detected +62% engineering optimism bias on database components.`,
      `[${timeStr}] [WARNING] Simulated Failure Trigger: Connection Pool Saturation at midnight.`,
      `[${timeStr}] [INFO] Loaded Scenario: Hackathon Submission Emergency.`,
      `[${timeStr}] [SUCCESS] Sequenced 'Optimistic Builder' Behavioral Genome.`,
      `[${timeStr}] [INFO] Judge Demo Mode started. Explore the Command Center and apply the Recovery Plan!`
    ]);
  };

  // --- INITIAL COMPONENT PRE-SETS & PERSISTENCE ---
  useEffect(() => {
    // 1. Check if Gemini AI Key is active
    fetchAI("/api/ai-status", {}, { priority: "critical" })
      .then((data) => setAiActive(data.active))
      .catch(() => setAiActive(false));

    // 1.5. Check Google Calendar Auth Status
    const fetchAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/status");
        if (res.ok) {
          const data = await res.json();
          setIsGoogleConnected(data.connected);
          if (data.connected && data.profile) {
            setGoogleProfile(data.profile);
            fetchRealEvents();
          }
        }
      } catch(e) {}
    };

    const fetchRealEvents = async () => {
      try {
        const res = await fetch("/api/calendar/events");
        if (res.ok) {
          const data = await res.json();
          if (data.events && Array.isArray(data.events)) {
            // Merge with local AI scheduled events, keeping real ones
            setEvents(prev => {
              const localAI = prev.filter(e => e.isAIScheduled);
              return [...data.events, ...localAI];
            });
          }
        }
      } catch(e) {}
    };

    fetchAuthStatus();
    
    // Auto-refresh calendar every 5 minutes if connected
    const syncInterval = setInterval(() => {
      if (isGoogleConnected) fetchRealEvents();
    }, 5 * 60 * 1000);

    // 2. Load from localStorage or set defaults
    if (tasks.length === 0 && !safeParseStorage("lifesaver_tasks", null)) {
      // Set pristine rich default tasks for immediate value
      const nowStr = new Date().toISOString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      const standardTasks: Task[] = [
        {
          id: "task-1",
          title: "Complete CS Hackathon submission template",
          description: "Ensure you link your public project description PDF, source code repo URL and verify the API endpoints respond cleanly without crash.",
          deadline: tomorrow.toISOString().substring(0, 16),
          priority: "high",
          estimatedDuration: "2",
          completed: false,
          category: "study",
          riskScore: 75,
          urgency: "high",
          riskReason: "Deadline is tomorrow at noon with multiple unresolved technical fields.",
          nextAction: "Create the GitHub README file outline today."
        },
        {
          id: "task-2",
          title: "Submit rent and electricity payments",
          description: "Due by tonight to avoid late penalty interest surcharge.",
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().substring(0, 16), // Due in 4 hours
          priority: "high",
          estimatedDuration: "0.5",
          completed: false,
          category: "finance",
          riskScore: 95,
          urgency: "critical",
          riskReason: "Buffer window has completely closed. High penalty risk.",
          nextAction: "Login to the banking app and check current balance."
        },
        {
          id: "task-3",
          title: "Schedule physical therapist review",
          description: "Annual prescription review.",
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16), // Due in 5 days
          priority: "low",
          estimatedDuration: "1",
          completed: false,
          category: "health",
          riskScore: 15,
          urgency: "low",
          riskReason: "Booking slot faces no time conflicts.",
          nextAction: "Open therapist scheduler link."
        }
      ];
      setTasks(standardTasks);
      setSafeStorage("lifesaver_tasks", standardTasks);
    }

    if (events.length === 0 && !safeParseStorage("lifesaver_events", null)) {
      const today = new Date();
      today.setHours(10, 0, 0, 0);
      const todayEnd = new Date(today.getTime() + 1.5 * 60 * 60 * 1000);

      const standardEvents: CalendarEvent[] = [
        {
          id: "event-1",
          title: "Weekly Hackathon Sync",
          start: today.toISOString(),
          end: todayEnd.toISOString(),
          description: "General checkpoint with coordinators."
        }
      ];
      setEvents(standardEvents);
      setSafeStorage("lifesaver_events", standardEvents);
    }

    if (habits.length === 0 && !safeParseStorage("lifesaver_habits", null)) {
      const standardHabits: Habit[] = [
        { id: "habit-1", title: "Review backlog items daily", frequency: "daily", streak: 4, category: "work" },
        { id: "habit-2", title: "Review CS slides for 20 mins", frequency: "daily", streak: 2, category: "study" }
      ];
      setHabits(standardHabits);
      setSafeStorage("lifesaver_habits", standardHabits);
    }

    if (messages.length === 0 && !safeParseStorage("lifesaver_messages", null)) {
      const initialMsgs: ChatMessage[] = [
        {
          id: "msg-1",
          role: "assistant",
          content: "Greetings. I am your autonomous companion, 'Chronos AI'. Procrastination ends now. Let me know what high-stakes deadlines you are facing, and we will break them down into non-ignorable, 5-minute micro-actions. Let's conquer the day!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initialMsgs);
      setSafeStorage("lifesaver_messages", initialMsgs);
    }



    // Get initial recommendations on start
    refreshRecommendations();
  }, []);

  // Sync to localstorage whenever state shifts
  useEffect(() => {
    if (isJudgeDemoActive) return;
    if (tasks.length > 0) setSafeStorage("lifesaver_tasks", tasks);
  }, [tasks, isJudgeDemoActive]);

  useEffect(() => {
    if (isJudgeDemoActive) return;
    if (events.length > 0) setSafeStorage("lifesaver_events", events);
  }, [events, isJudgeDemoActive]);

  useEffect(() => {
    if (isJudgeDemoActive) return;
    if (habits.length > 0) setSafeStorage("lifesaver_habits", habits);
  }, [habits, isJudgeDemoActive]);

  // Generate real-time alerting context-aware notification nudges based on backlog
  useEffect(() => {
    const dangerTasks = tasks.filter((t) => !t.completed && t.urgency === "critical");
    const activeAlerts: NotificationNudge[] = dangerTasks.map((task) => ({
      id: `alert-${task.id}`,
      title: "🔥 CRITICAL IMPACT ALERT",
      message: `"${task.title}" has a critical risk of failure. Click to trigger 5-min buster.`,
      taskId: task.id,
      time: "Just Now",
      urgency: "danger",
      actionTaken: false
    }));
    setAlerts(activeAlerts);
  }, [tasks]);

  // --- HANDLERS ---
  const refreshRecommendations = async () => {
    setIsRefreshingAdvice(true);
    try {
      const chronosContext = buildChronosContext(tasks, events, habits);
      const data = await fetchAI("/api/recommendations", { tasks, habits, chronosContext });
      setBriefing(data.briefing || "The AI Daily Briefing service is temporarily operating in local backup mode. Focus on completing your highest priority tasks!");
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      console.warn("Failed to load recommendations, activating offline-first cache:", err);
      const pendingCount = tasks.filter(t => !t.completed).length;
      setBriefing(`📡 CHRONOS OFFLINE-FIRST CADENCE ACTIVATED: Your local behavioral cache is serving as the primary baseline. You have ${pendingCount} pending tasks. Standard morning energy peak at 09:00 - 12:00 is recommended for engineering sprints.`);
      const offlineRecs = tasks.filter(t => !t.completed).slice(0, 3).map((t, index) => ({
        id: `offline-rec-${index}`,
        title: `Protect path for: "${t.title.substring(0, 30)}"`,
        type: "planning" as const,
        description: t.priority === "high" ? "High Priority task with high failure delay liability. Allocate an early focus shield." : "A low-switching-cost task. Group with other micro-activities.",
        impact: "Maintains local focus and mitigates context switching."
      }));
      setRecommendations(offlineRecs.length > 0 ? offlineRecs : [
        { 
          id: "off-rec-empty-1", 
          title: "Establish Primary Agenda Core", 
          type: "planning" as const, 
          description: "You have no active tasks in your backlog. Create a high-priority task to calibrate focus window.", 
          impact: "Initializes diagnostic tracking." 
        }
      ]);
    } finally {
      setIsRefreshingAdvice(false);
    }
  };

  const handleAddTask = (taskInput: Omit<Task, "id" | "completed">) => {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}`,
      completed: false
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    setSafeStorage("lifesaver_tasks", updated);
    refreshRecommendations();
  };

  const handleCompleteTask = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updated);
    setSafeStorage("lifesaver_tasks", updated);
    refreshRecommendations();
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    setSafeStorage("lifesaver_tasks", updated);
    refreshRecommendations();
  };

  const handlePrioritizeBacklog = async () => {
    setIsPrioritizing(true);
    try {
      const data = await fetchAI("/api/prioritize", { tasks });
      
      if (data && Array.isArray(data.prioritization)) {
        const prioritized = tasks.map((t) => {
          const item = data.prioritization.find((p: any) => p.taskId === t.id);
          if (item) {
            return {
              ...t,
              riskScore: item.riskScore,
              urgency: item.urgency,
              riskReason: item.riskReason,
              nextAction: item.nextAction,
            };
          }
          return t;
        });

        setTasks(prioritized);
        setSafeStorage("lifesaver_tasks", prioritized);
        refreshRecommendations();
      } else {
        console.error("Prioritizing backlog response was not an array of prioritizations:", data);
      }
    } catch (err) {
      console.warn("Prioritizing backlog failed, running local offline prioritizer:", err);
      const prioritized = tasks.map((t, idx) => {
        const priorityFactor = t.priority === "high" ? 75 : t.priority === "medium" ? 45 : 20;
        const indexFactor = (tasks.length - idx) * 3;
        const totalRisk = Math.min(95, priorityFactor + indexFactor);
        const urgency = (totalRisk > 70 ? "critical" : totalRisk > 40 ? "medium" : "low") as "critical" | "medium" | "low";
        return {
          ...t,
          riskScore: totalRisk,
          urgency,
          riskReason: t.priority === "high" 
            ? "Requires concentrated focus block. Context switches here are highly penalized." 
            : "Secondary activity. Group into administrative/low-energy periods.",
          nextAction: t.priority === "high" 
            ? "Commit morning Focus Shield" 
            : "Defer until after 14:00"
        };
      });
      setTasks(prioritized);
      setSafeStorage("lifesaver_tasks", prioritized);
      refreshRecommendations();
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleAutoSchedule = async () => {
    setIsScheduling(true);
    try {
      const data = await fetchAI("/api/schedule", { tasks, events });
      
      if (data && Array.isArray(data.scheduledBlocks)) {
        const aiBlocks: CalendarEvent[] = data.scheduledBlocks.map((block: any) => ({
          id: block.id,
          title: block.title,
          start: block.start,
          end: block.end,
          description: block.description,
          isAIScheduled: true,
          taskId: block.taskId
        }));

        // Merge with non-AI events
        const cleanEvents = events.filter((e) => !e.isAIScheduled);
        const merged = [...cleanEvents, ...aiBlocks];
        setEvents(merged);
        setSafeStorage("lifesaver_events", merged);
      } else {
        console.error("Auto scheduling response was not an array of scheduledBlocks:", data);
      }
    } catch (err) {
      console.warn("Auto scheduling failed, running offline calendar builder:", err);
      const scheduledEvents: CalendarEvent[] = [];
      let currentTime = new Date();
      // Round to next 15 minutes for clean starting time
      const minutes = currentTime.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      currentTime.setMinutes(roundedMinutes, 0, 0);

      tasks.filter(t => !t.completed).forEach((task, index) => {
        const start = new Date(currentTime.getTime() + (index === 0 ? 15 : 45) * 60 * 1000);
        const end = new Date(start.getTime() + (task.priority === "high" ? 90 : 45) * 60 * 1000);
        
        scheduledEvents.push({
          id: `block-offline-${index}-${Date.now()}`,
          title: `🛡️ Focus Shield: ${task.title.substring(0, 30)}`,
          start: start.toISOString(),
          end: end.toISOString(),
          description: `Offline-calibrated defense sprint. Minimizing estimation tax.`,
          isAIScheduled: true,
          taskId: task.id
        });

        currentTime = end;
      });

      const cleanEvents = events.filter((e) => !e.isAIScheduled);
      const merged = [...cleanEvents, ...scheduledEvents];
      setEvents(merged);
      setSafeStorage("lifesaver_events", merged);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleAutoScheduleFocusBlocks = (blocks: { title: string; durationMinutes: number; taskId: string }[]) => {
    const scheduledEvents: CalendarEvent[] = [];
    let currentTime = new Date();
    // Round to next 15 minutes for clean starting time
    const minutes = currentTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    currentTime.setMinutes(roundedMinutes, 0, 0);

    blocks.forEach((block, index) => {
      // Start 15 minutes after previous ends (or 15 min from now for first)
      const start = new Date(currentTime.getTime() + (index === 0 ? 15 : 30) * 60 * 1000);
      const end = new Date(start.getTime() + block.durationMinutes * 60 * 1000);
      
      scheduledEvents.push({
        id: `block-recovery-${index}-${Date.now()}`,
        title: block.title,
        start: start.toISOString(),
        end: end.toISOString(),
        description: `🚨 Deadline Recovery Sprint. Keep distraction variables at zero!`,
        isAIScheduled: true,
        taskId: block.taskId
      });

      // Update pointer
      currentTime = end;
    });

    const cleanEvents = events.filter((e) => !e.isAIScheduled);
    const merged = [...cleanEvents, ...scheduledEvents];
    setEvents(merged);
    setSafeStorage("lifesaver_events", merged);
  };

  const handleClearAIScheduled = () => {
    const cleaned = events.filter((e) => !e.isAIScheduled);
    setEvents(cleaned);
    setSafeStorage("lifesaver_events", cleaned);
  };

  const handleAddHabit = (habitInput: Omit<Habit, "id" | "streak" | "lastCompleted">) => {
    const newHabit: Habit = {
      ...habitInput,
      id: `habit-${Date.now()}`,
      streak: 0
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    setSafeStorage("lifesaver_habits", updated);
  };

  const handleCompleteHabit = (id: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = habits.map((h) => {
      if (h.id === id) {
        if (h.lastCompleted === todayStr) {
          // undo completion
          return {
            ...h,
            streak: Math.max(0, h.streak - 1),
            lastCompleted: undefined
          };
        } else {
          return {
            ...h,
            streak: h.streak + 1,
            lastCompleted: todayStr
          };
        }
      }
      return h;
    });
    setHabits(updated);
    setSafeStorage("lifesaver_habits", updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    setSafeStorage("lifesaver_habits", updated);
  };

  const handlePlanCreated = (goal: string, plannedSubtasks: SubTask[], plannerLogs: string[]) => {
    if (plannedSubtasks.length === 0 && plannerLogs.length === 0) {
      setIsPlanningAgent(true);
      setActiveGoal(goal);
      return;
    }
    setSubtasks(plannedSubtasks);
    setLogs(plannerLogs);
    setIsPlanningAgent(false);
    setSafeStorage("lifesaver_goal", goal);
    setSafeStorage("lifesaver_subtasks", plannedSubtasks);
    setSafeStorage("lifesaver_logs", plannerLogs);
  };

  const handleUpdateSubtask = (id: string, completed: boolean) => {
    const updated = subtasks.map((s) => {
      if (s.id === id) {
        return { ...s, status: (completed ? "completed" : "pending") as any };
      }
      return s;
    });
    setSubtasks(updated);
    setSafeStorage("lifesaver_subtasks", updated);
  };

  const handleClearPlan = () => {
    setActiveGoal("");
    setSubtasks([]);
    setLogs([]);
    localStorage.removeItem("lifesaver_goal");
    localStorage.removeItem("lifesaver_subtasks");
    localStorage.removeItem("lifesaver_logs");
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = [...messages, newUserMsg];
    setMessages(currentHistory);
    setIsChatLoading(true);

    try {
      const data = await fetchAI("/api/chat", { messages: currentHistory });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [...currentHistory, aiMsg];
      setMessages(updatedHistory);
      setSafeStorage("lifesaver_messages", updatedHistory);
    } catch (err) {
      console.error("Chat companion failed:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialMsgs = [
      {
        id: `msg-${Date.now()}`,
        role: "assistant" as const,
        content: "Reset complete. What priorities are we securing next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMsgs);
    setSafeStorage("lifesaver_messages", initialMsgs);
  };

  // Triggered by the visual speech assistant extractions
  const handleActionExtracted = (action: { type: string; title: string; time?: string }) => {
    if (action.type === "task") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      handleAddTask({
        title: action.title,
        description: `Voice Created: ${action.title} (${action.time || "Due soon"})`,
        deadline: tomorrow.toISOString().substring(0, 16),
        priority: "high",
        estimatedDuration: "1",
        category: "work"
      });
    } else if (action.type === "habit") {
      handleAddHabit({
        title: action.title,
        frequency: "daily",
        category: "health"
      });
    } else if (action.type === "schedule") {
      // Create a temporary mock scheduled block tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow.getTime() + 1.5 * 60 * 60 * 1000);

      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: `🔥 Voice Block: ${action.title}`,
        start: tomorrow.toISOString(),
        end: tomorrowEnd.toISOString(),
        description: `Scheduled via Voice Companion: ${action.title}`
      };
      const updated = [...events, newEvent];
      setEvents(updated);
      setSafeStorage("lifesaver_events", updated);
    }
  };

  const handleApplyRecommendation = (rec: Recommendation) => {
    trackRecommendationAccepted(rec.id);
    if (rec.type === "immediate") {
      // Start buster on first matching or arbitrary task
      const match = tasks.find((t) => !t.completed);
      if (match) {
        setActiveFocusTask(match);
        setActiveTab("tasks");
        // Scroll to pomodoro
        document.getElementById("pomodoro-timer-box")?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (rec.type === "planning") {
      // Fire scheduler
      handleAutoSchedule();
      setActiveTab("calendar");
    } else if (rec.type === "habit") {
      // Complete first habit
      if (habits.length > 0) {
        handleCompleteHabit(habits[0].id);
      }
    }
  };

  const activeFocusAlert = alerts[0];

  if (!isOnboarded) {
    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center font-mono text-xs text-indigo-500 animate-pulse">Initializing Chronos OS...</div>}>
        <A11yProvider>
          <MotionConfig reducedMotion="user">
            <PremiumOnboarding 
              onComplete={handleOnboardingComplete} 
              onStartDemo={() => {
                triggerJudgeDemo();
                setIsOnboarded(true);
              }}
            />
          </MotionConfig>
        </A11yProvider>
      </React.Suspense>
    );
  }

  return (
    <A11yProvider>
      <MotionConfig reducedMotion="user">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:p-4 focus:bg-indigo-600 focus:text-white focus:font-bold">
          Skip to main content
        </a>
        <div id="root-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          {/* Top Header Banner */}
          <header className="px-4 py-4 md:px-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50">
            <div className="flex flex-wrap items-center gap-3">
          {/* Brand Standalone Animated Logo */}
          <div 
            className="relative h-12 w-12 flex items-center justify-center shrink-0 cursor-pointer"
            onClick={() => setLogoClicks(prev => prev + 1)}
          >
            {/* Pulsing Backlight Glow */}
            <motion.div 
              className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md"
              animate={{ 
                scale: [1, 1.2, 0.9, 1.1, 1],
                opacity: [0.5, 0.8, 0.4, 0.7, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            {/* Cybernetic Outer Orbit Ring */}
            <motion.div 
              className="absolute inset-0 border-2 border-dashed border-indigo-500/35 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />
            {/* Cybernetic Inner Orbit Ring */}
            <motion.div 
              className="absolute inset-1.5 border border-dotted border-indigo-400/40 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Central Glow Core */}
            <motion.div 
              className="relative h-7 w-7 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.6)] flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Hourglass className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-extrabold tracking-[0.15em] text-white font-display leading-none uppercase">
                CHRONOS <span className="text-indigo-400">AI</span>
              </h1>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping hidden sm:inline-block" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1.5 leading-none">
              Autonomous Deadline Intelligence
            </p>
          </div>
        </div>

        {/* Permanent I'm Overwhelmed & Judge Demo triggers */}
        <div className="flex items-center gap-3">
          {isJudgeDemoActive ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
                ● JUDGE DEMO ACTIVE
              </span>
              <button
                onClick={() => {
                  setIsJudgeDemoActive(false);
                  setIsRecoveryPlanCommitted(false);
                  // Reload original preset and reset onboarding so they see the flow again
                  localStorage.removeItem("lifesaver_tasks");
                  localStorage.removeItem("lifesaver_events");
                  localStorage.removeItem("chronos_onboarded");
                  window.location.reload();
                }}
                className="min-h-[44px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all font-mono cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                Reset Demo
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem("chronos_onboarded");
                  window.location.reload();
                }}
                className="min-h-[44px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all font-mono cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Replay Onboarding</span>
              </button>
              <button
                id="btn-trigger-judge-demo"
                onClick={triggerJudgeDemo}
                className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-indigo-500/20 font-mono cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>START JUDGE DEMO</span>
              </button>
            </div>
          )}

          <button
            id="btn-trigger-emergency-mode"
            onClick={() => setIsEmergencyMode(true)}
            className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:from-red-700 active:to-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse border border-red-500/20 font-mono cursor-pointer shrink-0"
          >
            <Flame className="w-4 h-4 text-white animate-bounce" />
            <span className="hidden sm:inline">I'm Overwhelmed</span>
            <span className="sm:hidden">Overwhelmed</span>
          </button>
        </div>

        {/* Diagnostic connection / AI Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {aiActive && (
            <div className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/60 px-3 py-1.5 min-h-[44px] rounded-full">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                Agent: Active
              </span>
            </div>
          )}
          <SettingsPanel />
          <div className="hidden sm:block">
            <AIBadge provider={activeProvider} />
          </div>
        </div>
      </header>

      {/* Dynamic AI Fallback Banner */}
      <AIBanner />

      {/* Demo Toast */}
      <AnimatePresence>
        {demoToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl font-mono text-xs border border-slate-700 pointer-events-none"
          >
            Demo dataset loaded.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
        
        {/* Dynamic Warning Alert Box for items in Critical danger */}
        {activeFocusAlert && (
          <div 
            id={`alert-nudge-${activeFocusAlert.id}`}
            className="group relative rounded-lg border border-red-900/30 bg-red-950/20 p-4 pl-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg overflow-hidden animate-[pulse_4s_infinite]"
          >
            {/* Geometric side accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-red-500/10 text-red-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 font-mono">
                  {activeFocusAlert.title}
                </h4>
                <p className="text-xs text-red-200/80 mt-1 leading-relaxed">
                  {activeFocusAlert.message}
                </p>
              </div>
            </div>

            <button
              id={`btn-alert-action-${activeFocusAlert.id}`}
              onClick={() => {
                const target = tasks.find((t) => t.id === activeFocusAlert.taskId);
                if (target) {
                  setActiveFocusTask(target);
                  setActiveTab("tasks");
                  document.getElementById("pomodoro-timer-box")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="min-h-[44px] min-w-[44px] px-4 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs rounded transition shrink-0 uppercase tracking-wider"
            >
              Start Pomodoro Now
            </button>
          </div>
        )}

        {/* 1. Top Panel: AI Recommendation & Coaching Engine */}
        <RecommendationEngine
          briefing={briefing || "Our diagnostic scan reveals potential timeline threats. Run 'AI Prioritize Backlog' to generate precise mitigation actions."}
          recommendations={recommendations}
          isLoading={isRefreshingAdvice}
          onRefresh={refreshRecommendations}
          onApplyImmediate={handleApplyRecommendation}
          tasks={tasks}
          onOpenReasoning={() => setActiveTab("xai")}
        />

        {/* 2. Horizontal Navigation Switcher */}
        <div className="flex border-b border-slate-800 overflow-x-auto shrink-0 scrollbar-none pb-0.5 mb-2 justify-between items-center gap-4">
          <nav className="flex gap-1 sm:gap-2">
            {[
              { id: "tasks", label: "My Tasks", icon: <Clock className="w-4 h-4 text-emerald-400" /> },
              { id: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4 text-indigo-400" /> },
              { id: "command", label: "Risk & Recovery", icon: <Crosshair className="w-4 h-4 text-rose-500" /> },
              { id: "xai", label: "XAI Inspector", icon: <Brain className="w-4 h-4 text-amber-400" /> },
              { id: "human-os", label: "Human OS", icon: <Brain className="w-4 h-4 text-indigo-400" /> },
              { id: "simulator", label: "Future Simulation", icon: <Hourglass className="w-4 h-4 text-purple-400" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setShowSecondaryTools(false);
                  }}
                  className={`min-h-[44px] relative pb-3.5 px-4 text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapsible Secondary Tools Trigger */}
          <button
            onClick={() => setShowSecondaryTools(prev => !prev)}
            className={`min-h-[44px] pb-3 px-4 text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shrink-0 border border-transparent rounded-lg py-1 ${
              showSecondaryTools || ["tasks", "simulator", "agent", "habits", "speech", "chat"].includes(activeTab)
                ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              {["agent", "habits", "speech", "chat"].includes(activeTab)
                ? `Tool: ${activeTab}`
                : "Tools Area"}
            </span>
            {showSecondaryTools ? (
              <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Secondary Collapsible Tools Panel */}
        <AnimatePresence>
          {showSecondaryTools && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4 border-b border-slate-800/80 pb-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {[
                  { id: "agent", label: "Autonomous Agent", desc: "Goal breakdowns & logs", icon: <Terminal className="w-4 h-4 text-indigo-400" /> },
                  { id: "habits", label: "Streaks & Routines", desc: "Energy & rhythm tracking", icon: <Heart className="w-4 h-4 text-pink-400" /> },
                  { id: "speech", label: "Speech Nudge", desc: "Voice diagnostic feed", icon: <Mic className="w-4 h-4 text-sky-400" /> },
                  { id: "chat", label: "Tactical Chat", desc: "Tactical AI copilot", icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
                ].map((tool) => {
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTab(tool.id as any);
                        setShowSecondaryTools(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1 group cursor-pointer ${
                        isActive
                          ? "bg-slate-900/60 border-indigo-500/40 text-indigo-400"
                          : "bg-slate-950/40 hover:bg-slate-900 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        {tool.icon}
                        <span className="text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase text-slate-500">GO →</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold block leading-tight">{tool.label}</span>
                        <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{tool.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Render Panel based on active selection with premium animations */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              <ErrorBoundary key={activeTab}>
                <React.Suspense fallback={<div className="flex h-full items-center justify-center font-mono text-xs text-slate-500 animate-pulse">Loading Module...</div>}>
                  {activeTab === "command" && (
                  <ChronosCommandCenter
                    tasks={tasks}
                    onCompleteTask={handleCompleteTask}
                    onAddTask={handleAddTask}
                    onAutoScheduleFocusBlocks={handleAutoScheduleFocusBlocks}
                    onOpenEmergency={() => setIsEmergencyMode(true)}
                    onOpenReasoning={() => setActiveTab("xai")}
                    isRecoveryPlanCommitted={isRecoveryPlanCommitted}
                    onRecoveryPlanCommitted={(committed) => setIsRecoveryPlanCommitted(committed)}
                    isEmergencyMode={isEmergencyMode}
                  />
                )}

                {activeTab === "tasks" && (
                  <TaskPlanner
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onCompleteTask={handleCompleteTask}
                    onDeleteTask={handleDeleteTask}
                    onPrioritizeBacklog={handlePrioritizeBacklog}
                    isPrioritizing={isPrioritizing}
                    activeFocusTask={activeFocusTask}
                    setActiveFocusTask={setActiveFocusTask}
                    onStartJudgeDemo={triggerJudgeDemo}
                  />
                )}

                {activeTab === "calendar" && (
                  <CalendarView
                    events={events}
                    tasks={tasks}
                    onAutoSchedule={handleAutoSchedule}
                    isScheduling={isScheduling}
                    onClearAIScheduled={handleClearAIScheduled}
                    onCompleteTask={handleCompleteTask}
                    isDemoActive={isJudgeDemoActive}
                    isGoogleConnected={isGoogleConnected}
                    googleProfile={googleProfile}
                  />
                )}

                {activeTab === "simulator" && (
                  <FutureSelfSimulator
                    tasks={tasks}
                    isRecoveryActive={isRecoveryPlanCommitted}
                    onActivateRecovery={() => {
                      setIsRecoveryPlanCommitted(true);
                      const timeStr = new Date().toTimeString().split(' ')[0];
                      setLogs(prev => [
                        `[${timeStr}] [SUCCESS] Calendar Recovery Executed: Defensive Focus Shields active.`,
                        `[${timeStr}] [SUCCESS] Chronos timeline secured: Non-essential documentation pruned.`,
                        ...prev
                      ]);
                    }}
                  />
                )}

                {activeTab === "agent" && (
                  <AgentWorkspace
                    activeGoal={activeGoal}
                    subtasks={subtasks}
                    logs={logs}
                    isLoading={isPlanningAgent}
                    onPlanCreated={handlePlanCreated}
                    onUpdateSubtask={handleUpdateSubtask}
                    onClearPlan={handleClearPlan}
                  />
                )}

                {activeTab === "habits" && (
                  <HabitTracker
                    habits={habits}
                    onAddHabit={handleAddHabit}
                    onCompleteHabit={handleCompleteHabit}
                    onDeleteHabit={handleDeleteHabit}
                  />
                )}

                {activeTab === "speech" && (
                  <VoiceAssistant onActionExtracted={handleActionExtracted} />
                )}

                {activeTab === "chat" && (
                  <AICompanionChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onClearHistory={handleClearHistory}
                    isLoading={isChatLoading}
                  />
                )}

                {activeTab === "human-os" && (
                  <PersonalTimeIntelligence
                    tasks={tasks}
                    isDemoActive={isJudgeDemoActive}
                    onAddLog={(msg, type) => {
                      const timeStr = new Date().toTimeString().split(' ')[0];
                      setLogs(prev => [`[${timeStr}] [${type.toUpperCase()}] ${msg}`, ...prev]);
                    }}
                    onOpenReasoning={() => setActiveTab("xai")}
                  />
                )}

                {activeTab === "xai" && (
                  <ChronosReasoningInspector
                    tasks={tasks}
                  />
                )}
              </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Branding Bar */}
      <footer className="flex h-12 flex-col sm:flex-row items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-2 shrink-0 font-mono gap-1 text-[10px] text-slate-500 uppercase">
        <div className="flex items-center gap-4">
          <p className="tracking-widest">Chronos AI Agentic OS v1.0.4 - Autonomous Deadline Intelligence</p>
          <HealthMonitor />
        </div>
        <p className="tracking-wider">Evaluation Matrix: Agentic Depth 20% | Innovation 20%</p>
      </footer>

      <ChaosTestingHUD />

      <AnimatePresence>
        {isEmergencyMode && (
          <React.Suspense fallback={null}>
            <EmergencyIntervention
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onClose={() => setIsEmergencyMode(false)}
              onAddTask={handleAddTask}
              onOpenReasoning={() => setActiveTab("xai")}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJudgeDemoActive && (
          <React.Suspense fallback={null}>
            <JudgeDemoHUD
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isEmergencyMode={isEmergencyMode}
              setIsEmergencyMode={setIsEmergencyMode}
              isRecoveryPlanCommitted={isRecoveryPlanCommitted}
              setIsRecoveryPlanCommitted={setIsRecoveryPlanCommitted}
              onCloseDemo={() => {
                setIsJudgeDemoActive(false);
                setIsEmergencyMode(false);
                setIsRecoveryPlanCommitted(false);
                if (preDemoState) {
                  setTasks(preDemoState.tasks);
                  setEvents(preDemoState.events);
                  setActiveGoal(preDemoState.goal);
                  setPreDemoState(null);
                }
              }}
              setLogs={setLogs}
            />
          </React.Suspense>
        )}
      </AnimatePresence>
        </div>
      </MotionConfig>
    </A11yProvider>
  );
}
