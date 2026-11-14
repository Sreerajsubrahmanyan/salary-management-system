# Salary Management System

A salary management workspace for an HR Manager to maintain employee and dated compensation records and understand pay across a 10,000-person, multi-country organization.

## Stack

- Frontend: React, TypeScript, Vite (`5173`)
- Backend: Ruby on Rails JSON API (`3001`)
- Database: PostgreSQL

## Current status

Implemented: protected HR sessions, employee directory and profile APIs/UI, per-employee salary history graph, dated salary-history API and salary-change entry UI, 10,000 synthetic employee seed, and a currency-separated salary analytics dashboard with filtered CSV export. The app is deployed on Render; see the [requirements and delivery status](docs/requirements.md), [implementation plan](docs/implementation-plan.md), and [Render deployment guide](docs/deployment.md).

## Live recruiter demo

The app is deployed on Render. The public demo login has HR manager access to fictional employee and salary data:

- App: [Salary Management System](https://salary-management-frontend-cbth.onrender.com)
- Video demo: [Watch the walkthrough](https://drive.google.com/file/d/1lu6yiTBbujZIFu-3k9V10bq6qy7kycTO/view?usp=sharing)
- Email: `demo.hr@example.com`
- Password: `demo_example@123`

This shared account is intentionally public for recruiter access. Do not use it with real employee data. The Render services use the free tier: web services can sleep when idle, and the PostgreSQL database is scheduled to expire on **November 18, 2026**. Upgrade or export the database before then to retain the live data. See the [deployment guide](docs/deployment.md) for details.

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
- [Render deployment guide](docs/deployment.md)

The commit history is organized into small implementation steps. The live Render deployment and video walkthrough are linked above.
