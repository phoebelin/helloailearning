# Verify-localhost Learnings

## 2026-06-21 — Stale dev server causes React hydration failure

**Symptom:** Playwright tests show React fiber not attached to buttons; button clicks do nothing; `_next/static/chunks/*.js` return 404.

**Root cause:** Multiple stale Next.js dev server processes accumulate on ports 3000–3003 from prior runs. New `npm run dev` spawns on an unused port (e.g. 3003), but Playwright tests always hit `localhost:3000` which has a stale server with expired/wrong chunk hashes.

**Workaround/fix applied:** `fuser -k 3000/tcp 3001/tcp 3002/tcp 3003/tcp` before starting the dev server.

**Prevention for next run:** Always kill ports 3000–3003 first. Confirm dev server is on port 3000 before running tests (`curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` should return 200).

---

## 2026-06-21 — Expression badge requires waitForFunction, not fixed timeout

**Symptom:** `Expression badge(s) found: 0` in Playwright test despite animation visually completing; badge appears when test runs interactively.

**Root cause:** Animation duration = `path.length × 350ms + 150ms`. For wandering paths of 10+ tiles the total exceeds a fixed 4100ms wait. The badge span (rendered by `CodaCharacter`) only appears when `isAnimating = false`.

**Workaround/fix applied:** Replace fixed `waitForTimeout(3500)` with `waitForFunction(() => spans.some(s => emoji.test(s.textContent)), { timeout: 10000 })`.

**Prevention for next run:** For any animation-gated DOM element, prefer `waitForFunction` over `waitForTimeout`.

---

## 2026-06-21 — Scroll-snap navigation requires setViewportSize + click-through CTAs

**Symptom:** Section 1 and 2 of the Coda lesson page don't render in Playwright headless after `setItem('coda-max-step', '1')` + page reload.

**Root cause:** Next.js App Router SSR runs `useState` lazy initializers on the server (where `window === undefined`, returning 0). During hydration the client uses the server's rendered state, not the localStorage value. So pre-seeding localStorage before reload doesn't work.

**Workaround/fix applied:** Use `setViewportSize({ width: 1280, height: 900 })` and click through CTA buttons ("Give Coda a goal" → "Set Coda's reward") to navigate sections. React event handlers fire and `scrollTo()` sets `maxReached` in-state, rendering subsequent sections.

**Prevention for next run:** Always use click-through navigation for scroll-snap sections. Never rely on localStorage pre-seeding for SSR React state.

---

## 2026-06-22 — Playwright browser mismatch (chromium_headless_shell-1223 missing)

**Symptom:** `npx playwright test --project=chromium` fails with "Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1223/..."

**Root cause:** Default playwright.config.ts uses the installed playwright version which expects chromium-1223, but only chromium-1194 is installed in this environment.

**Workaround/fix applied:** Use `--config=playwright.verify.config.ts` which hard-codes `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`.

**Prevention for next run:** Always run with `--config=playwright.verify.config.ts` in this environment.

---

## 2026-06-22 — localStorage seeding for activity-completed checks

**Symptom:** Seeding `{ 'update-understanding-pippy': true }` into localStorage key `activity-completions` does not change the courses page gate behavior.

**Root cause:** `lib/utils/activity-tracking.ts` uses key `completed-activities` (not `activity-completions`) and expects array format `[{ id: string, completedAt: number }]`, not a map.

**Workaround/fix applied:** Use `localStorage.setItem('completed-activities', JSON.stringify([{ id: 'update-understanding-pippy', completedAt: Date.now() }]))` to simulate completion.

**Prevention for next run:** Always use the `makeCompletedActivities(ids)` helper or check `lib/utils/activity-tracking.ts` for the exact key/format before seeding.
