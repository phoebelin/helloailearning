# Task List: How Machines Update Understanding with Pippy — "Find the Bad Egg"

**Source PRD**: `0003-prd-updating-understanding-activity.md` (v2 — animal redesign + mistake-first)
**Asset manifest**: `0003-asset-manifest.md`

---

## ⚠️ Redesign v2 — Change Log (read this first)

Activity 3 is **already implemented in v1** (abstract Mori feature-creatures, training-set-first flow) under `components/activities/pippy/`, `lib/context/pippy-activity-context.tsx`, `lib/data/pippy-levels.ts`, `lib/data/pippy-prediction.ts`, `types/pippy-activity.ts`, and `app/lessons/chapter-3/page.tsx`. **This task list converts that v1 to v2.** Below is exactly what changes so you can diff it.

### A. Data & model (rewrite)
- **NEW `lib/data/animals.ts`** — the shared animal library (27 animals + metadata) from the asset manifest.
- **`types/pippy-activity.ts`** — replace the `Creature` import with the new `Animal` type. `TrainingExample.creature` → **`TrainingExample.animal`**. `PippyLevel` gains `targetCategoryLabel`, `ruleAttribute`, `ruleValue`, `testAnimals` (the hook), and `takeaway`; `observeCreatures` → **`testAnimals`**; `checkBatch` becomes `Animal[]`. **Reorder/rename `PippyStep`** (see C).
- **`lib/data/pippy-prediction.ts`** — **rewrite** from the feature-vote classifier to **k=1 nearest-neighbor** over `{group, habitat, diet, activity, body, size}` (attribute-match count, deterministic tie-break). Return `{ verdict, confidence, nearestNeighborIds }`. **Add `getNearestNeighbors(animal, set, k)`** for the "Why, Pippy?" tool. Delete `perFeatureInfluence` / `computeNestFeatureBias` (creature-specific).
- **`lib/data/pippy-levels.ts`** — **rewrite** the three levels as animals: **L1 = cats (species)**, **L2 = ocean (habitat)**, **L3 = nocturnal (property)**; each with exactly **one mislabeled bad egg**, authored `testAnimals` (the hook, = nearest neighbor of the bad egg), `checkBatch`, `expectedFix`, and visibility-ramp `takeaway`. Bad eggs: L1 `leopard`→NO, L2 `seal`→NO, L3 `owl`→NO.

### B. Components (swap renderer + add train/test split)
- **NEW `components/activities/pippy/animal-card.tsx`** — renders an `Animal` sprite (via `next/image`) + name (+ optional YES/NO stamp). **Replaces all `CreatureRenderer` usage inside Pippy.** (Mori keeps `creature-renderer.tsx`.)
- **`conveyor-belt.tsx`** — keep, but it is now the **TRAINING-only** visual: labels ride in **pre-attached** (not "Pippy deciding"). Swap creature → `AnimalCard`.
- **NEW `components/activities/pippy/quiz-cards.tsx`** — the **TESTING** visual: new animals as cards that show "?" then flip to Pippy's guess, marked ✓/✗. Used by both observe (Step 2) and check-batch (Step 5) so testing always looks the same.
- **DROP/repurpose `pattern-warp.tsx`** — the nearest-neighbor model over animals has no per-visual-feature influence to plot. Remove it from the flow; its job (explaining *why*) is replaced by the **"Why did Pippy guess that?"** nearest-neighbor reveal in the inspect step. (`confidence-meter.tsx`, `before-after.tsx`, `training-timeline.tsx` are kept; swap creature → `AnimalCard`.)

### C. Flow reorder (MISTAKE-FIRST) — the key UX change
- **`PippyStep` order changes** from
  `meet-pippy → how-pippy-learned → observe-mistake → inspect-fix → check-batch → level-complete → session-summary`
  to
  **`meet-pippy → observe-mistake → investigate-training → inspect-fix → check-batch → level-complete → session-summary`**.
- **`observe-mistake-step.tsx`** moves to be the **first substantive beat (Step 2)** — the hook. Switch its visual from the belt to **`quiz-cards`**. Add the explicit category contrast ("This is clearly a CAT — but Pippy guessed NO").
- **`how-pippy-learned-step.tsx` → RENAME to `investigate-training-step.tsx`** and move to **Step 3**. Reframe copy from a passive "where Pippy's ideas come from" walkthrough to an **investigation**: "Let's look at what Pippy learned from — the mistake is hiding in here." Keep the belt (training visual). **Remove** the "what do you notice about the YES examples?" discovery MCQ (the category is now stated up front in Step 1).
- **`meet-pippy-step.tsx`** — add the **required up-front goal line** ("Pippy is learning to recognize CATS / OCEAN ANIMALS / NIGHT ANIMALS"); reframe Pippy's copy from "I keep making mistakes" to "watch me try."
- **`inspect-fix-step.tsx`** — keep relabel/remove/undo; **add the "Why did Pippy guess that?"** tool (uses `getNearestNeighbors`); remove the warp visual; swap renderer.
- **`level-complete.tsx` / `session-summary-step.tsx`** — update copy to the visibility-ramp takeaways.
- **`app/lessons/chapter-3/page.tsx`** + **`lib/context/pippy-activity-context.tsx`** — update the step↔section mapping and `STEP_SEQUENCE` to the new order; rename the working field `workingNest` → `workingSet` (animals) if desired for clarity.

### D. Assets
- Generate the 25 remaining animal sprites per `0003-asset-manifest.md` into `public/images/pippy/animals/`. (`lion.png`, `dolphin.png` already done.)

---

## Current State Assessment

- The app is Next.js (App Router) with Activities 1 (Zhorai) & 2 (Mori) shipped, and **Activity 3 already built in v1**. The chapter-2 scroll-snap page pattern, the per-activity context pattern, the TTS hooks, `lib/utils/activity-tracking.ts` (unlock/completion), and `components/activities/shared/` conventions are all in place and reused.
- **What's reused as-is:** the page/step shell, `pippy-character.tsx`, `confidence-meter.tsx`, `before-after.tsx`, `training-timeline.tsx`, the context's relabel/remove/undo/recompute plumbing, the unlock gate.
- **What's replaced:** the subject matter (creatures → animals), the prediction model (feature-vote → nearest-neighbor), the level content, the renderer inside Pippy (`CreatureRenderer` → `AnimalCard`), and the **step order** (training-first → mistake-first). The warp visual is dropped.
- **Mori is untouched** — `types/mori-activity.ts` and `components/activities/mori/creature-renderer.tsx` stay as Activity 2's system.

## Relevant Files

- `lib/data/animals.ts` — **New.** Shared animal library + `Animal` type/metadata (from asset manifest).
- `types/pippy-activity.ts` — **Modify.** Animal-based `TrainingExample`/`PippyLevel`; reordered/renamed `PippyStep`.
- `lib/data/pippy-prediction.ts` — **Rewrite.** k=1 nearest-neighbor + `getNearestNeighbors`; drop feature-vote/influence.
- `lib/data/pippy-prediction.test.ts` — **Rewrite.** Tests for nearest-neighbor verdict/confidence/neighbors.
- `lib/data/pippy-levels.ts` — **Rewrite.** L1 cats / L2 ocean / L3 nocturnal; one bad egg each; hook `testAnimals`; `checkBatch`; `expectedFix`; takeaways; helpers (`getLevelByIndex`, `computeAccuracyOnCheckBatch`, `applyFix`).
- `lib/data/pippy-levels.test.ts` — **Rewrite.** Validators: clean → 100%, bad egg → hook animals wrong, expectedFix → 100%, not fixable by an unrelated edit.
- `lib/context/pippy-activity-context.tsx` — **Modify.** New `STEP_SEQUENCE` order; animal-based working set; keep relabel/remove/undo/runCheckBatch/advanceLevel.
- `app/lessons/chapter-3/page.tsx` — **Modify.** Step↔section mapping to the mistake-first order.
- `components/activities/pippy/animal-card.tsx` — **New.** Renders an `Animal` sprite + name (+ optional YES/NO stamp).
- `components/activities/pippy/quiz-cards.tsx` — **New.** Testing visual ("?" → Pippy's guess, ✓/✗).
- `components/activities/pippy/conveyor-belt.tsx` — **Modify.** Training-only; labels pre-attached; use `AnimalCard`.
- `components/activities/pippy/meet-pippy-step.tsx` — **Modify.** Required up-front category line; "watch me try" framing.
- `components/activities/pippy/observe-mistake-step.tsx` — **Modify.** Becomes Step 2 (hook); uses `quiz-cards`; category contrast.
- `components/activities/pippy/investigate-training-step.tsx` — **New (rename of `how-pippy-learned-step.tsx`).** Step 3; investigation framing; belt; no discovery MCQ.
- `components/activities/pippy/how-pippy-learned-step.tsx` — **Delete** after renaming.
- `components/activities/pippy/inspect-fix-step.tsx` — **Modify.** Step 4; add "Why did Pippy guess that?"; remove warp; use `AnimalCard`.
- `components/activities/pippy/check-batch-step.tsx` — **Modify.** Step 5; use `quiz-cards`; `AnimalCard`.
- `components/activities/pippy/level-complete.tsx` — **Modify.** Before/after + visibility-ramp takeaway; `AnimalCard`.
- `components/activities/pippy/session-summary-step.tsx` — **Modify.** Full-arc recap copy.
- `components/activities/pippy/before-after.tsx` / `training-timeline.tsx` — **Modify.** Swap `CreatureRenderer` → `AnimalCard`.
- `components/activities/pippy/pattern-warp.tsx` — **Delete** (removed from flow).
- `components/activities/pippy/example-card.tsx` — **Delete/replace** by `animal-card.tsx`.
- `public/images/pippy/animals/*.png` — **New.** 27 sprites (2 done; 25 to generate per manifest).
- `tests/e2e/pippy-chapter3.spec.ts` — **New/Update.** Mistake-first happy path per level + unlock gating.

### Notes

- Run unit tests with `npx jest [path]`; e2e with `npx playwright test tests/e2e/pippy-chapter3.spec.ts`.
- **Validators are the source of truth** for level content. If a level fails (clean→100% / bad-egg→hook-wrong / fixed→100%), adjust membership or add a well-known animal to `animals.ts`; do not weaken the model.
- Keep **train vs test visually distinct** (belt vs quiz cards) — it's a PRD requirement, not polish.
- The model is transparent (nearest-neighbor); every on-screen effect (verdict, confidence, "why") must come from that one computation.

## Tasks

- [x] 1.0 Swap the data model to animals (shared library + types) and rewrite the transparent prediction model
  - [x] 1.1 Create `lib/data/animals.ts` with the `Animal` type and the 27-animal library + metadata from `0003-asset-manifest.md` (attributes: group, habitat, diet, activity, body, size, image path).
  - [x] 1.2 Update `types/pippy-activity.ts`: import `Animal`; change `TrainingExample.creature` → `animal`; extend `PippyLevel` with `targetCategoryLabel`, `ruleAttribute`, `ruleValue`, `testAnimals`, `takeaway`; make `checkBatch: Animal[]`; reorder/rename `PippyStep` to the mistake-first sequence (`meet-pippy`, `observe-mistake`, `investigate-training`, `inspect-fix`, `check-batch`, `level-complete`, `session-summary`).
  - [x] 1.3 Rewrite `lib/data/pippy-prediction.ts` as k=1 nearest-neighbor over `{group, habitat, diet, activity, body, size}` with deterministic tie-break; return `{ verdict, confidence, nearestNeighborIds }`; add `getNearestNeighbors(animal, set, k)`; remove feature-vote/`computeNestFeatureBias`.
  - [x] 1.4 Update `lib/context/pippy-activity-context.tsx`: new `STEP_SEQUENCE` order; animal-based working set; keep relabel/remove/undo/runCheckBatch/advanceLevel/recompute.
  - [x] 1.5 Rewrite `lib/data/pippy-prediction.test.ts` for the nearest-neighbor classifier (verdict, confidence, nearest neighbors). *(Done in this milestone.)*

- [x] 2.0 Author the three animal levels (species → habitat → nocturnal) with one mislabel each + validators
  - [x] 2.1 Author **L1 — cats (species)** in `lib/data/pippy-levels.ts`: training YES/NO from the library, **bad egg = leopard→NO**, `testAnimals` = tiger & house-cat (nearest to leopard), `checkBatch`, `expectedFix: { relabel: ['l1-leopard'] }`, takeaway ("not broken — learned a wrong example").
  - [x] 2.2 Author **L2 — ocean (habitat)**: **bad egg = seal→NO**, `testAnimals` = sea-lion, `checkBatch` (include penguin as a NO trap), `expectedFix`, takeaway ("provisional — fixing data updates it").
  - [x] 2.3 Author **L3 — nocturnal (property)**: training YES = raccoon/hedgehog/moth, NO = squirrel/parrot/deer/butterfly, **bad egg = owl→NO**, `testAnimals` = bat (nearest to owl; `bat.size=medium` makes owl its unique nearest), `checkBatch`, `expectedFix`, takeaway ("only as good as its data").
  - [x] 2.4 Implement helpers `getLevelByIndex`, `computeAccuracyOnCheckBatch(set, level)`, `applyFix(set, fix)`.
  - [x] 2.5 Write `lib/data/pippy-levels.test.ts` validators per level: clean set → 100% on check batch; with bad egg → the `testAnimals`/hook are mispredicted; after `expectedFix` → 100%; an unrelated edit does NOT fix it. *(Done in this milestone — all 25 assertions green.)*

- [x] 3.0 Generate the animal sprite assets
  - [x] 3.1 Generated all 27 sprites into `public/images/pippy/animals/<id>.png` (all 27 ids from `animals.ts` have files).
  - [x] 3.2 Spot-checked for style consistency. Every `id` referenced by `animals.ts` has a file.

- [x] 4.0 Build the animal rendering + train/test visual split
  - [x] 4.1 Create `components/activities/pippy/animal-card.tsx` (image + name + optional YES/NO stamp); replaces `example-card.tsx`.
  - [x] 4.2 Update `conveyor-belt.tsx` to the TRAINING-only treatment (labels pre-attached, not "Pippy deciding") using `AnimalCard`.
  - [x] 4.3 Create `components/activities/pippy/quiz-cards.tsx` for TESTING ("?" → Pippy's guess, ✓/✗ vs the true category); visually distinct from the belt.
  - [x] 4.4 `before-after.tsx` and `training-timeline.tsx` use `AnimalDisplay`/`AnimalCard`. `pattern-warp.tsx` and `example-card.tsx` already deleted. `how-pippy-learned-step.tsx` deleted in this milestone (confirmed no remaining imports).

- [x] 5.0 Re-sequence the flow to mistake-first and wire the steps
  - [x] 5.1 `meet-pippy-step.tsx`: up-front category line added; "watch me try" framing.
  - [x] 5.2 `observe-mistake-step.tsx`: Step 2 (the hook); uses `quiz-cards`; explicit category contrast; CTA "See what Pippy learned from".
  - [x] 5.3 `investigate-training-step.tsx` (renamed from `how-pippy-learned-step.tsx`): Step 3; investigation framing; training belt; no discovery MCQ; CTA "Find the bad egg".
  - [x] 5.4 `inspect-fix-step.tsx` (Step 4): relabel/remove/undo on `AnimalCard`s; "Why did Pippy guess that?" panel uses `getNearestNeighbors`; progressive hints; warp removed.
  - [x] 5.5 `check-batch-step.tsx` (Step 5): re-test with `quiz-cards`; pass → level complete; fail → back to Step 4.
  - [x] 5.6 `level-complete.tsx`: before/after of hook animals + confidence rise + per-level takeaway; celebration.
  - [x] 5.7 `session-summary-step.tsx`: full-arc recap copy.
  - [x] 5.8 `app/lessons/how-machines-update-understanding/page.tsx` updated to mistake-first step↔section mapping with 6 sections. *(Route is `how-machines-update-understanding`, not `chapter-3`.)*

- [ ] 6.0 Integrate, polish, and QA
  - [x] 6.1 Unlock gate verified: Chapter 3 (Pippy) gates on `isActivityCompleted('find-the-secret-rule')` (Mori); `markActivityAsCompleted('update-understanding-pippy')` is called in the context on last level.
  - [x] 6.2 Responsive polish (iPad/iPhone): quiz cards + training gallery scroll/paginate; tap targets ≥44×44pt; belt vs quiz cards clearly distinct on small screens. *(Fixed page header overflow that hid the Next/close nav buttons off-screen on mobile (`app/lessons/how-machines-update-understanding/page.tsx`); conveyor belt now stacks belt/piles vertically below `sm:`; responsive `p-4 sm:p-8` padding and scaled headings across all step components; `min-h-[44px]`/`min-w-[44px]` touch targets on header nav, filter pills, Undo, quiz-card reveal button, and animal-card modal buttons; `aria-label`s added to header Previous/Next so they stay accessible when their text is hidden on small screens. Verified end-to-end at 375px (full L1 happy path, no horizontal overflow, no console errors) and regression-checked at 1280px.)*
  - [ ] 6.3 Copy pass: the up-front category line, the mistake-contrast copy, the "Why, Pippy?" text, and the three takeaways — all kid-legible and tied to real AI.
  - [ ] 6.4 Update/author `tests/e2e/pippy-chapter3.spec.ts` for the mistake-first happy path per level (see mistake → investigate → fix bad egg → re-test passes) + unlock gating; run the QA-agent routine and fix issues.
