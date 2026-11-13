# Backend

Rails 8.1 JSON API backed by PostgreSQL. This scaffold exposes:

- `GET /up` — Rails framework health check.
- `GET /api/v1/health` — versioned JSON API health response (`{"status":"ok"}`).

## Local development

Install dependencies from this directory:

```sh
bundle install
bin/rails db:prepare
bin/rails server -p 3001
```

PostgreSQL must be available using the development settings in `config/database.yml`. Keep local credentials out of commits and use environment/deployment secrets for non-local environments.

## Tests

Run the Rails test suite with:

```sh
bin/rails test
```

The API health request test does not depend on employee data or seeded records. Domain and request coverage will be added alongside each API feature.
