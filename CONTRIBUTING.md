# Contributing to Chronos AI

First off, thank you for considering contributing to Chronos AI! It's people like you that make this tool better for everyone struggling with the Planning Fallacy.

## Where do I go from here?

If you've noticed a bug or have a feature request, please open a new issue. If you'd like to submit a fix or feature, please submit a pull request!

## Development Setup

1. **Clone the repo:** `git clone https://github.com/callmerishi1508/Chronos-AI.git`
2. **Install dependencies:** `npm install`
3. **Set up `.env`:** Copy `.env.example` to `.env` and add your Google Gemini API key.
4. **Start the dev server:** `npm run dev`

## Guidelines

- Ensure your code passes standard linting: `npm run lint`.
- Ensure the project builds successfully: `npm run build`.
- When making UI changes, ensure they adhere to our dark-mode, glassmorphic design system using Tailwind CSS.
- Keep the `aiClient.ts` fallback architecture intact. All new features relying on Gemini must degrade gracefully.

Thank you for contributing!
