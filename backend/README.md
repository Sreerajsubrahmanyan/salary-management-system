# Backend

Rails 8.1 JSON API backed by PostgreSQL. This scaffold exposes:

- `GET /up` — Rails framework health check.
- `GET /api/v1/health` — versioned JSON API health response (`{"status":"ok"}`).
- `GET`, `POST`, and `DELETE /api/v1/session` — retrieve the CSRF token/current user, sign in, and sign out.
- `GET /api/v1/employees` — authenticated, filtered, paginated employee directory (`q`, `country`, `department`, `status`, `page`, `per_page`).
- `POST /api/v1/employees`, `GET /api/v1/employees/:employee_number`, `PATCH /api/v1/employees/:employee_number` — authenticated employee management; profile responses include dated salary history.
- `GET /api/v1/employees/:employee_number/salary_records`, `POST /api/v1/employees/:employee_number/salary_records` — read salary history and record a new effective-dated salary.
- `GET /api/v1/reports/pay?group_by=country|department|job_title` — authenticated pay totals and averages, always separated by currency; supports `country`, `department`, `job_title`, `status`, `currency`, and `as_of` filters.

Recording a salary change closes the prior open period on the day before the new effective date in the same transaction. A future-dated change leaves the current salary in effect until its start date; invalid changes leave existing history untouched. Reports and totals remain currency-specific. The salary-record API exists, but the frontend salary-change workflow is still pending.

## Local development

Install dependencies from this directory:

```sh
bundle install
bin/rails db:prepare
bin/rails server -p 3001
```

PostgreSQL must be available using the development settings in `config/database.yml`. Keep local credentials out of commits and use environment/deployment secrets for non-local environments.

Load the deterministic synthetic assessment dataset with:

```sh
bin/rails db:seed
```

This upserts `DEMO-00001` through `DEMO-10000` and two dated salary periods per employee. It uses fictional names and reserved `.test` email addresses; do not treat the data as real employee information.

To create or refresh a local HR demo account, set both `DEMO_HR_EMAIL` and `DEMO_HR_PASSWORD` when running `bin/rails db:seed`. Passwords must meet the model's 12-character minimum. No default password is provided, and the seed task refuses to create this account in production. Fetch `GET /api/v1/session` first and send its `csrf_token` as the `X-CSRF-Token` header on sign-in and sign-out requests.

## Tests

Run the Rails test suite with:

```sh
bin/rails test
```

The Rails suite covers health checks, employee and salary-record validations, seeding shape, authentication, directory behavior, salary-history transactions, and pay-report aggregation. Tests use isolated test database records and do not require loading the 10,000-person development seed.
