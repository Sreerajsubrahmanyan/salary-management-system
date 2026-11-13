# Render Deployment

The repository includes a Render Blueprint at [`render.yaml`](../render.yaml) for the React frontend, Rails API, and PostgreSQL database. The frontend is a static site. It proxies `/api/*` through Render to the API, so the browser uses one origin and the existing secure session cookie continues to work.

## Create the services

1. Push the repository to GitHub, then sign in to Render and choose **New → Blueprint**.
2. Connect `Sreerajsubrahmanyan/salary-management-system`, select the branch to deploy, and review the three resources in `render.yaml`.
3. Set `RENDER_HR_EMAIL` and `RENDER_HR_PASSWORD` when Render prompts for the secret values. These are the primary HR login credentials.
4. To provide a second live demo login, set `RENDER_DEMO_HR_EMAIL` and `RENDER_DEMO_HR_PASSWORD` on the API service. Use a shareable email and a unique password of at least 12 characters. Both credentials are stored in Render, not Git. For an existing Blueprint, add these two variables under the API service's **Environment** settings; Render does not add new `sync: false` variables during later Blueprint syncs.
5. Deploy the Blueprint. The API runs migrations and bootstraps the synthetic 10,000-person dataset and configured HR accounts at startup. It creates accounts only when they do not already exist, so changing an environment password does not reset an existing user's password.
6. Open the frontend’s `onrender.com` URL and sign in with either account.

The service names determine the default Render hostnames. If you rename `salary-management-api`, update the API destination under the frontend's `/api/*` rewrite in `render.yaml` to the API's actual public URL.

## Free plan limits

The Blueprint uses free services to avoid provisioning paid resources by default. Free web services spin down after inactivity, so the first page load can take about a minute. Free Render Postgres expires 30 days after creation, has no backups, and must be upgraded before expiry to retain its data. For a recruiter link intended to stay available, change the database plan from `free` to a paid plan such as `basic-256mb` before creating the Blueprint. Review Render’s current [free instance limits](https://render.com/docs/free) and [Postgres plans](https://render.com/docs/postgresql-creating-connecting) before choosing.

## Updates and troubleshooting

- Render deploys the connected branch when new commits are pushed.
- Check the API health endpoint at `https://salary-management-api.onrender.com/up`.
- If the frontend loads but API requests fail, check the API service logs and confirm the `/api/*` rewrite points to its public URL.
- If sign-in fails, confirm the two `RENDER_HR_*` variables are set and the password has at least 12 characters.
- The additional recruiter demo login is created only when both `RENDER_DEMO_HR_EMAIL` and `RENDER_DEMO_HR_PASSWORD` are set. Add both before redeploying the API.
- Do not run the full seed task on an existing database to refresh it. The Render bootstrap seeds only when the demo employee set is absent, preserving later salary edits on service restarts.

Render references: [Blueprints](https://render.com/docs/infrastructure-as-code), [static site rewrites](https://render.com/docs/redirects-rewrites), [Postgres connections](https://render.com/docs/postgresql-creating-connecting), and [free instance limits](https://render.com/docs/free).
