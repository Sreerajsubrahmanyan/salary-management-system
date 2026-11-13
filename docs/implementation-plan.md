# Incremental Implementation Plan

Each phase should be completed, reviewed, and committed separately. Suggested commit subjects are intentionally small; adjust them to match the exact files changed.

1. **Product and setup docs — complete:** requirements, architecture, implementation plan, and README. Commits: `c64bd75 docs: add requirements and architecture` and `bf5bb2a docs: reconcile assessment requirements and delivery status`.
2. **Backend foundation — complete:** Rails/PostgreSQL configuration, API namespace, health endpoint, and request-test setup. Commit: `e538c37 chore(backend): establish API foundation`.
3. **Core data model — complete:** employee and dated salary-record models, constraints, and tests. Commit: `528c6a4 feat(backend): add employee and salary history models`.
4. **Representative seed data — complete:** deterministic 10,000 employee generator and shape/repeatability checks. Commit: `b05a2bc feat(backend): seed 10000 representative employees`.
5. **HR authentication — complete:** session lifecycle, password handling, authorization, CSRF, and request tests. Commit: `1c53e31 feat(backend): add HR session authentication`.
6. **Employee API — complete:** profile CRUD, server-side search/filter/pagination, and request tests. Commit: `f30ee72 feat(api): add employee directory endpoints`.
7. **Salary history API — complete:** effective-dated changes, transaction handling, and edge-case tests. Commit: `814c45d feat(api): manage dated salary records`.
8. **Pay reporting API — complete:** currency-aware SQL summaries and mixed-currency tests. Commit: `1724392 feat(api): add grouped pay reports`.
9. **Frontend foundation — complete:** typed API client, shell, navigation, authentication, and UI state patterns. Commits: `2b8493b feat(frontend): add app shell and HR sign in` and `d6bd923 feat(frontend): refresh compensation sign-in experience`.
10. **Employee directory and profile — complete:** server-driven search/pagination, profile, dated salary history and per-employee graph, employee forms, and component tests. Commits: `44c62cb feat(frontend): add employee directory and profile`, `5020499 feat(frontend): chart employee salary history`, and `b3ca4ee fix(frontend): return to employee profile after edit`.
11. **Salary UI and pay intelligence — complete:** dated salary-change entry (`763d46a`), former-employee restriction (`a3999bf`), currency-aware report filters (`a723d50`), median/range statistics (`df84daa`), filtered CSV (`37886be`), and salary analytics dashboard/panels (`1e99ab8`, `389031f`, `722c240`). The UI and CSV utility have component/unit coverage. Supporting fixes clarify currency-specific groups (`ec34129`) and prevent report hero overlap (`df462da`).
12. **Integration and quality pass — pending:** end-to-end smoke coverage for sign-in, employee search/edit, and salary change; keyboard/accessibility and responsive review (including mobile navigation); performance check with the seeded dataset. Commit: `test: cover core HR workflows`.
13. **Release and assessment artifacts — partially complete:** Render Blueprint, one-time synthetic-data/HR-user bootstrap, and deployment instructions are prepared. Still pending: create the Render resources, verify production sign-in and core flows, document the live URL, and record a concise video walkthrough. Do not present deployment as complete until verified. Commit: `feat(deploy): prepare Render deployment`.

Keep commits focused and runnable where practical. Avoid committing secrets or real employee data. If a phase reveals a requirement or design change, record the reason in its commit and update the relevant docs before moving on.
