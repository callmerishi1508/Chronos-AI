# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4-RC1] - 2026-06-27

### Added
- Three-tier offline fallback architecture (Gemini Flash -> Flash Lite -> Local Intelligence).
- 6-panel XAI (Explainable AI) Reasoning Inspector.
- Predictive Threat Radar (Failure Probability, Concurrency Debt, Optimism Tax).
- Deadline Recovery Engine with autonomous descope generation.
- Future Self Simulator with 3 timeline visualizations.
- PWA Support (Service worker and manifest).
- GitHub Actions CI workflow for linting and building.
- Comprehensive `docs/` folder (Architecture, Gemini Usage, Demo Playbook).

### Fixed
- Replaced all marketing absolutes in documentation with technical evidence.
- Wrapped production `console.table` logging in `import.meta.env.DEV`.

### Security
- Injected `PROMPT_INJECTION_BOUNDARY` into all Gemini API requests.
- Integrated Helmet.js and express-rate-limit.
- Server-side API proxy to isolate `GEMINI_API_KEY`.
