# Incremental Implementation Plan

Each phase should be completed, reviewed, and committed separately. Suggested commit subjects are intentionally small; adjust them to match the exact files changed.

1. **Product and setup docs (current phase):** requirements, architecture, implementation plan, and root development README. Commit: `docs: define salary management requirements and architecture`.
2. **Backend foundation:** confirm Rails/PostgreSQL configuration, API namespace, health/configuration, and request-test setup. Commit: `chore(backend): establish API foundation`.
3. **Core data model:** employee and dated salary-record migrations/models, constraints, and model tests. Commit: `feat(backend): add employee and salary history models`.
4. **Representative seed data:** deterministic seed generator for 10,000 employees and realistic salary histories; add repeatability/shape checks. Commit: `feat(backend): seed 10000 representative employees`.
5. **HR authentication:** session lifecycle, password handling, authorization boundary, CSRF/CORS configuration, and request tests. Commit: `feat(backend): add HR session authentication`.
6. **Employee API:** create/show/update, paginated search and filters, serialization, and request tests. Commit: `feat(api): add employee directory endpoints`.
7. **Salary history API:** validated transactional salary changes and history endpoints, with edge-case tests. Commit: `feat(api): manage dated salary records`.
8. **Pay reporting API:** currency-aware SQL summaries and report request tests, including mixed-currency cases. Commit: `feat(api): add grouped pay reports`.
9. **Frontend foundation:** typed API client, shared layout/navigation, authentication screens, and error/loading patterns. Commit: `feat(frontend): add app shell and HR sign in`.
10. **Employee directory and profile:** server-driven search/pagination, profile detail, salary history, and form/component tests. Commit: `feat(frontend): add employee directory and profile`.
11. **Salary editing and reports:** salary change form and filterable grouped pay summaries; cover success, validation, and empty states. Commit: `feat(frontend): add salary management and pay reports`.
12. **Integration and quality pass:** end-to-end smoke coverage, accessibility/responsive review, performance check with seeded data, and fixes. Commit: `test: cover core HR workflows`.
13. **Release and assessment artifacts:** production configuration/deployment, documented demo credentials and setup, deploy verification, and video walkthrough. Commit: `docs: document deployment and assessment demo`.

Keep commits focused and runnable where practical. Avoid committing secrets or real employee data. If a phase reveals a requirement or design change, record the reason in its commit and update the relevant docs before moving on.
