# QA Report — Mori Chapter 2 (Pattern Learning Activity)
**Date:** 2026-05-24
**Mode:** Ad Hoc
**Tester:** QA Agent

---

## Summary
- Total checks run: 42
- Bugs found: 5 (P0: 0, P1: 1, P2: 2, P3: 2)
- Bugs fixed: 5
- Needs human review: 0

---

## Bugs Found & Fixed

### [BUG-001] IntersectionObserver overwrites `session-summary` with `level-complete` — P1

**Phase:** Phase 6 — State & Progress Persistence

**Steps to reproduce:**
1. Complete all 4 levels (sort each correctly)
2. Click "See your summary" on the Level 4 LevelComplete screen
3. The session summary panel is shown correctly
4. Scroll up and back down so section 5 re-enters the viewport
5. The session summary disappears and is replaced by the LevelComplete panel

**Root cause:** `INDEX_TO_STEP` maps index 5 to `'level-complete'`, but `'session-summary'`
also lives at section 5. When the IntersectionObserver fires on section 5 while
`state.currentStep === 'session-summary'`, it calls `goToStep('level-complete')`,
switching the displayed component.

**Expected:** Session summary remains visible; scrolling back to section 5 has no effect
on `currentStep` once in session-summary state.
**Actual:** LevelComplete component re-renders over the session summary.

**Fix applied:** Added a guard in the IntersectionObserver callback in
`app/lessons/chapter-2/page.tsx` (line ~114):
```ts
if (step && step !== state.currentStep &&
    !(state.currentStep === 'session-summary' && step === 'level-complete')) {
  goToStep(step);
}
```
**Status:** ✅ Fixed

---

### [BUG-002] `isMismatch` highlighting in Lab is permanently dead code — P2

**Phase:** Phase 5 — Feedback & Answer Checking

**Steps to reproduce:**
1. Reach the Sort Challenge, sort at least one creature incorrectly
2. Click "Back to the Lab"
3. Observe that no lab result cards are highlighted with the amber mismatch style

**Root cause:** Creatures tested in the Lab have IDs like `preview-0`, `preview-1`, …
Creatures from the sort batch (and thus `state.sortMismatches`) have IDs like
`l1-t1`, `l1-f2`, … These ID namespaces are mutually exclusive, so
`mismatchIds.has(t.creature.id)` is always `false`. The amber highlight
and "← test this!" label could never render.

**Expected:** Code only contains features that can actually fire.
**Actual:** ~15 lines of dead amber-highlight UI code across `LabResultCard` interface,
component body, and two render-site usages.

**Fix applied:** Removed `isMismatch?: boolean` from `LabResultCardProps`, removed
the conditional amber-border branch from the card's className, removed the
"← test this!" span, removed `const mismatchIds = new Set(state.sortMismatches)`,
and removed both `isMismatch={mismatchIds.has(t.creature.id)}` props.
Files: `components/activities/mori/lab-interface.tsx`

**Status:** ✅ Fixed

---

### [BUG-003] `resetSort` cleared `sortMismatches` before user returned to Lab — P2

**Phase:** Phase 3 — Validation & Auto-Advance Checks

**Steps to reproduce:**
1. Fail a sort attempt
2. Click "Back to the Lab" (calls `handleTryAgain` → `resetSort()` → `goToStep('lab')`)
3. Inspect `state.sortMismatches` — it is now `[]`

**Root cause:** `resetSort` previously cleared both `sortAssignments` and
`sortMismatches`. But `sortMismatches` is the only record of which creatures
the user sorted incorrectly. Clearing it before the user returns to the lab
erases the data that would support the mismatch-highlight feature (and the
progressive hint system which already correctly reads `failedSortAttempts`).

**Expected:** `resetSort` clears only `sortAssignments` (the per-attempt drag
placements). `sortMismatches` should persist until a new sort attempt calls
`submitSort` with fresh results.

**Fix applied:** Removed `sortMismatches: []` from the `resetSort` updater in
`lib/context/mori-activity-context.tsx`. The `generateSortBatch` call (which
fires on each fresh sort attempt) already clears `sortMismatches` when
producing a new batch.

**Status:** ✅ Fixed

---

### [BUG-004] SVG creature cards lack `role="img"` — P3

**Phase:** Phase 7 — UI & Accessibility

**Steps to reproduce:**
1. Inspect any `<CreatureRenderer>` element in the DOM
2. Observe: `<svg aria-label="Red round creature, spots, with spikes, 2 eyes">` but
   no `role` attribute

**Root cause:** SVG elements are not announced as images by all screen readers
unless `role="img"` is present alongside `aria-label`. Without it, some readers
(NVDA, older JAWS) traverse the SVG's internal `<circle>`, `<polygon>`, and
`<rect>` children, producing noisy or meaningless output.

**Expected:** Screen reader announces the accessible label (e.g. "Red round
creature, spots, with spikes, 2 eyes") as a single image.
**Actual:** Some screen readers enumerate SVG internals.

**Fix applied:** Added `role="img"` to the `<svg>` element in
`components/activities/mori/creature-renderer.tsx`.

**Status:** ✅ Fixed

---

### [BUG-005] Rapid double-click on "Test with Mori!" logs the same creature twice — P3

**Phase:** Phase 4 — Edge Case Inputs

**Steps to reproduce:**
1. Build any creature in the Lab
2. Double-click "Test with Mori!" quickly (within one render cycle)
3. Observe that two identical entries appear in the YES/NO results columns

**Root cause:** `handleTest` had no guard against concurrent invocations.
Because `counter` is incremented inside a state setter (async), a rapid second
click fires before the ID changes, calling `testCreature` with the same
`previewCreature` object twice. This inflates `state.testedCreatures` and
the "creatures tested" count shown at the end of each level.

**Expected:** Each click of "Test with Mori!" produces exactly one result entry.
**Actual:** Rapid double-clicks produce two entries for the same creature.

**Fix applied:** Added `isTesting` boolean state to `LabInterface`. `handleTest`
returns early if `isTesting` is true, sets it true at the start, and clears it
synchronously after the test completes. The button also receives `disabled={!isComplete || isTesting}`.
File: `components/activities/mori/lab-interface.tsx`

**Status:** ✅ Fixed

---

## Checks Passed (no issues found)

**Phase 1 — Reconnaissance**
- All 7 step components correctly identified and mapped
- All interactive elements catalogued: 5 feature-selector buttons, creature builder controls,
  drag-and-drop sort bins, CTA buttons
- No text/free-form input surfaces (no NLP injection surface)

**Phase 2 — Happy Path**
- IntroductionStep: "How Mori thinks" button advances to section 1 ✅
- FeatureAttentionStep: feature toggle buttons work; "Start testing!" advances ✅
- ObserveStep: YES/NO columns correctly derived from `trueRule`; "Test your own!" advances ✅
- LabInterface: builder gating works (`isComplete` flag); Mori reaction renders correctly ✅
- SortChallenge: drag-and-drop assigns correctly; submit gated on `allAssigned` ✅
- LevelComplete: rule label, explanation, and attended-feature highlights all correct ✅
- SessionSummary: stat counts accurate; "Keep playing" resets cleanly ✅

**Phase 3 — Validation & Auto-Advance**
- "Test with Mori!" blocked when creature is incomplete ✅
- "I'm ready to sort!" only appears after ≥ 2 lab tests ✅
- Sort "Check my sorting!" blocked until all creatures are assigned ✅
- No timer-based auto-advance anywhere ✅

**Phase 4 — Edge Cases**
- No free-text inputs in this activity — text injection not applicable ✅
- Drag to invalid zone: creatures not dropped on a bin return to tray ✅
- Builder partial state: selecting shape only (not all fields) leaves preview blank ✅

**Phase 5 — Feedback & Answer Checking**
- `trueRule` logic verified against all 4 level datasets (spot-checked manually):
  - L1 (spikes): all YES have spikes, all NO don't ✅
  - L2 (blue, confound=round): traps l2-t1/t2 correctly break the "round" hypothesis ✅
  - L3 (round AND spotted): traps correctly fail single-feature guesses ✅
  - L4 (proxy=green): traps l4-t1 (green+solid → YES) and l4-t2 (red+spots → NO) correctly expose proxy ✅
- Correct sort → "Perfect!" banner, advance button appears ✅
- Incorrect sort → mismatch count shown, "Back to the Lab" offered ✅
- Repeated failed sorts → `failedSortAttempts` increments, hint text escalates ✅

**Phase 6 — State & Progress Persistence**
- `totalLevelsCompleted` and `highestLevelReached` persisted to `localStorage` ✅
- `markActivityAsCompleted` called exactly once on Level 4 completion; deduped in `activity-tracking.ts` ✅
- `resetActivity` correctly preserves cross-session fields while resetting in-session state ✅
- `makeInitialState` loads persisted state on mount; SSR-safe (`window` guard) ✅

**Phase 7 — UI & Accessibility**
- All CTA buttons have visible text labels ✅
- Color swatches have `aria-label={color}` ✅
- Mori image has descriptive `alt="Mori"` / `alt="Mori celebrating"` ✅
- `@dnd-kit` drag-and-drop provides built-in keyboard support (Tab + Enter/Space) ✅
- `describeCreature` generates human-readable accessible labels for all creatures ✅

**Phase 8 — API / Backend**
- No network submission endpoints — all state managed client-side in `localStorage` ✅
- `localStorage` writes are wrapped in try/catch ✅
- SSR guard (`typeof window === 'undefined'`) present in all persistence functions ✅

**Child-Safety Checks**
- No external links in activity content ✅
- No free-text input that could be echoed to other users ✅
- Error messages not shown (no error states produce stack traces) ✅
- No PII collected beyond localStorage progress counters ✅

---

## Recommendations

1. **Mismatch creature reference in Lab** — Now that `sortMismatches` is preserved
   on "Back to Lab" (BUG-003 fix), consider adding a "Study these" callout to the
   Lab step that renders the actual sort creatures the user got wrong (using their
   pre-defined creature data). This would close the intent gap that BUG-002 exposed —
   the feature was designed to help users study failures, but lab and sort use
   different creature populations.

2. **`testCreature` anti-pattern** — The context's `testCreature` function sets a
   local variable inside a `setState` updater and returns it synchronously. This
   works in React 18 (updaters run synchronously in event handlers) but is fragile
   and will break if wrapped in `startTransition`. Consider refactoring to derive
   the verdict locally without relying on the updater return timing:
   ```ts
   const verdict = currentLevel.trueRule(creature);
   setState(prev => ({ ...prev, testedCreatures: [...prev.testedCreatures, ...] }));
   return { creature, verdict, attendedFeatures };
   ```

3. **Double-counting `totalLevelsCompleted`** — If a user replays a level they've
   already completed, `totalLevelsCompleted` increments again. For a children's
   game this is acceptable, but if this counter is ever displayed as "distinct levels
   completed," it will over-report.

4. **Mobile drag-and-drop** — `@dnd-kit` supports touch events, but `touch-none`
   on `DraggableCard` prevents the default scroll behavior. On narrow viewports
   this may make the bins hard to reach. Worth a real-device test on iOS/Android.
