# Recruiter Video Demo

Target length: 2–3 minutes. Record the live app using fictional data only. The shared demo account can edit records, so avoid saving changes during the walkthrough.

## Before recording

- Confirm the latest API deployment includes the public demo login and sign in once.
- Open the frontend at [salary-management-frontend-cbth.onrender.com](https://salary-management-frontend-cbth.onrender.com).
- Set browser zoom to 100%, use full screen, and close unrelated tabs, notifications, and developer tools.
- Use a steady cursor and pause briefly after each navigation so the UI is readable.
- The free PostgreSQL database is scheduled to expire on November 18, 2026. Record and export any needed material before then.

## Walkthrough and narration

### 0:00–0:15 — Introduce the project

**Show:** Sign-in page.

**Say:** “This is a salary management system for HR teams. It brings employee records, dated salary history, and organization-level pay analysis into one workspace. The live demo uses fictional employee data.”

### 0:15–0:30 — Sign in

**Show:** Sign in with the recruiter demo account, then pause on the workspace overview.

**Say:** “The application uses an authenticated HR session. I’m signing in with the public recruiter demo account.”

### 0:30–1:00 — Browse the people register

**Show:** Open People register. Point out the employee count, search field, country, department, and status filters. Search for Hana Okafor and open the profile.

**Say:** “The directory supports search and filtering across the synthetic 10,000-person dataset. An employee profile keeps the role, location, current pay, and dated salary history together.”

### 1:00–1:25 — Review an employee’s pay history

**Show:** Point to the salary history graph and its effective dates and currency. Do not edit or save the record.

**Say:** “Salary changes are stored as dated records, so HR can review how an individual’s pay changed over time. Currency stays explicit instead of comparing unlike amounts.”

### 1:25–2:10 — Explore salary analytics and CSV export

**Show:** Open Salary analytics. Apply one country or department filter, point to the summary and charts, then export the filtered report as CSV. If convenient, briefly show the downloaded file’s headings.

**Say:** “The analytics view summarizes pay by the selected filters and keeps currencies separate. The CSV export follows the active filters and includes currency and report context for spreadsheet review.”

### 2:10–2:25 — Close with the implementation

**Show:** Return to the analytics view or the project README.

**Say:** “The frontend is React and TypeScript, the API is Ruby on Rails, and PostgreSQL stores employees and salary history. The repository includes the requirements, architecture, implementation plan, tests, deployment configuration, and incremental commit history.”

## Recording notes

- Keep the final video around 2–3 minutes and export it as MP4 at 1080p if available.
- Avoid showing passwords, Render environment settings, or private account details.
- The recruiter login is intentionally public: `demo.hr@example.com` / `demo_example@123`.
- Verify the CSV download and each page before recording. If the free service has just woken up, wait for it to load before starting the narration.
