# Architecture Proposal

## System architecture

```text
Browser (React + TypeScript, Vite :5173)
        │ JSON over HTTPS; same-site session cookie
        ▼
Rails API (:3001) ── PostgreSQL
        │                  ├─ employees
        │                  ├─ salary_records (dated history)
        │                  └─ users
        └─ future background jobs for work that outgrows a request
```

The frontend is a separately developed single-page application. Rails owns business rules, validation, authorization, persistence, and reporting queries. PostgreSQL is the source of truth. In development, configure the Vite proxy for `/api` to Rails to avoid unnecessary cross-origin complexity; production should serve both over HTTPS with a same-site cookie arrangement.

## Frontend and backend responsibilities

- **React/TypeScript:** accessible directory, employee and compensation forms, report filters/summaries, API client and typed response handling, and loading/empty/error states. Do not treat client validation as authoritative.
- **Rails API:** REST endpoints, authentication and authorization, domain validation, transactionally safe salary changes, pagination/filtering, aggregation, and JSON error formats.
- **PostgreSQL:** relational constraints, exact numeric salary values, indexes, and durable history. Keep business logic out of controllers and presentation components.

## Database design proposal

- `users`: email (unique), password digest, role, timestamps. Seed only non-production credentials and document them clearly.
- `employees`: stable employee identifier (unique), name, optional email (normalized and unique when present), country code, department, job title, status, hire date, timestamps. Index the identifier and common filters. The current substring search uses `ILIKE`; consider PostgreSQL trigram indexes only if query plans at the target dataset show they are needed.
- `salary_records`: employee foreign key, amount (`numeric`, fixed precision), ISO currency code, effective date, optional end date, timestamps. Index employee/effective date and common reporting dimensions. Enforce positive amount and valid date ranges in the model/database where practical.

Use an append/history model: a salary change ends the active record and creates a new dated row in one transaction. Define overlap rules explicitly and test them. Country and currency are separate: neither a country's currency nor an exchange rate should be inferred silently. Avoid storing a derived current salary on `employees` until query evidence justifies a safely maintained cache.

## API design proposal

Version routes under `/api/v1`. Return JSON with consistent validation errors and use standard HTTP status codes.

| Method and route | Purpose |
| --- | --- |
| `POST /api/v1/session`, `DELETE /api/v1/session`, `GET /api/v1/session` | Sign in, sign out, and retrieve current HR user |
| `GET /api/v1/employees?q=&country=&department=&status=&page=&per_page=` | Filtered, paginated directory with current compensation summary |
| `POST /api/v1/employees`, `GET /api/v1/employees/:employee_number`, `PATCH /api/v1/employees/:employee_number` | Create and maintain employee profile |
| `GET /api/v1/employees/:employee_number/salary_records`, `POST /api/v1/employees/:employee_number/salary_records` | Read history and record a salary change |
| `GET /api/v1/reports/pay?group_by=country|department|job_title&currency=&...` | Bounded aggregate counts and pay statistics by currency/group |

Use stable employee IDs, parameter allowlists, bounded `per_page`, and explicit sort options. Reports should expose the currency for each aggregate. Avoid returning the full employee dataset for client-side filtering.

## Authentication approach

For the first single-organization release, use Rails-managed server sessions with secure, HttpOnly, SameSite cookies and CSRF protection; hash passwords with Rails' `has_secure_password` backed by bcrypt. Require an authenticated HR role for all employee and salary endpoints. Restrict CORS to known origins if frontend/backend are hosted separately. Keep secrets in environment/deployment secret storage, enforce HTTPS in production, and never seed a production password. Revisit SSO and richer roles only when deployment requirements are known.

## Performance for 10,000 employees

10,000 rows are modest for PostgreSQL, but unbounded reads and repeated aggregate queries still cause avoidable cost. Paginate on the server, add indexes based on filters and query plans, select only needed columns, avoid N+1 association loads, aggregate in SQL, and cap page sizes. Seed representative distributions across countries, departments, currencies, and salary history. Measure directory and report query timings against that dataset before adding caching or background processing.

## Testing strategy

- Rails model/service tests for salary history, validation, currency-safe aggregation, and transactional changes.
- Request tests for authentication, authorization, validation errors, filters, pagination, and report totals.
- Frontend unit/component tests for form and directory states, plus API contract handling; keep tests deterministic and avoid network dependencies.
- A small end-to-end smoke path for sign-in, employee search, and salary update after core flows stabilize.
- Seed-data checks and a documented manual review against the 10,000-row dataset. Run relevant fast checks incrementally and the full suite before delivery.

## Deployment strategy

Deploy the Rails API and managed PostgreSQL, then serve the built Vite frontend through a static host or the same application domain/reverse proxy. Configure environment-based database credentials, HTTPS, secure cookies, migrations as a release step, health checks, backups, and log redaction. Build/deploy instructions and actual host/provider remain a later implementation decision. Verify the deployed app with seeded demo data and capture a short walkthrough video for submission.
