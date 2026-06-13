# PRD: How Machines Update Understanding with Pippy ("Find the Bad Egg")

> **Version 2.0 — Animal redesign + mistake-first flow.** This supersedes v1 (which used the abstract Mori feature-creatures and showed Pippy's training set first). v2 changes: (1) examples are **real animals** in a flat-cartoon style, (2) the three levels classify by **species → habitat → property (nocturnal)** — a deliberate *visibility ramp*, (3) the flow is **mistake-first** (the learner sees Pippy guess wrong *before* seeing its training data), and (4) the prediction model is a **transparent nearest-neighbor** classifier over animal attributes. See the companion **task list** (`tasks-0003-prd-updating-understanding-activity.md`) for the implementation diff against the existing code, and the **asset manifest** (`0003-asset-manifest.md`) for the animal sprite list and art-style spec.

## Introduction / Overview

This is the **third** step-by-step interactive activity in the AI literacy platform for kids ages 8–10. Its title is **"How machines update understanding with Pippy."** It teaches the idea that **an AI's understanding is provisional**: it isn't programmed once and frozen — it keeps adjusting as its data changes. This is also where the platform's running theme — *an AI is only as good as its data* — gets its strongest treatment: **a wrong label leads to wrong learning.**

The activity stars **Pippy**, a soft, round, peachy-pink fuzzy creature who is **Mori's friend** from Activity 2. Pippy is an animal-sorting buddy who learned to recognize a category of animals (e.g., cats) by studying a set of **labeled example animals**. The problem: Pippy keeps making mistakes. Somewhere in its examples is a **bad egg** — a single **mislabeled** animal — and the child must find it, **relabel or remove it**, and watch Pippy's understanding update.

The big shift in v2 is **mistake-first**: instead of touring Pippy's training data up front, the child **watches Pippy guess wrong first** (the hook), wonders *"why did Pippy get these wrong?"*, and is then motivated to **investigate the training data** to find the cause.

In this activity, children:

- Hear, up front, **what Pippy is trying to learn** ("Pippy is learning to recognize CATS"). This is required so the mistake is legible.
- **Watch Pippy take a test** — it guesses on brand-new animals and gets some **clearly wrong** (the hook).
- **Investigate** by opening the animals Pippy **learned from** (its training set).
- **Find the bad egg** — the one mislabeled animal — and **relabel or remove** it.
- **Re-test** and watch Pippy improve → a per-level takeaway about why this happened.

### How this builds on Activities 1 & 2 (conceptual continuity)

The three activities form a deliberate arc about the same underlying truth — *AI is only as good as its data*:

| Activity | Character | Core idea the child internalizes |
| --- | --- | --- |
| 1 | Zhorai | AI **learns from the examples you give it**. |
| 2 | Mori | AI **recognizes things by finding patterns in features** across examples — and (Level 4 capstone) *a pattern is only as good as the examples it saw*. |
| **3** | **Pippy (Mori's friend)** | **An AI's understanding is provisional — correcting its data changes what it knows; a wrong label produces wrong learning.** |

Activity 2 ended on the "proxy" reveal (Mori latched onto *green* because every spotted example it saw was also green) and explicitly teased Module 3's data-quality material. **Activity 3 is the direct payoff of that tease:** the child becomes a **data detective** who can open the box, see the flawed example, and *fix the understanding by fixing the data.*

### Why animals (and why this fixes a v1 problem)

In v1 the examples were abstract feature-creatures, so a mislabeled card was only "wrong" relative to a hidden rule the child couldn't perceive. With **real animals**, wrongness becomes self-evident: a cat labeled "not a cat" is obviously wrong. The three levels then form a **visibility ramp** — the rule gets progressively *less visible*, so spotting the mislabel requires deeper reasoning:

- **Level 1 (species):** the category is **visible** (you can see it's a cat). Tutorial.
- **Level 2 (habitat):** the category is **semi-visible** (you reason about where it lives, not what it looks like).
- **Level 3 (property — nocturnal):** the category is **invisible** in the picture (you must *know* the animal). This is the climax of "AI relies on its labels."

### AI literacy gaps this addresses

- **Understanding is provisional, not frozen:** correcting Pippy's data changes what it "knows."
- **The data is the cause, not a bug:** a misbehaving model usually learned *exactly* what its (flawed) data taught it.
- **Labels matter most when the truth is invisible:** for properties you can't see (nocturnal/diurnal), the AI depends *entirely* on its labels being right.
- **Active repair:** children fix understanding by inspecting and correcting data — making "garbage in, garbage out" concrete and reversible.

**Prerequisite:** Unlocks after completing **Activity 2 (Find the Secret Rule with Mori)**.

---

## Goals

- Teach children ages 8–10 that **an AI's understanding is provisional** — correcting its data changes what it "knows."
- Replace the "the AI is broken" mental model with **"it learned exactly what it was taught; the data was the problem."**
- Make the **mistake the hook**: the child should *want* to investigate because they saw Pippy fail first.
- Make data repair **visible and causal**: every fix produces an immediate, legible change in Pippy's guesses.
- Use the **visibility ramp** (species → habitat → property) to escalate *how hard the bad egg is to spot* while keeping a single, consistent mechanic (find → relabel/remove one mislabeled animal).
- Keep the loop **investigative and forgiving**: inspecting and trying fixes is never penalized; a wrong fix is instructive, not a failure.
- Each level is solvable in roughly 4–7 minutes; total time is flexible.
- Reinforce the concept after each level with a plain-language takeaway that ties Pippy back to how real AI behaves.

---

## Core Design: the mistake-first loop ("Data Detective")

The child moves through five beats per level. **The mistake comes before the training data** — this is the defining change in v2.

### 1. The goal (Meet Pippy + the target category)

The child is told, up front, **what Pippy is learning to recognize** — e.g., *"Pippy is learning to recognize CATS."* This single line is **required**: it is the yardstick that makes Pippy's later mistakes legible (and it is essential for Levels 2 and 3, where the child cannot perceive the error without knowing the category). This subsumes v1's "carry the rule forward" idea.

### 2. Test (the hook) — Pippy guesses on new animals

Pippy takes a short "quiz": it guesses **YES/NO on brand-new animals it has never seen**, and gets **some clearly wrong** (e.g., calls an obvious cat "NO"). The child reacts: *"Why did Pippy get these wrong?"* This is the motivating hook.

- **Visual language — TESTING:** new animals shown as **quiz cards**; each starts as a "?" that flips to **Pippy's guess**, stamped ✓/✗ against the true category.

### 3. Investigate — open what Pippy learned from

Framed as *finding the cause*, not a passive tour: *"Let's look at what Pippy learned from."* The child opens Pippy's **training set** — the labeled example animals.

- **Visual language — TRAINING:** examples ride in on a **conveyor belt** with their labels **already attached** (the labels were *given*, not decided by Pippy) — visually distinct from the quiz cards so the child can tell *learning-from-given-answers* apart from *guessing-on-new-animals*.

### 4. Find & fix the bad egg

Among the training examples is **one mislabeled animal** (the bad egg). The child can:

- **Relabel** an example (flip YES ↔ NO), or
- **Remove** it.

A **"Why did Pippy guess that?"** tool helps without trivializing: tapping a missed quiz animal reveals the **most-similar training animal(s) Pippy leaned on** — the bad egg hides among them, but the child must still spot which label is wrong. Fixing is **free and reversible** (undo). Wrong guesses are never punished.

### 5. Re-test → takeaway

Pippy re-takes the quiz; with the data fixed, it now guesses correctly. A short **per-level takeaway** lands the concept (see Level Progression). A **confidence/accuracy meter** rising from low → high reinforces the change.

---

## Subject matter: a shared animal library

Examples are **real animals** rendered as flat-cartoon sprites (see `0003-asset-manifest.md`). One **shared library** of animals powers all three levels; each animal carries metadata, and each level picks a different attribute to be "the rule." Animals are reused across levels (a lion is a YES-cat in L1 and a NO/irrelevant in L2), so each sprite is generated once.

```ts
interface Animal {
  id: string;            // "lion"
  name: string;          // "Lion"
  group: string;         // species family: 'cat' | 'dog' | 'bird' | 'marine-mammal' | 'insect' | ...
  habitat: string;       // 'savanna' | 'forest' | 'jungle' | 'ocean' | 'home' | 'cave' | 'meadow' | 'polar'
  diet: 'carnivore' | 'herbivore' | 'omnivore';
  activity: 'nocturnal' | 'diurnal';
  body: 'legs' | 'wings' | 'fins' | 'flippers';
  size: 'tiny' | 'small' | 'medium' | 'large';
  image: string;         // "/images/pippy/animals/lion.png"
}
```

**No attribute tags are shown on the cards.** Per the confirmed design, the child relies on general knowledge of the animals (and the up-front category statement). The attributes above are the model's internal comparison features, not printed UI labels. To keep this fair, levels use **well-known animals** only (especially L3).

---

## Prediction model — transparent nearest-neighbor

Pippy's "understanding" is a **deterministic, transparent k-nearest-neighbor** classifier (no real/opaque ML):

- To classify a **new** animal, Pippy finds the **most similar animal it was trained on** (k = 1) and copies its label. Similarity = **count of matching attributes** among `{group, habitat, diet, activity, body, size}`. Ties are broken deterministically (documented in code; e.g., earliest `addedAtStep`).
- This is why a **single mislabeled example matters**: it corrupts predictions for the new animals most similar to it. (A vote/majority model would absorb one bad label and wouldn't visibly break — nearest-neighbor is chosen precisely so the bad egg has a legible, local effect.)
- It powers the **"Why did Pippy guess that?"** explanation directly: the nearest neighbor *is* the reason Pippy gave that answer.
- **Confidence** is derived from the neighbor margin (how decisively the nearest neighbor(s) agree).

**Content invariant (enforced by validators):** for each level, with the **clean** training set Pippy scores **100%** on the check batch; with the **authored bad egg** present, the designated **hook animals are mispredicted**; after the **expected fix**, Pippy returns to **100%**. Each level's hook/test animals are authored to be the **closest match to that level's bad egg**, so fixing the egg demonstrably flips them.

---

## Level Progression — the visibility ramp (one mislabel each)

All three levels use the **same mechanic**: exactly one **mislabeled** animal to find and fix. What escalates is **how visible the category is**, and therefore how hard the bad egg is to spot. (The "more data isn't always better" / biased-cluster idea from v1 is deferred to a possible **future Level 4** — see Open Questions.)

### Level 1 — Recognize CATS (species; visible) — tutorial

- **Rule:** YES = the cat family.
- **Training (draft):** YES = lion, cheetah · NO = dog, elephant, owl, dolphin, zebra · **bad egg = leopard labeled NO** (a leopard is obviously a cat).
- **Hook test animals:** new cats (e.g., **tiger**, **house-cat**) whose nearest trained neighbor is the mislabeled leopard → Pippy wrongly calls them "NO."
- **Takeaway:** *"Pippy isn't broken — it learned a wrong example. You could see it's a cat, but Pippy was told it wasn't. Fix the data, fix the understanding."*

### Level 2 — Recognize OCEAN animals (habitat; semi-visible)

- **Rule:** YES = lives in the ocean.
- **Training (draft):** YES = dolphin, octopus, swordfish · NO = lion, owl, parrot, elephant · **bad egg = seal labeled NO** (seals live in the ocean).
- **Hook test animals:** new ocean animals (e.g., **sea-lion**, **shark**) nearest to the mislabeled seal → wrongly "NO."
- **Teaches:** the category isn't "looks alike" (a mammal, a mollusk, and a fish are all YES) — it's a shared property (habitat). The mislabel requires reasoning about where the animal lives, not what it looks like.
- **Takeaway:** *"Fixing one wrong example changed what Pippy understands. An AI is never 'finished' — when the data changes, its understanding changes too."*

### Level 3 — Recognize NIGHT animals (property: nocturnal; invisible) — climax

- **Rule:** YES = nocturnal (a "night animal").
- **Curated, well-known animals only** (no tags, so the child must *know* them): YES-eligible = owl, bat, raccoon, hedgehog, moth · NO-eligible = butterfly, squirrel, parrot, deer.
- **Training (draft):** YES = raccoon, hedgehog, moth · NO = squirrel, parrot, deer, butterfly · **bad egg = owl labeled NO** (owls are unmistakably night birds).
- **Hook test animal:** **bat** (a clearly nocturnal animal) whose nearest trained neighbor is the mislabeled owl → wrongly "NO."
- **Teaches:** you **can't see** whether an animal is awake at night, so Pippy depends *entirely* on its labels being right. The "Why, Pippy?" tool surfaces the mislabeled owl; the child knows owls are night animals and fixes it.
- **Takeaway:** *"Pippy can't see if an animal sleeps at night — it only knows what its labels say. One wrong label taught it wrong. An AI is only as good as its data."*

---

## Activity Sequence (mistake-first)

> **Step order changed in v2.** The training walkthrough is **no longer the first substantive beat**; the observed mistake comes first. The former "How Pippy learned" step is **reframed and renamed** to an *investigation* step that follows the mistake.

### Step 1 — Meet Pippy + the goal

- **Heading:** "Meet Pippy!"
- **Character:** Pippy (peachy-pink fuzzy creature, `public/images/pippy.png`), idle animation, TTS voice distinct from Zhorai & Mori.
- **Required up-front goal line:** **"Pippy is learning to recognize CATS."** (Per level: CATS / OCEAN ANIMALS / NIGHT ANIMALS.)
- **Pippy's speech:** "Hi! I've been learning to spot cats. Watch me try — I hope I get them right!"
- **Callback:** "You helped Mori find its pattern — now let's see what Pippy learned."
- **Button:** "Watch Pippy try" → Step 2.

### Step 2 — Test (the hook)

- **Heading:** "Watch Pippy take a quiz"
- Pippy guesses YES/NO on **new animals it was never trained on**; **some are clearly wrong** (e.g., an obvious cat → "NO").
- **Visual:** **quiz cards** (a "?" flips to Pippy's guess), each marked ✓/✗ against the true category. The contrast is explicit: *"This is clearly a CAT — but Pippy guessed NO."*
- **Pippy's speech (on miss):** "Wait… that doesn't feel right. Why did I get those wrong?"
- **Prompt:** *"Is Pippy broken — or did it learn something wrong? Let's look at what Pippy learned from."*
- **Button:** "See what Pippy learned from" → Step 3.

### Step 3 — Investigate (open the training set)

- **Heading:** "What Pippy Learned From"
- **Visual — training belt:** the example animals ride in with their **labels already attached** (labels were *given*). Framing: *"These are the animals Pippy studied, each already marked YES or NO. The mistake is hiding in here."*
- **Explanation:** "Pippy doesn't really 'know' what a cat is — it only has these labeled examples. If one is wrong, Pippy learns it wrong."
- **Button:** "Find the bad egg" → Step 4.
- *(No "what do you notice about the YES examples?" discovery quiz — the category was stated in Step 1.)*

### Step 4 — Find & fix the bad egg

- **Heading:** "Find the bad egg"
- **Layout:** the training examples as **animal cards** stamped YES/NO; Pippy to the side; a **confidence/accuracy meter**; (secondary) a **training timeline**.
- **"Why did Pippy guess that?"** tool: tap a missed quiz animal → reveal the **most-similar training animal(s)** Pippy copied from (the bad egg hides among them; not flagged).
- **Fix actions per card:** **Relabel** (flip YES↔NO) · **Remove** · **Undo** (free, reversible).
- **Live update:** each edit immediately recomputes Pippy's guesses + the meter (within ~1s).
- **Buttons:** "Test Pippy again" / "I think it's fixed!" → Step 5. **Hint** appears only after multiple failed checks (points at *where to look*, never names the animal).

### Step 5 — Re-test & takeaway

- **Heading:** "Let's see if Pippy gets it now"
- Pippy re-takes the quiz (same **quiz-card** visual as Step 2) on a **check batch (~6–8 animals)** including the previously-missed ones.
- **All correct →** Step 6a (level complete). **Still wrong →** Step 6b (return to training).

### Step 6a — Level complete

- **Heading:** "You fixed Pippy's understanding!"
- **Celebration:** confetti + Pippy happy animation.
- **"What changed" panel:** before/after of Pippy's guesses on the hook animals; the confidence meter rising low → high.
- **Per-level takeaway:** the visibility-ramp correction copy (see Level Progression).
- **Buttons:** "Next level!" / "I'm done for now."

### Step 6b — Not fixed yet

- **Pippy:** gentle, encouraging — "Closer! I still get these ones wrong."
- Show remaining misses; *"Use 'Why did Pippy guess that?' on the ones it still gets wrong."* → return to Step 4.

### Step 7 — Session summary

- **Heading:** "Great work, data detective!"
- **Recap (full arc):** "Pippy's understanding isn't frozen — fixing its data changed what it knows. And for things you can't even see, like whether an animal comes out at night, the AI depends completely on its labels. An AI is only as good as its data."
- **Buttons:** "Keep playing" / "Back to activities."

---

## Functional Requirements

### 1. Activity integration & progression

1.1. Activity 3 is **locked until Activity 2 is complete**; locked state shows a lock icon and "Complete How machines use patterns with Mori to unlock."
1.2. Completion is tracked via the existing `lib/utils/activity-tracking.ts` (`markActivityAsCompleted` / `isActivityCompleted`).
1.3. Components live in `components/activities/pippy/`; shared pieces in `components/activities/shared/`.
1.4. State is activity-specific (`PippyActivityContext`), consistent with the per-activity context pattern.
1.5. Levels unlock sequentially; solved levels are replayable.

### 2. Animals, character & visuals

2.1. Pippy with animated expressions (happy, thinking, confused, excited), distinct from Zhorai & Mori.
2.2. A shared **animal library** (`lib/data/animals.ts`) with metadata and sprite paths; an **`AnimalCard`** renders an animal image + name (+ YES/NO stamp where relevant).
2.3. **Two distinct visual modes:** **training belt** (labels pre-attached) vs **quiz cards** (Pippy guesses on new animals). They must be visually unmistakable from each other.
2.4. A **confidence/accuracy meter** that updates live (must-have).
2.5. A **before/after** comparison of Pippy's guesses on the hook animals (must-have for the payoff).
2.6. A **training timeline** (secondary) showing example order via `addedAtStep`.
2.7. **No attribute tags** on cards; rely on the up-front category + well-known animals.

### 3. Investigate & fix system

3.1. Tap any training card to enlarge.
3.2. **Relabel** (flip YES↔NO) and **Remove**, both **reversible** via undo; never penalized.
3.3. A **"Why did Pippy guess that?"** tool reveals the nearest-neighbor training example(s) for a selected missed quiz animal (the bad egg is among them, unflagged).
3.4. Every edit recomputes Pippy's guesses + meter within ~1s.

### 4. Prediction model (transparent, not real ML)

4.1. **k = 1 nearest-neighbor** over animal attributes `{group, habitat, diet, activity, body, size}`, deterministic tie-break; returns `{ verdict, confidence, nearestNeighborIds }`.
4.2. Every on-screen effect (verdict, confidence, "why") derives from this one computation.
4.3. The authored bad egg, when fixed, **provably** restores 100% on the check batch (validator-enforced).

### 5. Content & level system (the visibility ramp)

5.1. Three levels: **species (cats)** → **habitat (ocean)** → **property (nocturnal)**.
5.2. Each level defines: target category label; `ruleAttribute` + target value; the training set (with exactly one `isBadEgg` mislabel + `addedAtStep`); the **hook test animals**; the **check batch**; the **expectedFix**; and the takeaway copy.
5.3. Hook/test animals are authored as the **nearest neighbor of the bad egg** so fixing it flips them.
5.4. L3 uses **curated, well-known nocturnal/diurnal animals** so the mislabel is findable without tags.
5.5. The level is solvable **only** by fixing the bad egg (validator-enforced: clean→100%, bad-egg→hooks wrong, fixed→100%).

### 6. Checking & feedback

6.1. A **check batch (~6–8 animals)** validates the fix, including previously-missed cases, shown via quiz cards.
6.2. Zero misses → level complete; any miss → return to training with the misses highlighted.
6.3. Feedback is encouraging, never punitive.

### 7. Explanation & reinforcement

7.1. After each clean fix, show a **"What changed"** panel (before/after + meter rise).
7.2. Each level ends with its **visibility-ramp takeaway**.
7.3. The **session summary** restates the full arc ("only as good as its data," strongest for invisible properties).

---

## Non-Goals (out of scope)

- **No real/opaque ML.** Pippy's predictions are a transparent nearest-neighbor function of its data.
- **No attribute tags / metadata badges on cards** in v1 of this redesign (rely on known animals + the up-front category).
- **No biased-cluster / "more data isn't better" level** yet — deferred to a possible future Level 4. v2 uses a single mislabel per level.
- **No adding brand-new training animals** as the core mechanic (find → relabel/remove only).
- **No free-form drawing / custom animals** — animals come from the fixed library.
- **No multiplayer; no timed challenges; no score penalties for investigating.**
- **No natural-language explanation grading** — understanding is demonstrated by fixing the data and passing the re-test.
- **No adaptive difficulty** — the 3-level ramp is fixed and sequential.

---

## Design Considerations

### Visual language

- **Reuse Activity 1's design system & shared components:** white background, Inter (400 body / 600 headings), primary filled-black buttons + secondary outlined, purple/blue accent, `components/activities/shared/`.
- **Animal art style:** flat 2D vector cartoon — bright flat fills, simple rounded shapes, thin/no outlines, friendly faces, single centered animal on white/transparent background. See `0003-asset-manifest.md`; approved samples already in repo: `public/images/pippy/animals/lion.png`, `dolphin.png`.
- **Pippy:** `public/images/pippy.png` via `next/image`.
- **YES/NO:** reuse Activity 2's convention (YES = green, NO = orange/red).
- **Train vs test must look different:** belt (training, labels pre-attached) vs quiz cards (testing, "?" → guess). This distinction is a requirement, not decoration.
- **Bad egg motif:** the mislabeled animal is the "bad egg" hiding in what Pippy studied.

### Key visuals

- **Confidence/accuracy meter (must-have):** animated; low while the bad egg is present, climbs after the fix.
- **Before/after (must-have):** Pippy's guesses on the hook animals, wrong → right.
- **Training timeline (secondary):** compact `addedAtStep` strip.
- *(v1's per-feature "pattern warp" is **dropped/repurposed** — see task-list change log — because the nearest-neighbor model over animals has no per-visual-feature influence to plot. The honest, legible substitute is the "Why did Pippy guess that?" nearest-neighbor reveal.)*

### Responsive design

- iPad (landscape/portrait) and iPhone (portrait); tap targets ≥44×44pt; the training gallery scrolls/paginates on small screens.

---

## Technical Considerations

### Reuse-first

- Reuse the chapter-2 page/step pattern, the TTS hooks, `activity-tracking.ts`, and `components/activities/shared/`.
- **Do not** reuse `creature-renderer.tsx` or the `Creature` model for Pippy in v2 — Pippy now renders **animals** via `AnimalCard`. (Mori/Activity 2 keeps its creature system untouched.)

### Content model (proposed)

```ts
import { Animal } from '@/lib/data/animals';

interface TrainingExample {
  id: string;
  animal: Animal;
  label: 'YES' | 'NO';   // the (possibly wrong) label Pippy was given
  addedAtStep: number;   // training timeline
  isBadEgg: boolean;     // exactly one per level in v2
}

interface PippyLevel {
  id: string;
  index: 1 | 2 | 3;
  targetCategoryLabel: string;            // "CATS" | "OCEAN ANIMALS" | "NIGHT ANIMALS"
  ruleAttribute: keyof Animal;            // 'group' | 'habitat' | 'activity'
  ruleValue: string;                      // 'cat' | 'ocean' | 'nocturnal'
  trainingSet: TrainingExample[];          // includes exactly one bad egg
  testAnimals: Animal[];                   // the hook (shown first); nearest to the bad egg
  checkBatch: Animal[];                    // re-test set
  expectedFix: { relabel?: string[]; remove?: string[] };
  takeaway: string;                        // visibility-ramp correction copy
}
```

### Prediction (`lib/data/pippy-prediction.ts`, rewritten)

- `classify(animal, trainingSet)` → `{ verdict, confidence, nearestNeighborIds }` via k=1 nearest-neighbor (attribute-match count, deterministic tie-break).
- `getNearestNeighbors(animal, trainingSet, k)` → for the "Why, Pippy?" tool.
- Authoring validators (`pippy-levels.test.ts`): clean→100%, bad-egg→hook animals wrong, expectedFix→100%, and the level is **not** solvable by an unrelated edit.

### Code organization (v2)

```
components/activities/
  shared/                 (celebration, progress)
  pippy/
    pippy-character.tsx
    animal-card.tsx                  // NEW — renders an Animal sprite (+ optional YES/NO stamp)
    conveyor-belt.tsx                // TRAINING visual only (labels pre-attached)
    quiz-cards.tsx                   // NEW/extracted — TESTING visual ("?" → Pippy's guess)
    meet-pippy-step.tsx              // + required category line
    observe-mistake-step.tsx         // STEP 2 now (the hook); uses quiz-cards
    investigate-training-step.tsx    // RENAMED from how-pippy-learned-step.tsx; STEP 3; uses belt
    inspect-fix-step.tsx             // STEP 4; + "Why did Pippy guess that?"
    check-batch-step.tsx             // STEP 5; uses quiz-cards
    level-complete.tsx               // before/after + visibility-ramp takeaway
    session-summary-step.tsx
    confidence-meter.tsx
    before-after.tsx
    training-timeline.tsx
lib/
  data/
    animals.ts                       // NEW — shared animal library + metadata
    pippy-levels.ts                  // REWRITTEN — 3 animal levels
    pippy-prediction.ts              // REWRITTEN — nearest-neighbor over animals
  context/
    pippy-activity-context.tsx       // step reorder + animal-based working set
types/
  pippy-activity.ts                  // Animal-based TrainingExample/PippyLevel; reordered PippyStep
public/images/pippy/animals/*.png    // NEW — animal sprites (see asset manifest)
```

---

## Success Metrics

- **Misconception shift:** after the activity, children can explain that (a) a misbehaving AI usually **learned its (bad) data**, not "broke," (b) fixing the data **changes** what it knows, and (c) for things you **can't see**, the AI depends entirely on its labels.
- **Hook works:** children proceed to investigate after seeing the mistake (engagement at Step 2→3 ≥ high).
- **Repair happens:** ≥60% of children who start a level fix the bad egg and pass the re-test.
- **Progression:** ≥50% reach Level 3 (the invisible-property climax).
- **Fun:** ≥4.0/5.0 if feedback is collected.

---

## Open Questions

1. **Future Level 4 (biased cluster):** re-introduce "more data isn't always better" as a 4th level once the single-mislabel ramp is validated?
2. **L3 fallback if too hard:** if playtesting shows nocturnal-without-tags is too hard, add a subtle *baked-in art cue* (sleepy/half-closed eyes, moonlit palette) rather than an explicit icon — or swap L3 to carnivore/herbivore. (Confirmed default: curated well-known animals, no tags.)
3. **Tie-break rule:** confirm the deterministic nearest-neighbor tie-break (proposed: earliest `addedAtStep`; alternative: majority of tied neighbors).
4. **Activity-2 cameo:** should Pippy appear briefly at the end of Activity 2 for continuity?
5. **Confidence semantics:** "how sure Pippy is" (neighbor margin) vs "how accurate on the check set" — pick the clearer one for the age group.

---

**PRD Version:** 2.0 (Animal redesign + mistake-first)
**Updated:** June 7, 2026
**Status:** Draft — Pending Review
