# Incremental Implementation Plan

Each phase should be completed, reviewed, and committed separately. Suggested commit subjects are intentionally small; adjust them to match the exact files changed.

1. **Product and setup docs — complete:** requirements, architecture, implementation plan, and README. Commit: `c64bd75 docs: add requirements and architecture`.
2. **Backend foundation — complete:** Rails/PostgreSQL configuration, API namespace, health endpoint, and request-test setup. Commit: `e538c37 chore(backend): establish API foundation`.
3. **Core data model — complete:** employee and dated salary-record models, constraints, and tests. Commit: `528c6a4 feat(backend): add employee and salary history models`.
4. **Representative seed data — complete:** deterministic 10,000 employee generator and shape/repeatability checks. Commit: `b05a2bc feat(backend): seed 10000 representative employees`.
5. **HR authentication — complete:** session lifecycle, password handling, authorization, CSRF, and request tests. Commit: `1c53e31 feat(backend): add HR session authentication`.
6. **Employee API — complete:** profile CRUD, server-side search/filter/pagination, and request tests. Commit: `f30ee72 feat(api): add employee directory endpoints`.
7. **Salary history API — complete:** effective-dated changes, transaction handling, and edge-case tests. Commit: `814c45d feat(api): manage dated salary records`.
8. **Pay reporting API — complete:** currency-aware SQL summaries and mixed-currency tests. Commit: `1724392 feat(api): add grouped pay reports`.
9. **Frontend foundation — complete:** typed API client, shell, navigation, authentication, and UI state patterns. Commit: `2b8493b feat(frontend): add app shell and HR sign in`.
10. **Employee directory and profile — complete:** server-driven search/pagination, profile, dated salary history display, employee forms, and component tests. Commit: `44c62cb feat(frontend): add employee directory and profile`.
11. **Salary UI and pay intelligence — complete:** salary analytics dashboard with currency-aware groups and filters (`1e99ab8 feat(frontend): add pay intelligence workspace`), dated salary-change entry from profiles, and filtered CSV export. The salary and export utilities have component/unit coverage. Commit subjects include `feat(frontend): add salary change workflow` and `feat(frontend): export filtered pay reports as CSV`.
12. **Integration and quality pass — pending:** end-to-end smoke coverage for sign-in, employee search/edit, and salary change; keyboard/accessibility and responsive review (including mobile navigation); performance check with the seeded dataset. Commit: `test: cover core HR workflows`.
13. **Release and assessment artifacts — pending:** choose and configure a real host, deploy Rails/PostgreSQL and the frontend, verify production security and seeded demo access, document the live URL, and record a concise video walkthrough. Do not present deployment as complete until verified. Commit: `docs: document deployment and assessment demo`.

Keep commits focused and runnable where practical. Avoid committing secrets or real employee data. If a phase reveals a requirement or design change, record the reason in its commit and update the relevant docs before moving on.
