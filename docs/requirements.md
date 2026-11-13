# Salary Management System — Requirements

## Goal and user

Replace ACME’s spreadsheet-based salary records with a secure web workspace for its HR Manager to maintain pay history for 10,000 employees in multiple countries and answer questions about how the organization pays people.

## Scope and features

- HR Manager sign-in and protected access to employee and pay information.
- Create, search, filter, view, and update employee profiles in a paginated directory.
- Record compensation by amount, currency, and effective date; preserve prior records and show which salary applies on a given date.
- Summarize headcount, total, average, median, and minimum-to-maximum pay by country, department, or role, with status, currency, and effective-date filters. Keep aggregates separate by currency; never imply an exchange-rate conversion.
- Present those measures in a salary analytics dashboard with clear comparisons that do not visually equate unlike currencies.
- Export the currently filtered pay summary as a spreadsheet-friendly CSV with its date, currency, and active filters included.
- Seed 10,000 deterministic synthetic employees with varied countries, departments, statuses, and dated salary records.
- Provide responsive, accessible UI states and clear validation, loading, empty, and error feedback.

## Quality requirements

Use React with TypeScript, Rails API, and PostgreSQL. Validate at the server and preserve exact decimal amounts. Use bounded, indexed, server-side queries and SQL aggregation. Protect endpoints with an HR session, CSRF protection, secure cookies, and production HTTPS. Keep code structured, test core behavior with fast deterministic tests, and maintain an incremental, reviewable commit history.

## Deliberately out of scope

- Payroll calculation, payslips, taxes, deductions, and payment execution: these need jurisdiction-specific rules and payment integrations.
- Currency conversion: rates and valuation dates require explicit financial assumptions.
- Employee self-service and unrelated HR workflows such as hiring, benefits, performance, and leave.
- Multi-tenant administration, custom role management, and approval chains: the prompt defines one organization and one HR Manager persona.
- Bulk spreadsheet import/export in the first release: safe mapping, validation, and recovery should follow a proven core workflow.

## Acceptance and submission

An authenticated HR Manager can maintain employee profiles and dated salary records, inspect salary history, search the 10,000-person seed, and get correct currency-separated summaries. Invalid input and anonymous requests are rejected. Automated tests cover core domain/API/UI behavior, including failure and empty states. The repository includes this one-page requirements brief, architecture and planning artifacts, setup instructions, and an incremental commit history. Final submission also includes a deployed, verified application and a concise demo video.

## Current delivery status (2026-11-13)

Implemented: Rails/PostgreSQL APIs, HR authentication, 10,000-person seed, employee directory/profile and salary-change UI, and currency-aware pay report UI. Remaining before full acceptance: broader UI failure/empty-flow coverage and end-to-end smoke coverage, production deployment verification, and demo video.
