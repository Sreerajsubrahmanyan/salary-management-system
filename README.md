# Salary Management System

Web-based salary management for an organization with 10,000 employees across multiple countries. The initial user is the organization's HR Manager, who needs to maintain employee compensation and answer questions about pay. The repository currently contains a versioned API health endpoint, HR session authentication, employee and salary-history data models, and a 10,000-employee synthetic seed. Employee workflows and reporting are being added incrementally.

## Stack

- Frontend: React, TypeScript, and Vite (development port `5173`)
- Backend: Ruby on Rails JSON API (planned development port `3001`)
- Database: PostgreSQL

## Requirements

- Ruby version from `.ruby-version` (currently `3.4.2`) and Bundler
- Node.js compatible with the installed Vite version and npm
- PostgreSQL running locally, with credentials/configuration set in `backend/config/database.yml` or environment-specific configuration

## Development setup

Install frontend dependencies and backend gems:

```sh
cd frontend && npm install
cd ../backend && bundle install
```

Initialize the database and start Rails:

```sh
cd backend
bin/rails db:prepare
bin/rails server -p 3001
```

In another terminal, start Vite:

```sh
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

The API currently exposes health endpoints only; employee and salary models are not yet available through application endpoints. After database migrations, load the deterministic 10,000-employee demo dataset with `cd backend && bin/rails db:seed`. API proxying and integrated workflow details will be added with their implementation phases. Do not put credentials or real employee data in the repository.

## Checks

Frontend scaffold commands are `npm run build` and `npm run lint` from `frontend/`. Backend tests use Rails' standard test command, `bin/rails test`, from `backend/`; feature coverage will grow with the implementation.

## Project documents

- [Requirements](docs/requirements.md)
- [Architecture proposal](docs/architecture.md)
- [Incremental implementation plan](docs/implementation-plan.md)

The plan includes focused commit suggestions. Keep each change small and commit each completed phase separately so the repository history shows how the solution evolved.
