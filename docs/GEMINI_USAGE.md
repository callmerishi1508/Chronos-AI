# Gemini Usage & Prompt Engineering

**Chronos AI v1.0.4**

---

## Overview

Chronos AI uses Google Gemini 2.5 Flash as its primary AI reasoning engine. Every AI call is routed through `server.ts` — a server-side Express.js proxy that holds the API key securely and never exposes it to the browser.

---

## Model Configuration

| Parameter | Value |
|-----------|-------|
| Primary Model | `gemini-2.5-flash` |
| Fallback Model | `gemini-2.5-flash-lite` |
| Response Format | `application/json` (structured schema enforcement) |
| Temperature | 1.0 (default) |
| Max Output Tokens | Per-endpoint (see below) |

---

## API Endpoints

All endpoints are defined in `server.ts` and accept `POST` requests with JSON bodies.

### `POST /api/recommendations`
Generates the main recommendation feed shown in the Recommendation Engine.

**Request body:**
```json
{
  "tasks": [...],
  "events": [...],
  "isDemoActive": false,
  "demoProfile": null
}
```

**Gemini prompt strategy:** Sends the full task list + calendar events + user behavioral profile. Uses strict JSON `response_schema` to enforce structured output including `recommendations[]`, each with `id`, `title`, `description`, `reasoning`, `type`, `priority`, `impact`, `psych`, `topDrivers`.

---

### `POST /api/recovery`
Generates a recovery plan when the user is in risk threshold.

**Request body:**
```json
{
  "tasks": [...],
  "isDemoActive": false,
  "demoProfile": null
}
```

**Gemini prompt strategy:** Analyzes task load, concurrency debt, and optimism bias. Returns structured recovery actions, timeline predictions, and confidence scores.

---

### `POST /api/reasoning`
Powers the Chronos Reasoning Inspector (XAI). Returns a full causal chain explanation for a given set of tasks.

**Gemini prompt strategy:** Deep explainability chain — produces SUCCESS BREAKDOWN, DECISION TRACE, HUMAN OS WHY, TIMELINE OUTCOMES, FOCUS SHIELD WHY, INTERVENTION WHY.

---

### `POST /api/personal-intelligence`
Generates the Human OS / DNA profile for the Personal Time Intelligence panel.

**Gemini prompt strategy:** Analyzes task history to produce behavioral archetypes, procrastination patterns, focus genome metrics, and a personal optimism coefficient.

---

### `POST /api/future-simulation`
Runs the Future Self Simulator — produces Failure Autopsy, Current Timeline, and Recovered Future narratives.

---

### `POST /api/emergency`
Powers the Emergency Intervention panel when the user triggers "I'm Overwhelmed".

---

## Offline Fallback Strategy

If Gemini returns a 5xx error or is unavailable:

1. Primary model (`gemini-2.5-flash`) attempt fails
2. Fallback model (`gemini-2.5-flash-lite`) attempt fails
3. Server returns a **local heuristic response** with HTTP 200
4. Frontend detects `offlineFallback: true` in response
5. `LOCAL INTELLIGENCE ACTIVE` badge activates in the UI header

This guarantees the application never shows an error state to the user.

---

## Responsible AI

- All AI outputs are displayed with clear attribution ("GEMINI 2.5 FLASH" badge on each recommendation)
- Every recommendation exposes its full reasoning via the WHY? Inspector
- The system never makes autonomous calendar changes — all actions require explicit user confirmation
- Optimism bias corrections are explained, not silently applied
