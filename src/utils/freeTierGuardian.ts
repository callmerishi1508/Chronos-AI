/**
 * Free-Tier Guardian
 * Subsystem to protect the Gemini API Free Tier limits.
 */
import { safeParseStorage, setSafeStorage } from "./storageGuard";

export interface GuardianState {
  quotaRemaining: number;
  recentRequests: number[]; // Timestamps of requests in the last hour
  cacheHitRate: number;
  criticalQueue: number;
  backgroundQueue: number;
  lastUpdate: number;
}

const QUOTA_LIMIT = 45; // Flexible adaptive threshold per hour

class FreeTierGuardian {
  private state: GuardianState;

  constructor() {
    this.state = safeParseStorage<GuardianState>("chronos_guardian_state", {
      quotaRemaining: QUOTA_LIMIT,
      recentRequests: [],
      cacheHitRate: 100,
      criticalQueue: 0,
      backgroundQueue: 0,
      lastUpdate: Date.now()
    });
    this.pruneOldRequests();
  }

  private save() {
    setSafeStorage("chronos_guardian_state", this.state);
  }

  private pruneOldRequests() {
    const oneHourAgo = Date.now() - 3600 * 1000;
    this.state.recentRequests = this.state.recentRequests.filter(ts => ts > oneHourAgo);
    this.state.quotaRemaining = QUOTA_LIMIT - this.state.recentRequests.length;
    this.save();
  }

  public getDecision(priority: "critical" | "background"): "ALLOW" | "CACHE_ONLY" | "LOCAL_FALLBACK" {
    this.pruneOldRequests();

    if (this.state.quotaRemaining > 20) {
      return "ALLOW"; // Healthy
    }

    if (this.state.quotaRemaining > 5) {
      // Warning State
      if (priority === "critical") return "ALLOW";
      return "CACHE_ONLY";
    }

    if (this.state.quotaRemaining > 0) {
      // Critical State
      if (priority === "critical") return "ALLOW";
      return "LOCAL_FALLBACK";
    }

    // Exhausted
    return "LOCAL_FALLBACK";
  }

  public recordRequest(priority: "critical" | "background") {
    this.state.recentRequests.push(Date.now());
    this.pruneOldRequests();
  }

  public recordCacheHit() {
    // Basic moving average logic could go here
    this.save();
  }
  
  public getStatus() {
    this.pruneOldRequests();
    return {
      healthy: this.state.quotaRemaining > 20,
      warning: this.state.quotaRemaining <= 20 && this.state.quotaRemaining > 5,
      critical: this.state.quotaRemaining <= 5,
      remaining: this.state.quotaRemaining,
      requests: this.state.recentRequests.length
    };
  }
}

export const guardian = new FreeTierGuardian();
