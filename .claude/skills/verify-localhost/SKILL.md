---
name: verify-localhost
description: >
  Verifies a freshly-implemented change end-to-end on localhost BEFORE a PR is
  opened — both frontend and backend. Boots the app, drives the affected
  routes/flows with the Claude-in-Chrome MCP, takes screenshots, and inspects the
  browser console and network for errors; also exercises the relevant API/backend
  routes. Trigger after implementing a milestone or feature and before
  committing/opening a PR, or when the user says "verify on localhost",
  "screenshot-verify", "verify the milestone", or "check it actually works in the
  browser". Produces a pass/fail report with screenshots and GATES the PR (fail =
  do not open the PR). Self-improving: records every blocker and its workaround to
  references/learnings.md and applies known workarounds on the next run.
compatibility: >
  Requires bash_tool, Read, Write/Edit. Prefers the Claude-in-Chrome MCP
  (mcp__Claude_in_Chrome__*) for browser verification; falls back to Playwright
  headless screenshots (already a repo dependency) when Chrome MCP is unavailable —
  e.g. headless cloud/cron runs. Needs a runnable dev server (npm run dev).
---

# verify-localhost — end-to-end verification before a PR

You verify that a just-implemented change **actually works** in a running app, on
localhost, before any PR is opened. You check the **frontend** (it renders, the new
flow works, no console/UI errors) and the **backend** (API routes respond correctly,
no server errors). You produce a pass/fail report with screenshots and you **gate the
PR**: if verification fails, the PR is not opened — you report what's broken instead.

You are also **self-improving**: when you hit a blocker, you resolve it (or fall back),
then write down what happened so the next run is smoother.

---

## Step 0 — Load prior learnings (always first)

Read `references/learnings.md`. It is your memory of past blockers and the workarounds
that fixed them. Apply any relevant known workaround proactively this run (e.g. "Chrome
MCP isn't connected in cloud runs → go straight to the Playwright fallback").

## Step 1 — Determine the verification scope

- Run `git status` and `git diff --stat` (vs the base branch) to see what changed.
- From the diff, derive the concrete things to verify:
  - **Routes/pages** touched or added under `app/` → the URLs to visit
    (e.g. a change under `app/lessons/<route>/` → `http://localhost:3000/lessons/<route>`).
  - **Components/activities** touched → the user flow(s) that exercise them.
  - **API routes** touched under `app/api/**` → the endpoints to hit.
  - **Data/context/ML** (`lib/**`) → which flow surfaces them.
- Write a short verification plan: the list of URLs, user steps, and API checks you'll run.
  If the diff is purely non-runtime (docs, config, types with no behavior change), say so
  and do a minimal smoke check rather than a full pass.

## Step 2 — Pre-flight

1. Fast static gate first (cheap failures before booting a browser):
   `npm run lint` and `npm run build`. If either is red, STOP — report it as a
   verification failure (no point screenshotting a broken build).
2. Start the dev server if not already running:
   `npm run dev` (serves http://localhost:3000). Run it in the background and poll
   until it answers (`curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/`).
   Free the port first if needed (`lsof -ti:3000 | xargs kill -9`).
   - Note for backend/API checks, `npm run dev` is required; for SSR/prod-fidelity you
     may instead `npm run build && npm start`.

## Step 3 — Frontend verification (Claude-in-Chrome MCP preferred)

For each URL in your plan:
1. Navigate: `mcp__Claude_in_Chrome__navigate` to the localhost URL.
2. Screenshot the initial state: `mcp__Claude_in_Chrome__screenshot`. Save it under
   `verification/<YYYY-MM-DD>/` with a descriptive name (route + state).
3. Walk the key user path for the changed flow — click CTAs / fill inputs
   (`mcp__Claude_in_Chrome__find`, `mcp__Claude_in_Chrome__computer` /
   `form_input`), screenshotting each meaningful state. Verify the NEW behavior the
   milestone introduced is actually present and correct, not just that the page loads.
4. Read the console: `mcp__Claude_in_Chrome__read_console_messages`. Any errors
   (not benign warnings) are a verification failure — capture them.
5. Read network: `mcp__Claude_in_Chrome__read_network_requests`. Flag any failed
   (4xx/5xx) requests for routes that should succeed.

If the Chrome MCP is not connected/available, use the **Playwright fallback** (see below)
and log the blocker (Step 5 self-improvement).

## Step 4 — Backend verification

- Hit each affected API route and assert the response:
  `curl -s -o /tmp/r.json -w '%{http_code}' http://localhost:3000/api/<route>` (with the
  right method/body). Confirm status and shape. (Existing routes: `/api/tts`,
  `/api/waitlist`.) For browser-driven backends, confirm via the Step 3 network capture
  instead.
- Tail the dev server log for server-side errors/stack traces during the run.
- For on-device ML / context-state changes, confirm the expected client behavior in the
  Step 3 walk (these have no server endpoint).

## Step 5 — Verdict, report, and self-improvement

1. Write `verification/<YYYY-MM-DD>/report.md`: the plan, what passed/failed, the
   screenshots referenced, and console/network/API findings.
2. **Gate:**
   - PASS → state clearly that verification passed and the change is safe to PR; list the
     screenshots as evidence (the caller may attach them to the PR).
   - FAIL → do NOT greenlight the PR. List each failure with the concrete repro and the
     fix needed. The caller should fix and re-run this skill.
3. **Self-improve — on ANY blocker** (Chrome MCP missing, dev server won't boot, a
   selector/route moved, screenshots fail, missing env/secret, flaky timing):
   - First apply the matching fallback below. If none fits, resolve it ad hoc.
   - Then append an entry to `references/learnings.md`:
     `## <date> — <short blocker title>` then **Symptom**, **Root cause**,
     **Workaround/fix applied**, **Prevention for next run**.
   - If a blocker is genuinely unresolvable this run, document it AND surface it as a
     verification blocker (never silently pass).

---

## Fallbacks (apply, then log)

- **Chrome MCP not connected (common in headless/cloud routine runs):** use Playwright,
  which is already installed. Headless screenshot of a route:
  `npx playwright screenshot --wait-for-timeout=2500 "http://localhost:3000/<route>" verification/<date>/<name>.png`
  For multi-step flows, write a throwaway spec under `tests/e2e/` that navigates, acts, and
  `page.screenshot(...)`s each state, then `npx playwright test <file> --project=chromium`.
  Use the browser console via `page.on('console', ...)` and network via `page.on('response', ...)`.
- **Dev server won't start / port busy:** `lsof -ti:3000 | xargs kill -9`, retry; check
  `.env.local` exists for routes that need secrets (TTS/Notion). If a secret is missing in a
  headless run, note it and verify what you can without it.
- **A route 500s on direct load:** capture the error, check the dev log, and report — do not
  mark it passed.
- **Sandbox blocks localhost networking** (curl "connection refused"/blocked): run the
  network-touching bash with the sandbox disabled if your harness supports it; log it.

## Notes

- Keep screenshots out of git: `verification/` is gitignored. Reference paths in the report;
  attach to the PR via `gh pr comment`/`--body` if useful, don't commit them.
- This skill is consumed two ways: standalone (a person runs it) and by the daily roadmap
  routine (right before it opens a milestone PR). In the routine it usually runs headless —
  expect the Playwright fallback to be the norm there, and keep learnings.md sharp for it.
