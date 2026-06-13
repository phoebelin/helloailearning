# QA Report — Pippy Activity (Chapter 3) v2
**Date:** 2026-06-07
**Mode:** Ad Hoc
**Tester:** QA Agent

## Summary
- Total checks run: 22 (Phases 1–7, API/backend N/A)
- Bugs found: 4 (P0: 1, P1: 1, P2: 1, P3: 1)
- Bugs fixed: 4
- Needs human review: 1 (missing sprites — asset generation task, not a code bug)

---

## Bugs Found & Fixed

### [BUG-001] All styling gone on chapter-3 — P0
**Phase:** Phase 1 — Reconnaissance
**Steps to reproduce:**
1. Run `npx next build` (production build)
2. Open http://localhost:3000/lessons/chapter-3 in dev mode
**Expected:** Page renders with Tailwind CSS applied (proper layout, fonts, colors)
**Actual:** `/_next/static/css/app/layout.css` returns HTTP 404; page renders as completely unstyled HTML. Buttons in top-left corner, no Inter font, no colors.
**Root cause:** Running `npx next build` overwrites `.next/` with production artifacts. The dev server's compiled CSS at `.next/static/css/app/layout.css` was deleted. Dev server found the directory empty and returned 404 for all CSS requests.
**Fix applied:** Cleared `.next/` cache entirely (`rm -rf .next`) and restarted the dev server with `npx next dev`. On first page request the CSS recompiled to 72KB and all styling restored.
**Status:** ✅ Fixed

---

### [BUG-002] Level-complete screen never appears after fixing the bad egg — P1
**Phase:** Phase 2 — Happy Path
**Steps to reproduce:**
1. Play through Chapter 3, Level 1
2. Relabel the Leopard card from NO to YES (correct fix)
3. Click "I think it's fixed!" to go to the check-batch step
4. Observe: "All correct! ✓" shows briefly, but the activity never advances to the level-complete screen
**Expected:** After "All correct!", activity auto-advances to "You Fixed Pippy's Understanding!" within ~2 seconds
**Actual:** "All correct!" shows indefinitely; `localStorage.getItem('pippy-v2-max-step')` stays at 4 (never reaches 5); level-complete section never renders
**Root cause:** `check-batch-step.tsx` called `runCheckBatch()` and used its synchronous return value to decide whether to set `setTimeout(onPass, 2000)`. In React 18, the `setState` updater inside `runCheckBatch` is deferred to the next render cycle, so `runCheckBatch()` returned `{ pass: false }` even though the actual check passed. The `setTimeout` was never set. "All correct!" did show (correct — React processed the state update), but the auto-advance never fired.
**Fix applied:** Split the single `useEffect` in `check-batch-step.tsx` into two:
1. One fires on mount (calls `runCheckBatch()` — ignores return value)
2. A second watches `state.lastCheckPass` and calls `setTimeout(onPass, 2000)` when it becomes `true` (with a `useRef` guard to prevent double-firing)
File: `components/activities/pippy/check-batch-step.tsx`
**Status:** ✅ Fixed — verified `maxReached` reaches 5, level-complete renders with 50%→100% accuracy display and Tiger NO→YES before/after panel.

---

### [BUG-003] Belt animation takes 32 seconds for 8 items — P2
**Phase:** Phase 7 — UI
**Steps to reproduce:**
1. Navigate to the "What Pippy Learned From" step (Step 3)
2. Click "Look at Pippy's examples ▶" to start the belt
3. Wait for all 8 training animals to be sorted
**Expected:** Belt animation should complete in a reasonable time (~10–14s for 8 items)
**Actual:** Belt animation takes `(1200 + 2200 + 600) × 8 = 32,000ms` (32 seconds) — too long for children ages 8–10 to wait before the "Find the bad egg" button appears
**Fix applied:** Reduced animation timings in `investigate-training-step.tsx`:
- `beltDuration`: 1200ms → 600ms
- `sortDuration`: 2200ms → 900ms
- `gapDuration`: 600ms → 200ms
New total: `(600 + 900 + 200) × 8 ≈ 13.6 seconds`
**Status:** ✅ Fixed

---

### [BUG-004] Rules of Hooks violation in inspect-fix-step — P3
**Phase:** Phase 1 — Reconnaissance (code review)
**Steps to reproduce:**
1. Open `components/activities/pippy/inspect-fix-step.tsx`
2. See `useMemo(...)` called on line 157, after `if (!currentLevel) return null` on line 155
**Expected:** All hooks must be called at the top level, before any conditional return
**Actual:** `useMemo` was called after a conditional early return — violates React's Rules of Hooks. React's development mode strict mode renders components twice and checks for hook count consistency; this would throw if `currentLevel` were ever undefined between renders.
**Fix applied:** Moved `useMemo` before the `if (!currentLevel) return null` guard; added an `if (!currentLevel) return 0` guard inside the memo callback.
File: `components/activities/pippy/inspect-fix-step.tsx`
**Status:** ✅ Fixed

---

## Needs Human Review

### [REVIEW-001] 25 of 27 animal sprites missing
**Severity:** P3 (visual degradation only — text fallback works)
**Details:** Only `lion.png` and `dolphin.png` exist in `public/images/pippy/animals/`. The remaining 25 animals show a gray placeholder box with the animal's name. The `AnimalImage` component handles 404s gracefully via `onError`. However, the activity visually reads much better with real sprites.
**Action needed:** Generate the 25 remaining sprites per `tasks/0003-asset-manifest.md` style spec and `0003-asset-manifest.md` animal list. The generation prompt template is in that file.

---

## Checks Passed (no issues found)

- **Happy path — full Level 1 flow**: Meet Pippy → Watch Quiz (Tiger/House Cat both guessed NO incorrectly ✓) → Investigate Training (belt animation, labels pre-attached ✓) → Find Bad Egg (confidence meter at 50%, "Why did Pippy guess that?" panel shows Tiger/House Cat as missed animals ✓) → Relabel Leopard YES → Check Batch passes (100% accuracy ✓) → Level Complete (before 50%/after 100%, Tiger NO→YES before/after ✓)
- **Prediction logic**: k=1 nearest-neighbor correctly identifies Leopard as Tiger/House Cat's nearest neighbor (5 and 4 attribute matches respectively); after fix Tiger/House Cat route to YES ✓
- **"Why did Pippy guess that?" panel**: Shows Tiger and House Cat as missed quiz animals; clicking reveals nearest training neighbor ✓
- **Confidence meter**: Shows 50% with bad egg present, updates live ✓
- **Training timeline**: Shows 8 examples in green/red color-coded dots, expandable ✓
- **Yes/No label stamps**: Green for YES, orange/red for NO, consistent throughout ✓
- **Category goal line**: "Pippy is learning to recognize: CATS" shown prominently on Meet Pippy step ✓
- **Progress bar**: Advances one segment per section visited ✓
- **Text fallback for missing sprites**: Gray placeholder box with animal name shows when image 400s ✓
- **Zero JavaScript errors** throughout the happy path (excluding expected 400s from missing sprites) ✓
- **CSS compilation**: globals.css, Tailwind JIT, and all new component classes compile correctly once `.next` is clean ✓

---

## Recommendations

1. **Never run `npx next build` in a live dev session.** The production build overwrites dev CSS artifacts. Use `npx next dev` exclusively during development. The README or CLAUDE.md should note this.

2. **The `runCheckBatch()` return-value pattern is inherently unreliable in React 18.** Consider refactoring `runCheckBatch` in the context to return the result via a Promise or callback, or deprecate the return value entirely (the state-watching pattern used in the fix is more robust).

3. **Belt animation length vs engagement**: At ~14 seconds for 8 animals, the belt is still long for a 8–10 year-old. Consider adding a "Skip animation" button that jumps straight to the sorted piles. This would also help replays.

4. **Sprite generation is the highest-impact visual improvement**: With real animal sprites, the "find the bad egg" mechanic becomes much more self-evident (you can see it's a cat!) — the core pedagogical mechanic of Level 1 depends on this recognition.
