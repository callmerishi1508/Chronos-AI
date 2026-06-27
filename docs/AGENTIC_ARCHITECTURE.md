# Agentic Architecture

**Chronos AI v1.0.4 — The Chronos Agent Loop**

> Every stage maps to verified implementation in `server.ts`, `App.tsx`, or `src/utils/aiClient.ts`.

---

## The Chronos Agent Loop

```
┌─────────────────────────────────────────────────┐
│              CHRONOS AGENT LOOP                 │
│                                                 │
│  1. PERCEIVE  ──→  2. ANALYZE  ──→  3. PREDICT  │
│                                         │       │
│  7. ADAPT  ←──  6. EXPLAIN  ←──  4. PLAN        │
│                         ↑              │       │
│                    5. RECOVER ─────────┘       │
└─────────────────────────────────────────────────┘
```

This is not a chatbot. The agent moves through these stages autonomously when triggered, producing outputs at each stage that feed the next.

---

## Stage 1: PERCEIVE
Reads: task list, calendar events, behavioral history, demo profile.
Every `/api/*` POST body contains `tasks[]`, `events[]`, and `demoProfile`.

## Stage 2: ANALYZE
Derives risk metrics client-side before any Gemini call:
- **Optimism Tax** = `(estimated - historical_actual) / historical_actual`
- **Concurrency Debt** = penalty for simultaneous high-context tasks
- **Failure Probability** = composite: `0.4 × OptimismTax + 0.3 × ConcurrencyDebt + 0.3 × ScopeOverload`

The Threat Radar updates in real time as tasks change — no Gemini call needed for detection.

## Stage 3: PREDICT
`POST /api/future-simulation` — Gemini simulates 3 timelines:
- Failure Autopsy (no action)
- Current Path (realistic forecast)
- Recovered Future (after recovery plan)

## Stage 4: PLAN
`POST /api/recovery` — Gemini generates ranked recovery actions with confidence scores:
```json
{
  "recoveryActions": [{ "action": "DESCOPE", "task": "...", "confidence": 0.87 }],
  "recoveredDeadline": "22:30 tonight",
  "confidenceIndex": 91
}
```

## Stage 5: RECOVER
`DeadlineRecoveryEngine.tsx` — Presents plan to user. Human confirms or rejects each action. **Chronos never executes changes autonomously.**

## Stage 6: EXPLAIN
`POST /api/reasoning` → `ChronosReasoningInspector.tsx` — Triggered by any [WHY?] button. Gemini returns 6-panel explainability structure:
- Success Breakdown, Decision Trace, Human OS Why, Timeline Outcomes, Focus Shield Why, Intervention Why

## Stage 7: ADAPT
Three-tier fallback: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → Local Intelligence Engine. HTTP 200 always. `LOCAL INTELLIGENCE ACTIVE` badge renders in UI.

---

## Agentic Properties

| Property | Implementation | Evidence |
|----------|---------------|---------|
| Autonomy | Risk analysis without user prompting | Threat Radar on task change |
| Perception | Reads task/calendar/behavioral state | `buildChronosContext()` |
| Goal-directed | Optimizes for deadline success | Recovery ranked by impact |
| Reactivity | Responds to state changes in real time | Re-evaluation on mutation |
| Proactivity | Intervenes before failure | Alert triggers at threshold |
| Persistence | Maintains state across sessions | localStorage |
| Self-correction | Falls back automatically | 3-tier server.ts fallback |
| Explainability | Full reasoning on demand | WHY? Inspector 6 panels |
| Human-supervised | No autonomous actions | Accept/reject controls |
