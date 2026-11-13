# Salary Management System — Requirements

## Product goal

Replace ACME's spreadsheet-based salary management with a web application that lets HR manage salary records for 10,000 employees across countries and answer practical questions about how the organization pays people.

## User persona

**HR Manager:** maintains employee and compensation information, needs reliable edits and a quick way to find employees and understand pay by country, department, role, or other useful attributes. The manager should be able to trust that changes are validated and that historical compensation is not silently lost.

## Scope and functional requirements

The assessment delivers a usable, deployed single-organization HR tool with a concise demo video. HR can authenticate; search/filter/page through employees; view and edit profiles; create dated salary records while retaining history; and inspect basic headcount and salary summaries by country, department, or role. Employee and salary inputs are validated, and the development seed creates 10,000 representative employees. Reports identify currency and never combine unlike currencies.

## Non-functional requirements

Support 10,000 employees with bounded server-side queries and appropriate indexes. Store money as exact decimal amounts with explicit currency. Keep responsibilities separated, APIs consistent, and tests fast and deterministic. Protect salary data with authenticated access, secure transport/storage configuration, and redacted logs. Provide accessible, responsive screens with clear loading, empty, and error states.

## Deliberately out of scope

- **Payroll calculation, payslips, tax, deductions, and payment execution:** these require jurisdiction-specific rules and integrations beyond salary record management.
- **Currency conversion and cross-currency totals:** rates and valuation dates introduce financial assumptions; keep comparisons currency-specific until specified.
- **Employee self-service, recruitment, performance, benefits, and leave:** they are separate HR workflows and do not solve the stated salary-data problem.
- **Complex multi-tenant administration, granular custom roles, and approval workflows:** the assessment identifies one organization and an HR Manager; add these only if real authorization needs emerge.
- **Bulk spreadsheet import/export in the first release:** spreadsheet migration is a useful follow-on, but validation and safe error recovery should be designed after the core employee and salary flows work.

## Acceptance criteria

- An authenticated HR Manager can create, view, update, and search employees and manage dated salary records.
- Salary history remains available after a change, and the current compensation is unambiguous.
- Filters and summaries return correct results for a 10,000-employee seed dataset and never combine different currencies as if equivalent.
- Invalid input and unauthorized access are rejected with useful responses; sensitive data is not exposed through public routes.
- Core domain and API behavior has fast, deterministic automated tests, and the UI covers loading, empty, error, and successful flows.
- The repository documents setup, architecture, and incremental implementation; the final system is deployed and has a concise demo video.
