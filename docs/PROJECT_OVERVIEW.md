# Project Overview

**Chronos AI v1.0.4 — Decision Support AI for the Optimistic Builder**

*Read time: ~5 minutes*

---

## What Is Chronos AI?

Chronos AI is a **Decision Support Engine** — not a calendar, not a to-do list manager, and not another AI assistant. It is a cognitive intervention system designed to correct the single most common failure mode of ambitious builders: **the Planning Fallacy**.

The Planning Fallacy is the human tendency to persistently underestimate how long tasks take, overestimate available focus capacity, and stack conflicting deadlines until timeline collapse is inevitable. Conventional productivity tools make this worse by optimizing *within* broken plans rather than questioning the plans themselves.

Chronos AI sits one layer above the schedule. It watches your task load, models your cognitive patterns, calculates the probability that your current plan will succeed — and when it detects that you're heading for failure, it intervenes.

---

## Why Does It Exist?

Traditional productivity tools have a fundamental design flaw: they trust the user's time estimates. Every task management app, calendar, and project tracker assumes that when you say "this will take 2 hours," you're right.

You're not. Research shows people underestimate task duration by 30–60% on average. For software engineers, the gap is often 63% or more on complex engineering work.

Chronos AI was built to solve this: instead of accepting broken estimates, it actively measures the gap between your ambitions and your historical capacity, names it (the **Cognitive Optimism Tax**), and proposes concrete, data-backed interventions to save your deadline.

---

## Core Innovation

The key innovation is the **Cognitive Optimism Tax** model:

1. **Measure** historical task completion times vs. estimates
2. **Calculate** the per-category underestimation bias (Engineering: +63%, UI: +28%, etc.)
3. **Apply** correction factors to all future estimates in real time
4. **Simulate** multiple timeline futures (Recovered vs. Failure Autopsy)
5. **Recommend** specific descope actions ranked by timeline impact

This is implemented via Gemini's structured JSON reasoning — not rule-based heuristics.

---

## Architecture Overview

```
React 19 frontend (Vite 6)
    → Express.js server (server.ts)
        → Gemini 2.5 Flash API
            → Structured JSON responses
                → Deterministic UI rendering
```

The backend is a single `server.ts` file handling:
- Secure Gemini API proxying (key is isolated from client)
- Rate limiting, CORS, security headers
- Local heuristic fallback engine (offline resilience)

---

## Gemini's Role

Gemini 2.5 Flash is the reasoning core. It handles:
- **Recommendations** — context-aware task prioritization with psychological framing
- **Recovery Plans** — intelligent descope strategies with confidence scores
- **Reasoning Traces** — full causal chains explaining every decision
- **Personal Intelligence** — behavioral DNA profiling
- **Future Simulation** — timeline outcome modeling

All Gemini responses use strict `response_schema` enforcement to guarantee deterministic UI rendering. No free-text parsing.

---

## Explainability (XAI)

Every AI recommendation has a **[WHY?]** button that opens the Chronos Reasoning Inspector — a 6-panel explainability interface showing:
- Success Probability Breakdown (positive accelerators vs. risk penalties)
- Decision Trace (step-by-step logic)
- Human OS Why (behavioral factors)
- Timeline Outcomes (projected scenarios)
- Focus Shield Why (calendar block justification)
- Intervention Why (emergency action reasoning)

---

## Offline Resilience

When Gemini is unavailable, Chronos:
1. Attempts `gemini-2.5-flash`
2. Falls back to `gemini-2.5-flash-lite`
3. Activates local heuristic engine (if both fail)
4. Displays `LOCAL INTELLIGENCE ACTIVE` badge in the UI
5. Returns HTTP 200 from every endpoint regardless

The application degrades gracefully without showing raw error states to the user.

---

## Responsible AI

- No autonomous calendar modifications — all actions require user confirmation
- Full reasoning transparency via WHY? Inspector
- Offline fallback is clearly labeled
- Optimism corrections are explained, not silently applied
- All AI outputs are badged ("GEMINI 2.5 FLASH")

---

## Key Engineering Achievements

| Achievement | Detail |
|-------------|--------|
| Single-server architecture | Express + Vite unified on port 3000 |
| Structured Gemini JSON | `response_schema` enforced on every endpoint |
| Offline heuristic engine | Full fallback mechanism |
| PWA support | manifest.json + service worker |
| React 19 + Vite 6 | Latest stable stack |
| TypeScript strict mode | Zero lint errors |
| Rate limiting | express-rate-limit on all AI endpoints |
| Security headers | helmet.js on all responses |
| Accessibility | WCAG 2.1 AA target — aria-labels, min 44px touch targets |

---

## Repository Map

```
chronos-ai/
├── server.ts               # All backend logic (2,300+ lines)
├── src/App.tsx             # All frontend state & routing (1,400+ lines)
├── src/components/         # 20 UI components
├── src/utils/aiClient.ts   # Fetch wrapper with offline handling
├── docs/                   # Engineering documentation
│   ├── GEMINI_USAGE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DEMO_FAILURE_PLAYBOOK.md
│   └── PROJECT_OVERVIEW.md (this file)
├── public/                 # PWA assets
└── assets/                 # Media assets
```
