# Render Deployment

The repository includes a Render Blueprint at [`render.yaml`](../render.yaml) for the React frontend, Rails API, and PostgreSQL database. The frontend is a static site. It proxies `/api/*` through Render to the API, so the browser uses one origin and the existing secure session cookie continues to work.

## Create the services

1. Push the repository to GitHub, then sign in to Render and choose **New → Blueprint**.
2. Connect `Sreerajsubrahmanyan/salary-management-system`, select the branch to deploy, and review the three resources in `render.yaml`.
3. Set `RENDER_HR_EMAIL` and `RENDER_HR_PASSWORD` when Render prompts for the private HR account credentials.
4. Deploy the Blueprint. The API runs migrations and bootstraps the synthetic 10,000-person dataset, the private HR account, and a public recruiter demo account at startup. Accounts are created only when they do not already exist, so a later deploy will not reset an existing user's password.
5. Open the frontend’s `onrender.com` URL and use the public recruiter account listed in the repository README.

The recruiter login is intentionally public and has HR manager access to the fictional dataset. Do not use this shared account with real employee or salary data.

The service names determine the default Render hostnames. If you rename `salary-management-api`, update the API destination under the frontend's `/api/*` rewrite in `render.yaml` to the API's actual public URL.

## Current live deployment

- Frontend: [salary-management-frontend-cbth.onrender.com](https://salary-management-frontend-cbth.onrender.com)
- Rails API: [salary-management-api-x3bt.onrender.com](https://salary-management-api-x3bt.onrender.com)
- PostgreSQL service: `salary-management-db`
- Recruiter demo email: `demo.hr@example.com`
- Recruiter demo password: `demo_example@123`

The public demo account is created by `render:bootstrap` after the commit adding it is deployed. The separate `RENDER_HR_EMAIL` account is the private operator login; keep its password in Render and do not share it with recruiters.

## Free plan limits

The current free PostgreSQL database is scheduled to expire on **November 18, 2026**. Upgrade it or export the data before that date if you need to retain the live employee records. The free web services can also spin down while idle, so the first request after inactivity may take about a minute. For a continuously available recruiter demo, use service plans that do not sleep and a database plan that does not expire. Review Render’s current [free instance limits](https://render.com/docs/free) and [Postgres plans](https://render.com/docs/postgresql-creating-connecting) before choosing.

## Updates and troubleshooting

- Render deploys the connected branch when new commits are pushed.
- Check the API health endpoint at `https://salary-management-api-x3bt.onrender.com/up`.
- If the frontend loads but API requests fail, check the API service logs and confirm the `/api/*` rewrite points to its public URL.
- If the private HR account cannot sign in, confirm the two `RENDER_HR_*` variables are set and the password has at least 12 characters.
- The recruiter login is created by `render:bootstrap` on the next API startup after this change is deployed.
- Do not run the full seed task on an existing database to refresh it. The Render bootstrap seeds only when the demo employee set is absent, preserving later salary edits on service restarts.

Render references: [Blueprints](https://render.com/docs/infrastructure-as-code), [static site rewrites](https://render.com/docs/redirects-rewrites), [Postgres connections](https://render.com/docs/postgresql-creating-connecting), and [free instance limits](https://render.com/docs/free).
