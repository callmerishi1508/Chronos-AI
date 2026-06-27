# Demo Failure Playbook

**Chronos AI v1.0.4**

> "I'll reset the scenario so we can explore another decision path." — Not "Something broke."

---

## Pre-Demo Checklist

Before starting a live demo:

- [ ] App is running on `http://localhost:3000`
- [ ] Browser tab is open, app is loaded
- [ ] Network is available (or Gemini offline fallback is confirmed working)
- [ ] Judge Demo mode tested once before presentation

---

## Demo Trigger

The judge demo is triggered by the **"START JUDGE DEMO"** button (`id="btn-trigger-judge-demo"`) in the top navigation bar.

This loads:
- 6 hackathon backlog tasks with pre-configured risk scores
- Demo calendar events
- Optimistic Builder behavioral profile
- Sets success probability to 32% (Unmitigated Collapse scenario)
- Opens the Chronos Demo Control HUD (6-step narrative)

The bypass path (for skipping onboarding) is the **"Start Judge Demo (Bypass)"** button on the onboarding screen.

**To reset:** Click **"Reset Demo"** (replaces START JUDGE DEMO when demo is active). This clears localStorage and reloads.

---

## Failure Scenario Matrix

### Scenario 1: Gemini API Unavailable (503)

**What happens:**
- Server falls back to `gemini-2.5-flash-lite`
- If lite also fails, local heuristic engine activates
- `LOCAL INTELLIGENCE ACTIVE / heuristic fallback · offline mode` badge appears in header
- All endpoints still return HTTP 200

**What to say:**
> "You can see Chronos has switched to Local Intelligence mode — this is the offline resilience layer. The system never goes dark. Gemini powers the full reasoning when available, but the core decision logic is embedded locally."

**What NOT to say:** "The API is down." / "Let me refresh."

---

### Scenario 2: Recovery Plan Takes >10 Seconds

**What happens:** Gemini processing complex task set. Loading state is visible.

**What to say:**
> "Chronos is running a full causal chain analysis across 6 competing deadlines — we're watching it reason about your cognitive load in real time."

---

### Scenario 3: WHY? Inspector Shows Loading State

**What to say:**
> "The Reasoning Inspector is compiling the explainability tree — this is Chronos being fully transparent about its AI decision making."

---

### Scenario 4: Demo Needs Reset Mid-Presentation

**Recovery phrase:**
> "I'll reset the scenario so we can explore another decision path."

**Action:** Click "Reset Demo" → app reloads → click "START JUDGE DEMO" again.

---

### Scenario 5: Browser Tab Crashes

**Action:** Hard refresh (`Ctrl+Shift+R`). LocalStorage state persists.

If localStorage was corrupted: click "Replay Onboarding" → go through onboarding → click "START JUDGE DEMO".

---

## Golden Path (Nominal Flow)

1. Open `http://localhost:3000`
2. Click **"Start Judge Demo (Bypass)"** on onboarding
3. Close the Demo Control HUD (EXIT DEMO) to see clean UI
4. Walk through:
   - **Command Center tab** — Threat Radar, 32% success probability
   - **Click "Apply Critical Recovery Plan"** — AI generates recovery
   - **Click any [WHY?] button** — opens Reasoning Inspector
   - **XAI Inspector tab** — show all 6 reasoning tabs
   - **Human OS tab** — Deadline DNA Profile
5. Close with: "Chronos doesn't just show you the risk. It shows you *why* — and then fixes it."

---

## Key Demo Phrases

| Moment | Phrase |
|--------|--------|
| Opening | "Most apps tell you you're behind. Chronos tells you *before* you fail." |
| Threat Radar | "This is your live Failure Probability. Right now it's 85% — you're planning to fail." |
| Recovery plan | "In under 20 seconds, Chronos has computed a complete descope strategy." |
| WHY? Inspector | "Every AI decision is fully explainable. This is transparent AI." |
| Offline badge | "Even without internet, Chronos keeps running. Local Intelligence never stops." |
| Closing | "Chronos doesn't automate your calendar. It corrects your judgment." |
