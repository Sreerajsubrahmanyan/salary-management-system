# Salary Management System

A salary management workspace for an HR Manager to maintain employee and dated compensation records and understand pay across a 10,000-person, multi-country organization.

## Stack

- Frontend: React, TypeScript, Vite (`5173`)
- Backend: Ruby on Rails JSON API (`3001`)
- Database: PostgreSQL

## Current status

Implemented: protected HR sessions, employee directory and profile APIs/UI, dated salary-history API and salary-change entry UI, 10,000 synthetic employee seed, and currency-separated pay analytics with filtered CSV export. Still in progress: broader UI and end-to-end coverage, production deployment, and the short demo video. See the [requirements and delivery status](docs/requirements.md) and [implementation plan](docs/implementation-plan.md).

## Development setup

Install dependencies:

```sh
cd backend && bundle install
cd ../frontend && npm install
```

Configure PostgreSQL for the `salary_management_development` database using `backend/config/database.yml` or environment-specific settings, then prepare and seed the database:

```sh
cd backend
bin/rails db:prepare
DEMO_HR_EMAIL=hr.demo@example.test DEMO_HR_PASSWORD='choose-a-local-password-of-at-least-12-characters' bin/rails db:seed
```

The seed creates 10,000 fictional employees with two dated salary periods each and refreshes only `DEMO-` employees. Demo credentials are local only; choose a password that meets the 12-character minimum and do not commit it.

Start the API and frontend in separate terminals:

```sh
cd backend && bin/rails server -p 3001
```

```sh
cd frontend && npm run dev -- --host 0.0.0.0 --port 5173
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to Rails on port `3001`.

## Checks

```sh
cd backend && bin/rails test
cd frontend && npm test && npm run build && npm run lint
```

## Project artifacts

- [Requirements and delivery status](docs/requirements.md)
- [Architecture proposal](docs/architecture.md)
- [Incremental implementation plan](docs/implementation-plan.md)
- [AI-assisted development notes](docs/ai-development-notes.md)
- [Backend API and local setup](backend/README.md)

The commit history is organized into small implementation steps. The deployed environment and video walkthrough are release tasks; no production deployment is currently claimed.
