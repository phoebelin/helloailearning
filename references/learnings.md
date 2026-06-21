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
