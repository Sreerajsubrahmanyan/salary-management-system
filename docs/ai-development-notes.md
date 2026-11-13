# AI-assisted development notes

This assessment uses Codex as an AI coding assistant, as required by the prompt. Work was directed in small phases: requirements and architecture first, then backend data and APIs, then frontend workflows. AI assistance was used to draft and refine implementation code, tests, and documentation, and to help inspect changes for correctness and usability.

Engineering decisions remained tied to the assessment and were reviewed incrementally: PostgreSQL stores exact decimal pay; salary changes preserve effective-dated history; report totals stay separate by currency; list and report queries run server-side; and each completed feature is recorded in a focused Git commit. The developer steered requirements, visual direction, scope, and commit cadence. Automated tests, lint, and production builds were run as the relevant frontend/backend phases were completed.

The seed dataset is synthetic. No real employee data, credentials, or private prompts are committed. Local demo credentials are configured through environment variables rather than stored in the repository.
