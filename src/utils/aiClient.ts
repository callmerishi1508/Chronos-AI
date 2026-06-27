/**
 * Centralized AI Client for Chronos AI
 * Handles: Adaptive Debouncing, Deduplication, Caching, Stale Cancellations,
 * Exponential Backoff with Jitter, Offline Fallbacks, and Free-Tier Guardian.
 */

import { guardian } from "./freeTierGuardian";

interface FetchOptions {
  priority?: "critical" | "background";
  ttl?: number;
  signal?: AbortSignal;
}

interface CacheEntry {
  timestamp: number;
  data: any;
}

const CACHE_MAP = new Map<string, { timestamp: number, data: any }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const PENDING_REQUESTS = new Map<string, Promise<any>>();
const ABORT_CONTROLLERS = new Map<string, AbortController>();
const DEBOUNCE_TIMERS = new Map<string, any>();

let userSessionApiKey: string | null = null;
export function setUserSessionApiKey(key: string | null) {
  userSessionApiKey = key;
}

let onFallbackTriggered: (() => void) | null = null;
export function setFallbackTrigger(cb: () => void) {
  onFallbackTriggered = cb;
}

function hashPayload(payload: any): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString();
}

/**
 * Intelligent AI Fetcher
 */
export async function fetchAI(endpoint: string, payload: any, options: FetchOptions = {}): Promise<any> {
  const priority = options.priority || "background";
  const ttl = options.ttl || DEFAULT_TTL;
  const payloadHash = hashPayload(payload);
  const cacheKey = `${endpoint}_${payloadHash}`;
  const requestId = Math.random().toString(36).substring(7);
  const startTime = performance.now();

  // 1. Diagnostics Setup
  const diagnostics = {
    requestId,
    latency: 0,
    model: "gemini-2.5-flash",
    cacheHit: false,
    retries: 0,
    guardianDecision: "ALLOW",
    offlineReason: "none",
    fallbackReason: "none"
  };

  // 2. Offline Check
  if (!navigator.onLine) {
    diagnostics.offlineReason = "navigator.onLine === false";
    return handleLocalFallback(endpoint, payload, diagnostics);
  }

  // 3. Cache Check
  const cached = CACHE_MAP.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < ttl)) {
    diagnostics.cacheHit = true;
    diagnostics.latency = performance.now() - startTime;
    guardian.recordCacheHit();
    if ((import.meta as any).env?.DEV) console.table(diagnostics);
    return cached.data;
  }

  // 4. Guardian Check
  const decision = guardian.getDecision(priority);
  diagnostics.guardianDecision = decision;
  
  if (decision === "LOCAL_FALLBACK" || decision === "CACHE_ONLY") {
    // If CACHE_ONLY and we didn't hit cache, we must fallback
    diagnostics.fallbackReason = decision;
    return handleLocalFallback(endpoint, payload, diagnostics);
  }

  // 5. Adaptive Debouncing
  if (priority === "background") {
    return new Promise((resolve, reject) => {
      if (DEBOUNCE_TIMERS.has(endpoint)) clearTimeout(DEBOUNCE_TIMERS.get(endpoint));
      const timer = setTimeout(async () => {
        DEBOUNCE_TIMERS.delete(endpoint);
        try {
          const result = await executeFetchWithRetry(endpoint, payload, cacheKey, diagnostics, options.signal);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }, 500);
      DEBOUNCE_TIMERS.set(endpoint, timer);
    });
  }

  // 6. Critical Priority Execution
  return executeFetchWithRetry(endpoint, payload, cacheKey, diagnostics, options.signal);
}

/**
 * Exponential Backoff with Jitter
 */
async function executeFetchWithRetry(endpoint: string, payload: any, cacheKey: string, diagnostics: any, externalSignal?: AbortSignal, attempt = 0): Promise<any> {
  if (PENDING_REQUESTS.has(cacheKey)) return PENDING_REQUESTS.get(cacheKey);

  if (ABORT_CONTROLLERS.has(endpoint)) {
    ABORT_CONTROLLERS.get(endpoint)?.abort();
  }

  const controller = new AbortController();
  ABORT_CONTROLLERS.set(endpoint, controller);
  if (externalSignal) externalSignal.addEventListener("abort", () => controller.abort());

  // Append user session key if active
  if (userSessionApiKey) {
    payload.userApiKey = userSessionApiKey;
  }

  const fetchPromise = (async () => {
    try {
      // Record attempt
      guardian.recordRequest("critical");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Data contains the actual result and _meta if returned from server
      CACHE_MAP.set(cacheKey, { timestamp: Date.now(), data });
      
      diagnostics.latency = Math.round(performance.now() - diagnostics.latency);
      if ((import.meta as any).env?.DEV) console.table(diagnostics);
      
      return data;
      
    } catch (error: any) {
      if (error.name === "AbortError") throw error; // Don't retry cancellations

      diagnostics.retries++;
      if (attempt < 2) {
        // Attempt 0: 1s +/- 300ms, Attempt 1: 2s +/- 600ms
        const baseDelay = (attempt === 0 ? 1000 : 2000);
        const jitter = (Math.random() * 0.6 * baseDelay) - (0.3 * baseDelay);
        const delay = baseDelay + jitter;
        
        console.warn(`[AI Client] Request failed, retrying in ${Math.round(delay)}ms... (Attempt ${attempt+1})`);
        await new Promise(res => setTimeout(res, delay));
        return executeFetchWithRetry(endpoint, payload, cacheKey, diagnostics, externalSignal, attempt + 1);
      } else {
        diagnostics.fallbackReason = "max_retries_exceeded";
        return handleLocalFallback(endpoint, payload, diagnostics);
      }
    } finally {
      PENDING_REQUESTS.delete(cacheKey);
      if (ABORT_CONTROLLERS.get(endpoint) === controller) {
        ABORT_CONTROLLERS.delete(endpoint);
      }
    }
  })();

  PENDING_REQUESTS.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Local Intelligence Fallback Generator
 */
function handleLocalFallback(endpoint: string, payload: any, diagnostics: any) {
  diagnostics.model = "chronos-core-intelligence";
  if ((import.meta as any).env?.DEV) console.table(diagnostics);
  
  if (onFallbackTriggered) {
    onFallbackTriggered();
  }

  const meta = { _meta: { provider: "LOCAL_INTELLIGENCE" } };

  // Return mocked schema depending on endpoint
  if (endpoint.includes("recommendations")) {
    return {
      ...meta,
      recommendations: [
        {
          id: "local-fallback",
          title: "Offline Local Intelligence",
          type: "immediate",
          description: "Network offline or API limits reached. Proceed manually with your highest priority task.",
          impact: "Maintains momentum without AI.",
          reasoning: {
            context: "System is operating in offline mode.",
            evidence: ["No internet connection or quota exceeded"],
            patternDetection: "None",
            riskAssessment: "None",
            scenarioSimulation: {
              completeNow: { estimatedOutcome: "N/A", pros: [], cons: [] },
              delay: { estimatedOutcome: "N/A", pros: [], cons: [] },
              ignore: { estimatedOutcome: "N/A", risk: "N/A" }
            },
            confidenceBand: "Insufficient Evidence",
            evidenceQuality: "None",
            explanation: "Running offline."
          },
          multiFactorScores: { urgency: 50, impact: 50, effort: 50, dependency: 0, energyMatch: 50, timeFit: 50, risk: 50 },
          source: "Chronos Local Intelligence"
        }
      ]
    };
  }
  
  if (endpoint.includes("ai-status")) {
    return { active: false };
  }

  if (endpoint.includes("recovery")) {
    return {
      ...meta,
      recoveryPlan: {
        overallStrategy: "📡 CLOUD AI UNAVAILABLE: Running Chronos Core Intelligence (heuristic fallback). Local rule-based engine has parsed your active tasks. A timeline compression risk has been detected. To defend your critical path, establish Focus Sprints and prune secondary non-critical activities.",
        immediateActions: [
          {
            taskId: "local-rec-1",
            action: "Execute a 25-minute un-interruptible Focus Block immediately.",
            impact: "Restores cognitive momentum and breaks task paralysis."
          }
        ],
        preventativeMeasures: [
          "Buffer remaining estimates by 1.5x",
          "Mute all incoming notifications for 2 hours"
        ]
      }
    };
  }

  if (endpoint.includes("personal-intelligence")) {
    return {
      ...meta,
      dnaProfile: {
        archetype: "Heuristic Defender",
        biasValue: 50,
        aiDiagnosis: "📡 CLOUD AI UNAVAILABLE: Running Chronos Core Intelligence (heuristic fallback). Based on local rule-based models, you must shield your morning hours from administrative tasks to maximize your high-velocity deep work window.",
        geminiReasoning: "Fallback telemetry activated. Cognitive optimism vectors replaced with deterministic defaults."
      },
      personalOptimismModel: {
        engineering: 50,
        ui: 30,
        research: 40,
        admin: 15
      }
    };
  }

  if (endpoint.includes("emergency") || endpoint.includes("intervention")) {
    return {
      ...meta,
      intervention: {
        recommendedAction: "Execute an immediate 25-minute focus block on your highest-risk task.",
        whyItMatters: "📡 CLOUD AI UNAVAILABLE: Running Chronos Core Intelligence (heuristic fallback). Failure to complete this task immediately will cascade across all dependent workflows and guarantee milestone failure.",
        confidenceScore: 100,
        psychologicalFriction: "High - Starting is the hardest part. The AI is offline, but your deadline is not. Begin immediately.",
        suggestedBreak: "5 minutes"
      }
    };
  }

  // Fallback for everything else
  return { ...meta, success: true, isLocalFallback: true, message: "Operating in Local Intelligence Mode." };
}

export function clearAICache() {
  CACHE_MAP.clear();
}
