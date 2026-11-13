# Backend

Rails 8.1 JSON API backed by PostgreSQL. This scaffold exposes:

- `GET /up` — Rails framework health check.
- `GET /api/v1/health` — versioned JSON API health response (`{"status":"ok"}`).
- `GET`, `POST`, and `DELETE /api/v1/session` — retrieve the CSRF token/current user, sign in, and sign out.
- `GET /api/v1/employees` — authenticated, filtered, paginated employee directory (`q`, `country`, `department`, `status`, `page`, `per_page`).
- `POST /api/v1/employees`, `GET /api/v1/employees/:employee_number`, `PATCH /api/v1/employees/:employee_number` — authenticated employee management; profile responses include dated salary history.

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

To create or refresh a local HR demo account, set both `DEMO_HR_EMAIL` and `DEMO_HR_PASSWORD` when running `bin/rails db:seed`. No default password is provided, and the seed task refuses to create this account in production. Fetch `GET /api/v1/session` first and send its `csrf_token` as the `X-CSRF-Token` header on sign-in and sign-out requests.

## Tests

Run the Rails test suite with:

```sh
bin/rails test
```

The API health request test does not depend on employee data or seeded records. Domain and request coverage will be added alongside each API feature.
