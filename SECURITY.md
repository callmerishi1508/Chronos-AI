# Security Policy

## Supported Versions

Currently, only the latest version (`v1.0.4-RC1` and above) is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Chronos AI, please do not disclose it publicly. Instead, please open a private GitHub issue or contact the maintainer directly.

### Scope

- Vulnerabilities that expose the `GEMINI_API_KEY`.
- Prompt injection vulnerabilities that bypass the `PROMPT_INJECTION_BOUNDARY`.
- XSS or CSRF vulnerabilities in the React frontend.
- Rate limiting bypasses in the Express server.

We will endeavor to respond to all security reports within 48 hours.
