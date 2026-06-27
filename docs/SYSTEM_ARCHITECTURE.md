# System Architecture

**Chronos AI v1.0.4**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (React 19)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Command     │  │ Reasoning    │  │  Personal Time   │  │
│  │  Center      │  │ Inspector    │  │  Intelligence    │  │
│  │  (Threat     │  │ (XAI / WHY?) │  │  (Human OS)      │  │
│  │   Radar)     │  └──────────────┘  └──────────────────┘  │
│  └──────────────┘                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Deadline    │  │ Recommenda-  │  │  Future Self     │  │
│  │  Recovery    │  │ tion Engine  │  │  Simulator       │  │
│  │  Engine      │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│              React Context / State (App.tsx)                │
│              aiClient.ts → fetchAI() utility                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (server.ts)                     │
│                                                             │
│  • Rate limiting (express-rate-limit)                       │
│  • Security headers (helmet)                                │
│  • CORS policy enforcement                                  │
│  • Structured logging ([INFO]/[WARN]/[ERROR])               │
│  • Gemini API proxy (API key never reaches browser)         │
│  • Local heuristic fallback engine                          │
│  • Vite dev server proxy (development mode)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         GOOGLE AI STUDIO (Gemini 2.5 Flash)                 │
│                                                             │
│  Primary:  gemini-2.5-flash                                 │
│  Fallback: gemini-2.5-flash-lite                            │
│  Response: Structured JSON (response_schema enforced)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Engineering Decisions

### Single-Server Architecture
Rather than running separate frontend (Vite :5173) and backend (Express :3001) processes, Chronos uses a single `server.ts` entry point that:
- Starts Express on port 3000
- Proxies Vite's dev server internally during development
- Serves the built `dist/` in production

This simplifies deployment and eliminates CORS issues entirely.

### API Key Security
The `GEMINI_API_KEY` is read by `server.ts` from environment variables and **never** included in client-side JavaScript bundles. All Gemini calls originate from the server.

### Offline-First Design
Every AI endpoint has a local heuristic fallback. The frontend's `aiClient.ts` utility handles the `offlineFallback: true` flag and activates the "LOCAL INTELLIGENCE ACTIVE" badge automatically.

### PWA Architecture
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker for offline asset caching
- `public/icon.svg` — App icon

---

## Component Map

| Component | Tab | Primary Purpose |
|-----------|-----|-----------------|
| `ChronosCommandCenter.tsx` | Command Center | Threat Radar, Focus Sprints, Recovery |
| `ChronosReasoningInspector.tsx` | XAI Inspector | WHY? causal chain explainer |
| `DeadlineRecoveryEngine.tsx` | Command Center | Recovery plan builder |
| `PersonalTimeIntelligence.tsx` | Human OS | DNA profile, energy intelligence |
| `RecommendationEngine.tsx` | Command Center | AI recommendation feed |
| `CalendarDefenseSystem.tsx` | Focus Agenda | Focus Shield calendar blocks |
| `FutureSelfSimulator.tsx` | Command Center | Timeline simulation |
| `EmergencyIntervention.tsx` | Global overlay | "I'm Overwhelmed" handler |
| `CognitiveOptimismTax.tsx` | Command Center | Optimism bias tracker |
| `TaskPlanner.tsx` | Task Planner | CRUD task management |
| `JudgeDemoHUD.tsx` | Global overlay | Judge demo narrative control |
| `PremiumOnboarding.tsx` | Initial screen | First-run onboarding |
| `ErrorBoundary.tsx` | Global | React crash boundary |
| `HealthMonitor.tsx` | Background | Gemini connection health polling |

---

## Data Flow: Recovery Plan

```
User triggers "Apply Critical Recovery Plan"
        ↓
DeadlineRecoveryEngine → fetchAI('/api/recovery', tasks)
        ↓
server.ts → callGemini(recoveryPrompt)
        ↓
  [Gemini available]        [Gemini 503]
        ↓                        ↓
  Structured JSON          Local heuristic
  recovery plan            fallback response
        ↓                        ↓
  HTTP 200 + data          HTTP 200 + data
         \                      /
          → UI renders plan ←
          → Timeline Predictor updates
          → Confidence Index shown
```
