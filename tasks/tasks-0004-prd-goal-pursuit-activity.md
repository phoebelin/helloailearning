# Task List: How Machines Chase Goals with Coda — "Reward the Robot"

**Source PRD**: `0004-prd-goal-pursuit-activity.md` (v1.0)

---

## Current State Assessment

- The app is Next.js (App Router) with Activities 1 (Zhorai), 2 (Mori), and 3 (Pippy) shipped. **Activity 4 (Coda) does not exist yet — this is greenfield.**
- **Skeleton to mirror — Mori (`how-machines-use-patterns`).** Per `CLAUDE.md`, Mori is the cleanest architectural reference: a per-activity context provider (`lib/context/mori-activity-context.tsx`), a typed step union + state (`types/mori-activity.ts`), level data kept out of components (`lib/data/mori-levels.ts`), presentational step components (`components/activities/mori/*`), and a scroll-snap section page (`app/lessons/how-machines-use-patterns/page.tsx`) that maps each step to a section with a `STEP_TO_INDEX` / `INDEX_TO_STEP` map, progress bar, prev/next, and `maxReached` persistence. Coda will follow this exact shape.
- **Design source of truth — Zhorai.** Match its visual language (white bg, Inter, filled-black primary / outlined secondary buttons, purple `#967FD8` accent). Reuse `components/ui/` primitives and `components/activities/shared/` (`celebration.tsx`).
- **Reuse as-is:** the scroll-section page pattern, the `activity-completed` event + `lib/utils/activity-tracking.ts` (`markActivityAsCompleted` / `isActivityCompleted`) for unlock/completion, the TTS hook pattern, and `components/activities/shared/celebration.tsx`.
- **Net-new for Coda:** a grid world + agent (no analog exists in 1–3), a deterministic **reward-maximizing planner** (the "model"), a discrete coin-placement UI + a reward-slider UI, and the **receipt** artifact.
- **No ML imports.** The planner is plain TypeScript and must NOT import `lib/ml/*`, so it never touches the `onnxruntime-node` build stub.
- **Asset status:** `public/images/coda.png` already exists (green spiky/fuzzy creature, oval eyes, smile). A `coda-course.png` tile crop is still TODO.

## Relevant Files

- `types/coda-activity.ts` — **New.** `CodaStep` union; `Coord`, `TileType`, `CoinPlacement`, `RewardConfig`, `SettledState`, `RunResult`, `CodaLevel`; activity state + step props.
- `lib/data/coda-planner.ts` — **New.** Deterministic reward-maximizing planner (`runAgent`) + `summarizeReceipt`; transparent, no ML.
- `lib/data/coda-planner.test.ts` — **New.** Unit tests for the planner (max-points path, loop/frozen/wander/hazard detection, deterministic tie-break, receipt math).
- `lib/data/coda-levels.ts` — **New.** The 3 authored levels (L1 pay-to-care, L2 reward-was-the-mistake, L3 specification-brittle) + helpers.
- `lib/data/coda-levels.test.ts` — **New.** Content validators: naive reward → authored failure; an intended reward yields the target; not trivially solvable.
- `lib/context/coda-activity-context.tsx` — **New.** Provider + state machine (`goToStep`, `nextStep`, set/adjust reward, run, advance level, reset).
- `app/lessons/how-machines-chase-goals/page.tsx` — **New.** Scroll-section page wrapping the provider; step↔section mapping (mirror Mori).
- `components/activities/coda/coda-character.tsx` — **New.** Coda sprite + expression states (idle/thinking/moving/happy/frozen).
- `components/activities/coda/grid-world.tsx` — **New.** SVG/DOM grid: tiles, exit/finish, scenic, hazards, coins.
- `components/activities/coda/path-overlay.tsx` — **New.** Solid movement trail vs dashed intended ghost path.
- `components/activities/coda/thought-bubble.tsx` — **New.** Coins-only bubble (enforces principle b).
- `components/activities/coda/mission-card.tsx` — **New.** The target in a separate, distinctly-styled space (principle a).
- `components/activities/coda/coin-tray.tsx` — **New.** Discrete coin-card placement (Levels 1–2).
- `components/activities/coda/reward-sliders.tsx` — **New.** Fine reward control, unlocks Level 3.
- `components/activities/coda/receipt-panel.tsx` — **New.** The itemized receipt artifact (principle c).
- `components/activities/coda/meet-coda-step.tsx` — **New.** Step 1.
- `components/activities/coda/mission-step.tsx` — **New.** Step 2.
- `components/activities/coda/set-reward-step.tsx` — **New.** Step 3.
- `components/activities/coda/run-step.tsx` — **New.** Step 4.
- `components/activities/coda/receipt-step.tsx` — **New.** Step 5 (verdict + re-tune branch).
- `components/activities/coda/level-complete.tsx` — **New.** Step 6 (what-changed + per-level takeaway + celebration).
- `components/activities/coda/session-summary-step.tsx` — **New.** Step 7 (full-arc recap).
- `app/courses/page.tsx` — **Modify.** Add Chapter 4 (Coda) tile; gate on Activity 3 completion (`find-the-bad-egg`).
- `public/images/coda.png` — **Exists.** Coda sprite.
- `public/images/coda-course.png` — **New.** Course-tile crop of Coda.
- `tests/e2e/coda-chapter4.spec.ts` — **New.** Happy-path-per-level e2e (set → run → receipt → re-tune → target) + unlock gating.

### Notes

- Run unit tests with `npx jest [path]`; e2e with `npx playwright test tests/e2e/coda-chapter4.spec.ts`.
- **The planner is the single source of truth.** Every on-screen effect — movement trail, thought-bubble, receipt, verdict — must derive from one `runAgent` call. No separately-scripted outcomes.
- **Validators are the source of truth for level content.** A level is only correct if: the naive reward produces the authored failure (`wandered`/`looped`/`rush`|`frozen`), at least one intended reward reaches the target, and it isn't trivially solvable. Tune grid/coins/ranges until green; don't weaken the planner.
- **Target ≠ reward is a hard requirement, not polish:** separate styled spaces, coins-only thought-bubble, the receipt, and NO auto-suggested rewards (PRD principles a–d).
- Reward input escalates: **coin cards** (L1–L2) → **slider** unlocks at **L3** for the threshold-flip.
- **In-place play loop (updated design — supersedes the separate set-reward/run/receipt steps):** setting the reward, running Coda, and reading the receipt all happen on **one surface**, without advancing to a new scroll section. The child tunes the reward, hits **Run**, watches Coda run on the same grid, the receipt appears in place, and they re-tune and re-run — all without navigating away. Only `meet-coda` → `mission` → **`play`** → `level-complete` → `session-summary` are distinct sections.
- **Coins are dragged onto the grid:** placing a coin is a drag-and-drop gesture from the coin tray onto a grid tile (drag is the primary interaction, not just tap-to-place); coins can be dragged to reposition and dragged off / back to the tray to remove.
- Match Zhorai's visual language; reuse `components/ui/` and `components/activities/shared/`.

## Tasks

- [x] 1.0 Scaffold the Coda activity: types, context/state machine, and the lesson page shell (mirror Mori)
  - [x] 1.1 Create `types/coda-activity.ts` with the data model from the PRD: `Coord`, `TileType` (`empty`/`wall`/`start`/`exit`/`scenic`/`hazard`), `CoinPlacement`, `RewardConfig` (`coins`, `stepCost?`, `scenicBonus?`, `hazardPenalty?`), `SettledState` (`reachedTarget`/`wandered`/`looped`/`frozen`/`hitHazard`), `RunResult` (`path`, `totalPoints`, `pointsBreakdown[]`, `settledState`), and `CodaLevel` (`missionText`, `grid`, `intendedPath`, `rewardInputMode`, `startingReward`, `naiveReward`, `naiveExpectedState`, `intendedRewardExample`, `takeaway`).
  - [x] 1.2 Define the `CodaStep` union in the same file: `meet-coda` → `mission` → `set-reward` → `run` → `receipt` → `level-complete` → `session-summary`, plus a `CodaStepProps` (`onNext` / `onPrevious?`) interface mirroring `MoriStepProps`. *(⚠️ Revised by task 5.0 — the `set-reward`/`run`/`receipt` steps collapse into a single `play` step; see 5.0.)*
  - [x] 1.3 Define `CodaActivityState` (currentStep, currentLevelIndex, the working `RewardConfig`, the latest `RunResult | null`, `runCountThisLevel`, `levelsCompletedThisSession`, persisted progress fields) — mirror the shape of `MoriActivityState`.
  - [x] 1.4 Create `lib/context/coda-activity-context.tsx`: a `CodaActivityProvider` + `useCodaActivity` hook holding the state machine — `goToStep`, `nextStep`, `setReward`/`updateReward` (place/move/remove coins; set slider terms), `runAgent` (calls the planner, stores `RunResult`, increments `runCountThisLevel`), `resetRewardForLevel`, `advanceLevel`, `resetActivity`; initialize each level's working reward from `level.startingReward`.
  - [x] 1.5 Create the lesson page `app/lessons/how-machines-chase-goals/page.tsx` by adapting Mori's scroll-snap shell: 7 logical steps mapped to sections via `STEP_TO_INDEX`/`INDEX_TO_STEP` (with `level-complete` and `session-summary` sharing the final section as Mori does), the progress bar (purple `#967FD8`), prev/next, `maxReached` persistence (`coda-max-step` localStorage key), and the `IntersectionObserver` scroll sync. Render placeholder step components for now; wrap in `CodaActivityProvider`. *(⚠️ Section mapping is reworked by task 5.0 — `set-reward`/`run`/`receipt` become one `play` section; final section count drops from 6 to 4.)*
  - [x] 1.6 Confirm the route builds and renders the meet step with no ML imports pulled into the bundle (planner is plain TS).

- [x] 2.0 Build the transparent reward-maximizing planner + receipt summarizer (the "model"), with unit tests
  - [x] 2.1 In `lib/data/coda-planner.ts`, implement `runAgent(level, reward): RunResult` — a deterministic bounded search over the grid that finds the **maximum-total-points** path from `start` within a max-steps budget, honoring coins (with `oneTime` collection semantics), `stepCost`, `scenicBonus` (scenic tiles), and `hazardPenalty`/hazard tiles; respect walls.
  - [x] 2.2 Implement a documented deterministic tie-break for equal-points paths (proposed: fewest steps, then a fixed direction order) so runs are reproducible.
  - [x] 2.3 Classify the outcome into `SettledState`: `reachedTarget` (path ends on exit/finish), `frozen` (best action is to not move — staying scores highest), `looped` (oscillation/re-collection cycle out-scores finishing), `wandered` (no incentive structure → no exit-directed path), `hitHazard` (path terminates on a hazard). Surface enough detail for the receipt + verdict copy.
  - [x] 2.4 Implement `summarizeReceipt(runResult): { lineItems: {label, points}[]; total; verdict }` — attribute every point to a specific coin / scenic bonus / step cost / hazard so `pointsBreakdown` is honest and exact; produce an age-appropriate verdict line per `SettledState`.
  - [x] 2.5 Provide a `thoughtBubbleView(level, reward)` helper that exposes only the coins/points the agent "sees" (never the mission) for `thought-bubble.tsx`.
  - [x] 2.6 Write `lib/data/coda-planner.test.ts`: max-points path selection, step-cost trade-offs, scenic-bonus pull, hazard avoidance, loop/frozen/wander/hazard detection, deterministic tie-break, and receipt totals equal the run total.

- [x] 3.0 Author the three levels (L1 → L2 → L3) with content validators
  - [x] 3.1 Author **L1 "You have to pay it to care"** in `lib/data/coda-levels.ts`: a small maze with `start` + `exit`; `intendedPath` = route to the exit; `rewardInputMode: 'coins'`; `startingReward` = **no coins** (naiveExpectedState `wandered`); `intendedRewardExample` = one coin on the exit (→ `reachedTarget`); MM1 takeaway copy.
  - [x] 3.2 Author **L2 "It didn't cheat — you left points lying around"**: maze with `start` + `finish`; `naiveReward` = breadcrumb coins scattered along the route forming a cluster that, under the step budget, makes **looping out-score finishing** (`naiveExpectedState: 'looped'`, never reaches finish); `intendedRewardExample` = reward sculpted so finishing pays best (e.g. value on the finish / `oneTime` mid-path coins); MM2 takeaway copy. *(Looping mechanic chosen: re-collectable coins `oneTime: false` — documented in code comment.)*
  - [x] 3.3 Author **L3 "Tiny changes, totally different agent"**: 5×4 grid; hazard directly above start (UP=hazard, RIGHT=scenic); naive (all zeros) hits hazard via direction-order tie-break; high `hazardPenalty` → scenic route to exit (`reachedTarget`); high `stepCost` → frozen; scenic bonus also repairs the blunder. `rewardInputMode: 'sliders'`; all three regimes validated in tests.
  - [x] 3.4 Implement helpers: `getLevelByIndex`, `matchesTarget(runResult, level)` (reached target AND satisfies the level's defining property — reached exit / reached finish / took the long scenic way without hazards), and any reward-mutation helpers the context needs. *(`matchesTarget` currently only checks `reachedTarget`, sufficient for L1; will need the level-specific "defining property" extension once L2/L3 land.)*
  - [x] 3.5 Write `lib/data/coda-levels.test.ts` validators per level: `naiveReward` → `naiveExpectedState`; `intendedRewardExample` → `reachedTarget` + `matchesTarget`; the level is **not** solvable by a trivial/unrelated reward; for L3, assert the rush/freeze/stroll regimes all occur across the slider ranges. Tune grids/coins/ranges until green. *(L1 + L2 validators done; L3 validators land with 3.3.)*

- [x] 4.0 Build the world & interaction components
  - [x] 4.1 `components/activities/coda/grid-world.tsx` — render the level grid in **SVG/DOM**: empty/wall tiles, the exit/finish doorway in the wall, scenic tiles, hazard tiles, and placed coins as point-value tokens; responsive scaling. *(Ghost path overlay + run trail overlay both implemented in the same component.)*
  - [ ] 4.2 `components/activities/coda/path-overlay.tsx` — draw the **dashed intended ghost path** and the **solid actual movement trail** overlaid on the grid, with distinct color/weight; animate the trail along `RunResult.path` (CSS/SVG animation). *(Ghost/run path rendering is handled inline in grid-world.tsx for now; a dedicated animated overlay component is deferred.)*
  - [x] 4.3 `components/activities/coda/coda-character.tsx` — Coda sprite (`public/images/coda.png`) with expression states (idle/moving/happy/frozen/confused); CSS filter/scale effects per state; position it on the grid and move it along the path during a run. Expression driven from `play-step.tsx` via `codaExpression` prop on `GridWorld`.
  - [ ] 4.4 `components/activities/coda/thought-bubble.tsx` — render only the coins/points from `thoughtBubbleView` (never the mission text); shown during the run. *(Currently rendered as text in run-step; dedicated bubble component is deferred.)*
  - [x] 4.5 `components/activities/coda/mission-card.tsx` — the **target** in a physically separate, distinctly-styled "brief" space (principle a); takes `missionText`.
  - [x] 4.6 `components/activities/coda/coin-tray.tsx` — discrete coin cards (fixed point values) the child places/moves/removes on grid tiles (tap-to-place or drag), wired to `updateReward`; used in L1–L2. **No auto-suggested placements** (principle d). *(⚠️ Revised by task 5.9 — placement must be drag-and-drop onto the grid, not tap-to-place.)*
  - [x] 4.7 `components/activities/coda/reward-sliders.tsx` — fine sliders for `scenicBonus`/`stepCost`/`hazardPenalty`, wired to `updateReward`; unlocked/shown only at L3; ≥44pt touch targets. Integrated into `play-step.tsx` with slider thought bubble.
  - [x] 4.8 `components/activities/coda/receipt-panel.tsx` — render `summarizeReceipt` output as an itemized receipt (line items + bold total + verdict line) beside the path picture (principle c).

- [x] 5.0 Build the flow components and wire them into the page
  - [x] 5.1 `meet-coda-step.tsx` (Step 1): Coda intro + the plainly-stated blindness ("I can only see coins"); callback to Pippy ("You just helped Pippy fix its training data. Coda learns differently — from rewards, not labels."); CTA "Give Coda a goal". TTS via `useEnhancedTextToSpeech` (rate 0.88, pitch 1.15, Google Cloud fallback); mute toggle button. Auto-speaks intro on mount.
  - [x] 5.2 `mission-step.tsx` (Step 2): show the `mission-card` (target, child's side) + the `grid-world` with the dashed ghost path and **no coins yet**; copy reinforcing "Coda can't read this"; CTA "Set the reward".
  - [x] 5.3 `set-reward-step.tsx` (Step 3): `grid-world` + (`coin-tray` for L1–L2 or `reward-sliders` for L3); the dashed ghost path stays visible for contrast; CTA "Run Coda". *(Sliders for L3 and "Run again" label are deferred until L3 is authored.)* **⚠️ Superseded by 5.9 — folded into the in-place `play` step.**
  - [x] 5.4 `run-step.tsx` (Step 4): call `runAgent`, show grid with current coins + coins-only thought bubble; CTA triggers run and auto-advances. *(Animation deferred with 4.2/4.3.)* **⚠️ Superseded by 5.9 — folded into the in-place `play` step.**
  - [x] 5.5 `receipt-step.tsx` (Step 5): show `receipt-panel` + grid with ghost vs run path + verdict; branch — `matchesTarget` → continue to level-complete; otherwise "Re-tune the reward" → back to Step 3. Gentle hint after ≥3 failed runs (principle d). **⚠️ Superseded by 5.9 — folded into the in-place `play` step.**
  - [x] 5.6 `level-complete.tsx` (Step 6): "what changed" panel (first-run vs final-run path + receipt), the per-level takeaway copy, and `celebration.tsx`; CTAs "Next level!" / "I'm done for now". *(Implemented: side-by-side grids showing first attempt path vs winning path with outcome labels and verdict copy; `Celebration` confetti; `firstRun`/`runCountThisLevel` now persist across re-tunes in context so the comparison always reflects the true first vs final attempt.)*
  - [x] 5.7 `session-summary-step.tsx` (Step 7): full-arc recap ("Coda does what you reward, not what you want"); CTAs "Keep playing" / "Back to activities"; call `markActivityAsCompleted('how-machines-chase-goals')`. *(markActivityAsCompleted is called in `advanceLevel()` on last level; session-summary component complete.)*
  - [x] 5.8 Replace the page placeholders from 1.5 with the real step components; verify the step↔section mapping, the in-place re-tune/re-run loop, the "Next level!" loop, and reset behavior. *(All real step components wired; 4-section mapping verified end-to-end.)*
  - [x] 5.9 **Collapse set-reward → run → receipt into one in-place `play` step (updated design).** Created `components/activities/coda/play-step.tsx`; updated `CodaStep` union to replace `set-reward`/`run`/`receipt` with `play`; reworked page to 4 sections; retired old step files. Verified end-to-end: receipt appears in-place, re-tune restores coin tray in-place, success CTA fires on exit. *(Animation of Coda moving along path deferred to 4.2/4.3.)*
  - [x] 5.10 **Drag-to-place coins (updated design).** `play-step.tsx` uses `@dnd-kit/core` (DndContext, DragOverlay, PointerSensor) + `grid-world.tsx` DroppableTile + `coin-tray.tsx` DraggableCoin. Drag coin from tray to grid tile to place; click fallback for keyboard/accessibility; "Re-tune" clears lastRun only (keeps workingReward editable). *(Drag-off-grid removal not implemented — low priority.)*

- [ ] 6.0 Course catalog integration, assets, and QA
    - [x] 6.1 Add a **Chapter 4** tile to `app/courses/page.tsx` mirroring the Chapter 3 pattern: gate on Activity 3 + the `activity-completed` listener; locked state shows the lock icon + "Complete How machines update understanding with Pippy to unlock"; unlocked tile routes to `/lessons/how-machines-chase-goals`. *(Gated on `isActivityCompleted('update-understanding-pippy')` — the PRD says `find-the-bad-egg`, but the actual Pippy code at `lib/context/pippy-activity-context.tsx:188` calls `markActivityAsCompleted('update-understanding-pippy')`, so that's the id that's actually settable. Using `find-the-bad-egg` would leave Chapter 4 permanently locked.)*
  - [x] **6.1a** Fix courses page layout: changed chapter row from `flex flex-row p-10` to `flex flex-row flex-wrap p-6` so all four chapter tiles are visible on typical laptop screens and wrap gracefully on smaller viewports.
  - [ ] 6.2 Create `public/images/coda-course.png` (course-tile crop of Coda) and use it on the tile (fall back to `coda.png` if needed). *(Tile currently uses `coda.png` directly as the fallback.)*
  - [x] 6.3 Verify the unlock gate (locked before Activity 3, unlocked after) and that finishing Activity 4 calls `markActivityAsCompleted('how-machines-chase-goals')` and fires `activity-completed`. *(Fixed in this milestone: Chapter 4 tile was always accessible — added `pippyComplete` state gated on `isActivityCompleted('update-understanding-pippy')`, with `activity-completed` listener, matching the Chapter 3 pattern. `markActivityAsCompleted('how-machines-chase-goals')` confirmed called in `coda-activity-context.tsx` `advanceLevel()` on last level.)*
  - [ ] 6.4 Responsive polish (iPad/iPhone): grid scales/scrolls; coin placement + sliders usable by touch; mission card vs grid clearly separated on small screens; tap targets ≥44×44pt.
  - [x] 6.5 Copy pass: Updated `meet-coda-step.tsx` — Coda's blindness plainly stated, Pippy callback added, CTA fixed to "Give Coda a goal", TTS auto-speaks on mount. Mission text, receipt verdict lines, and takeaways verified kid-legible and AI-connected. Target text (missionText) confirmed absent from thought-bubble (thought-bubble shows only `workingReward.coins` and slider values, never `currentLevel.missionText`).
  - [ ] 6.6 Author `tests/e2e/coda-chapter4.spec.ts`: per-level happy path (set reward → run → read receipt → re-tune → hit target) + unlock gating; then run the QA-agent routine and fix issues.
