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

- [ ] 1.0 Swap the data model to animals (shared library + types) and rewrite the transparent prediction model
  - [ ] 1.1 Create `lib/data/animals.ts` with the `Animal` type and the 27-animal library + metadata from `0003-asset-manifest.md` (attributes: group, habitat, diet, activity, body, size, image path).
  - [ ] 1.2 Update `types/pippy-activity.ts`: import `Animal`; change `TrainingExample.creature` → `animal`; extend `PippyLevel` with `targetCategoryLabel`, `ruleAttribute`, `ruleValue`, `testAnimals`, `takeaway`; make `checkBatch: Animal[]`; reorder/rename `PippyStep` to the mistake-first sequence (`meet-pippy`, `observe-mistake`, `investigate-training`, `inspect-fix`, `check-batch`, `level-complete`, `session-summary`).
  - [ ] 1.3 Rewrite `lib/data/pippy-prediction.ts` as k=1 nearest-neighbor over `{group, habitat, diet, activity, body, size}` with deterministic tie-break; return `{ verdict, confidence, nearestNeighborIds }`; add `getNearestNeighbors(animal, set, k)`; remove feature-vote/`computeNestFeatureBias`.
  - [ ] 1.4 Update `lib/context/pippy-activity-context.tsx`: new `STEP_SEQUENCE` order; animal-based working set; keep relabel/remove/undo/runCheckBatch/advanceLevel/recompute.
  - [ ] 1.5 Rewrite `lib/data/pippy-prediction.test.ts` for the nearest-neighbor classifier (verdict, confidence, nearest neighbors).

- [ ] 2.0 Author the three animal levels (species → habitat → nocturnal) with one mislabel each + validators
  - [ ] 2.1 Author **L1 — cats (species)** in `lib/data/pippy-levels.ts`: training YES/NO from the library, **bad egg = leopard→NO**, `testAnimals` = tiger & house-cat (nearest to leopard), `checkBatch`, `expectedFix: { relabel: ['<leopard id>'] }`, takeaway ("not broken — learned a wrong example").
  - [ ] 2.2 Author **L2 — ocean (habitat)**: **bad egg = seal→NO**, `testAnimals` = sea-lion (& shark), `checkBatch` (include penguin as a NO trap), `expectedFix`, takeaway ("provisional — fixing data updates it").
  - [ ] 2.3 Author **L3 — nocturnal (property)** with curated well-known animals: training YES = raccoon/hedgehog/moth, NO = squirrel/parrot/deer/butterfly, **bad egg = owl→NO**, `testAnimals` = bat (nearest to owl; note `bat.size=medium` makes owl its unique nearest), `checkBatch`, `expectedFix`, takeaway ("can't see the property — depends on labels; only as good as its data").
  - [ ] 2.4 Implement helpers `getLevelByIndex`, `computeAccuracyOnCheckBatch(set, level)`, `applyFix(set, fix)`.
  - [ ] 2.5 Write `lib/data/pippy-levels.test.ts` validators per level: clean set → 100% on check batch; with bad egg → the `testAnimals`/hook are mispredicted; after `expectedFix` → 100%; an unrelated edit does NOT fix it. Tune membership until green.

- [ ] 3.0 Generate the animal sprite assets
  - [ ] 3.1 Generate the 25 remaining sprites per `0003-asset-manifest.md` (style template + reference samples) into `public/images/pippy/animals/<id>.png`; keep framing/scale consistent with `lion.png`/`dolphin.png`.
  - [ ] 3.2 Spot-check the set for style consistency; regenerate any outliers. Confirm every `id` referenced by `animals.ts` has a file.

- [ ] 4.0 Build the animal rendering + train/test visual split
  - [ ] 4.1 Create `components/activities/pippy/animal-card.tsx` (image + name + optional YES/NO stamp; tap-to-enlarge); replace `example-card.tsx`.
  - [ ] 4.2 Update `conveyor-belt.tsx` to the TRAINING-only treatment (labels pre-attached, not "Pippy deciding") using `AnimalCard`.
  - [ ] 4.3 Create `components/activities/pippy/quiz-cards.tsx` for TESTING ("?" → Pippy's guess, ✓/✗ vs the true category); make it visually distinct from the belt.
  - [ ] 4.4 Swap `CreatureRenderer` → `AnimalCard` in `before-after.tsx` and `training-timeline.tsx`; delete `pattern-warp.tsx` and `example-card.tsx`.

- [ ] 5.0 Re-sequence the flow to mistake-first and wire the steps
  - [ ] 5.1 `meet-pippy-step.tsx`: add the required up-front category line; "watch me try" framing.
  - [ ] 5.2 `observe-mistake-step.tsx`: move to Step 2 (the hook); render `quiz-cards`; show Pippy guessing on new animals with some clearly wrong + the explicit category contrast; CTA "See what Pippy learned from".
  - [ ] 5.3 Rename `how-pippy-learned-step.tsx` → `investigate-training-step.tsx` (Step 3): investigation framing, training belt, **remove** the discovery MCQ; CTA "Find the bad egg".
  - [ ] 5.4 `inspect-fix-step.tsx` (Step 4): relabel/remove/undo on `AnimalCard`s; add the **"Why did Pippy guess that?"** panel using `getNearestNeighbors`; confidence meter; remove the warp; progressive hint after repeated failed checks (points at where to look, never names the animal).
  - [ ] 5.5 `check-batch-step.tsx` (Step 5): re-test with `quiz-cards`; all correct → level complete; misses → back to Step 4.
  - [ ] 5.6 `level-complete.tsx`: before/after of the hook animals + confidence rise + the per-level visibility-ramp takeaway; celebration.
  - [ ] 5.7 `session-summary-step.tsx`: full-arc recap copy.
  - [ ] 5.8 Update `app/lessons/chapter-3/page.tsx`: step↔section mapping + section components to the new order.

- [ ] 6.0 Integrate, polish, and QA
  - [ ] 6.1 Verify the unlock gate (locked before Activity 2, unlocked after) and `markActivityAsCompleted` on finishing Activity 3 still work after the changes.
  - [ ] 6.2 Responsive polish (iPad/iPhone): quiz cards + training gallery scroll/paginate; tap targets ≥44×44pt; belt vs quiz cards clearly distinct on small screens.
  - [ ] 6.3 Copy pass: the up-front category line, the mistake-contrast copy, the "Why, Pippy?" text, and the three takeaways — all kid-legible and tied to real AI.
  - [ ] 6.4 Update/author `tests/e2e/pippy-chapter3.spec.ts` for the mistake-first happy path per level (see mistake → investigate → fix bad egg → re-test passes) + unlock gating; run the QA-agent routine and fix issues.
