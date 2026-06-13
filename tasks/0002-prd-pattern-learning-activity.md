## Introduction / Overview

This is the second step-by-step interactive activity in the AI literacy platform for kids ages 8–10. It teaches how AI uses patterns to recognize things, through a "Find the Secret Rule" game with **Mori** — a friendly red fuzzy monster.

Mori is a creature-sorting machine that has learned a hidden rule for which creatures it likes (**YES**) and doesn't (**NO**). The child's job is to figure out the rule — but the only reliable way to do that is to **test creatures and watch which features Mori pays attention to**, then prove they've got it by **sorting a fresh batch correctly**.

In this activity, children:

- Meet Mori and see how Mori "pays attention" to features (the visible AI concept)
- **Observe** a starter set of pre-labeled creatures (YES / NO)
- **Test** creatures freely in the Lab and watch which features Mori focuses on
- **Sort** a fresh batch into YES/NO by their current hypothesis to check it
- Discover, by the final level, that Mori's pattern is only as good as the examples it learned from

### AI literacy gaps this addresses

- **Pattern Recognition:** AI recognizes things by finding patterns in features across examples — not by being told rules or "knowing" what things are.
- **Examples underdetermine the pattern:** the same handful of examples can fit several different rules; you need varied data to tell them apart.
- **Generalization limits:** a pattern learned from narrow examples gets confidently misapplied to new cases (the capstone insight).
- **Hypothesis testing:** observe → hypothesize → test → revise.
- **Active discovery:** children discover how recognition works through play rather than being told.

**Prerequisite:** Unlocks after completing Activity 1 (Ecosystem Learning with Zhorai).

---

## Goals

- Teach children ages 8–10 that AI recognizes things by finding patterns in **features** across examples.
- Make **iteration necessary** by engineering example sets where multiple rules fit the initial data, so a single guess cannot reliably win.
- Develop hypothesis-testing skills: form a hypothesis, design a test that distinguishes competing rules, observe, revise.
- Make the AI's pattern-matching **visible** — the child watches which features Mori attends to.
- Land the fundamental payoff: **a learned pattern is only as good as the examples it came from, and doesn't generalize safely beyond them.**
- Provide a level progression where each level escalates *why* one guess isn't enough.
- Allow open-ended replay; never penalize testing.
- Explain how Mori found (or mis-found) the pattern after each level, reinforcing the concept.
- Each level is solvable in roughly 4–7 minutes; total time is flexible — effective learning matters more than a hard cap.

---

## Core Design: the Observe → Test → Sort loop

The child cycles through three phases per level.

### 1. Observe

Mori shows a small set of **pre-labeled creatures** — some YES, some NO. This is the child's starting data. Crucially, this starter set is *consistent with more than one rule* (see "Engineered ambiguity").

### 2. Test (the Lab)

The child builds or picks creatures and asks Mori to classify them. Mori answers **YES / NO** and **highlights the feature(s) it is paying attention to** (a glow/spotlight on spots, color, etc.). Testing is **free and unlimited** — it is the core learning behavior, so it is never punished. This is where the AI concept lives: the child watches Mori *attend to features*, making "recognition = finding patterns in features" concrete rather than abstract.

### 3. Sort (the Challenge)

When ready, the child requests a **fresh batch of ~8–10 creatures** and sorts them into **YES** and **NO** bins by their current hypothesis. Mori reveals the true labels and shows matches vs. mismatches.

- **Zero mismatches → level up.**
- **Any mismatch → back to the Lab**, with mismatches highlighted (instructive, not punitive).

**Why sorting instead of naming:** naming a rule is one-shot checkable and a lucky guess wins. Sorting a whole batch means a wrong hypothesis produces *multiple* visible mismatches at once. Because each challenge batch is seeded with "trap" creatures that distinguish the tempting-but-wrong rule from the true rule, the child cannot pass without having actually tested those distinguishing cases. **Iteration is required by construction.**

---

## Subject matter: invented creatures

Creatures are assembled from a small, controlled feature vocabulary so ambiguity can be engineered precisely (and so Mori stays clearly distinct from Zhorai's animals):


| Feature    | Values                      |
| ---------- | --------------------------- |
| Body shape | round / square / triangular |
| Color      | red / blue / green / yellow |
| Pattern    | spots / stripes / solid     |
| Spikes     | yes / no                    |
| Eyes       | 1 / 2 / 3                   |


This same feature vocabulary is intentionally reused in Module 5 (generation), creating a cross-module callback.

---

## Level Progression — escalating *why one guess won't do*

Each level raises the bar on why a single observation is insufficient.

### Level 1 — Single feature (tutorial)

**Rule:** "has spikes." Clean and separable, almost no trap. Teaches the observe → test → sort loop with minimal difficulty.

### Level 2 — The confound (first forced iteration)

**True rule:** **blue.** But every blue YES creature in the starter set also happens to be **round**, so the tempting hypothesis is "round." A child who jumps straight to sorting mismatches on blue-squares (Mori says YES, child sorted NO) and red-rounds (the opposite). To get it right, they **must** test a blue-square and a red-round in the Lab. This is the first time a single observation is provably not enough.

### Level 3 — The conjunction

**True rule:** **round AND spotted.** No single feature works: there are round-solid creatures (NO), square-spotted creatures (NO), and round-spotted (YES). Every single-feature hypothesis fails on part of the batch, forcing the child to discover that it's the *combination*. Heavy testing required.

### Level 4 — The proxy (capstone / generalization payoff)

**Intended rule:** **spotted** — **but** in every example Mori was ever shown, the spotted creatures also happened to be **green**. So Mori actually keys on **green**, not spots, because its narrow examples couldn't tell the two apart.

While testing, the child hits the contradiction: Mori says **YES to a green *solid* creature** (no spots at all) and **NO to a red *spotted* one.**

**The reveal:** *Mori didn't learn "spots" — it learned "green," because every spotted creature it ever saw was also green. The pattern is only as good as the examples it came from.* This also quietly teaches that Mori doesn't "understand" spots (it latched onto a correlated feature) and teases Module 3's data-quality material without stealing it.

---

## Activity Sequence

### Step 1 — Meet Mori

- **Heading:** "Meet Mori!"
- **Character:** Mori (red fuzzy monster) with a friendly wave/idle animation.
- **Intro text:** "Mori is a creature-sorting monster! Mori has a secret rule about which creatures it likes. Can you figure out the rule?"
- **Mori's speech:** "Hi, I'm Mori! Some creatures match my secret rule, and some don't. Test some out and see if you can crack it!"
- **Button:** "How Mori thinks" → Step 2.
- **Technical:** idle animation; text-to-speech with a voice distinct from Zhorai; transition animation.

### Step 2 — How Mori pays attention

*(Reframed from v1's "brain visualization." The point is now specifically: Mori looks at **features**.)*

- **Heading:** "How Mori Looks at Creatures"
- **Visualization:** show a single creature with its features individually highlightable (shape, color, pattern, spikes, eyes). As each is highlighted, Mori "looks" at it.
- **Explanation:** "Mori doesn't know what a creature *is*. It only looks at features — shape, color, pattern — and tries to find which ones matter for its rule."
- **Interactive:** child taps features to see Mori "notice" them.
- **Mori's speech:** "I look for patterns in features. Test me and watch what I pay attention to!"
- **Button:** "Start testing!" → Step 3.

### Step 3 — Observe (starter set)

- **Heading:** "Here's what Mori already knows"
- Display the pre-labeled starter creatures in **YES** and **NO** groups.
- **Mori's speech:** "These match my rule… and these don't. What's my secret?"
- **Note (design):** the starter set is engineered so multiple rules fit it (see Level Progression). Do **not** make the true rule uniquely determinable from the starter set alone.
- **Button:** "Test your own creatures!" → Step 4.

### Step 4 — Test (the Lab) — main gameplay

- **Heading:** "Test creatures to crack the rule!"
- **Layout:**
  - A **creature builder/picker** (choose feature values to assemble a creature, or pick from a tray).
  - **Mori** in the center as the classify action.
  - Running **YES** and **NO** columns of everything tested so far.
- **Mori's response per test:**
  - **YES:** happy animation; **highlights the feature(s) Mori is attending to**; "Yes! This one matches."
  - **NO:** thoughtful animation; highlights attended feature(s); "Nope, not this one."
- **Free and unlimited testing.** No counter that implies a limit; no penalty.
- **Buttons:**
  - "I'm ready to sort!" (available any time after a minimum of testing) → Step 5.
  - "Hint" (optional; appears only after multiple failed sorts — see Hints).
- **Technical:** drag-and-drop or tap-to-build; touch-friendly (≥60×60pt targets); feature-highlight overlay on Mori's verdict; state tracking of all tested creatures; audio/visual match feedback.

**Open design risk to test:** the feature-highlight may give away too much on confound levels (could trivialize Level 2). May need to make the highlight slightly ambiguous, delayed, or "Mori's best guess at what mattered" rather than ground truth.

### Step 5 — Sort (the Challenge)

- **Heading:** "Sort these the way Mori would"
- Mori presents a **fresh batch of ~8–10 creatures** (seeded with trap cards that distinguish competing rules).
- Child drags each into **YES** or **NO** bins.
- **Button:** "Check my sorting!"
- On submit, Mori reveals true labels:
  - **Zero mismatches →** Step 6a (level complete).
  - **Any mismatch →** Step 6b (highlight mismatches, return to Lab).
- **Technical:** drag-and-drop into two bins; clear per-card correct/incorrect reveal; mismatch highlighting.

### Step 6a — Level complete (correct sort)

- **Heading:** "You cracked it!"
- **Celebration:** confetti, Mori happy dance.
- **Rule reveal:** "Mori's rule was: **[RULE]**."
- **"How Mori Found the Pattern" panel:** visually highlight the defining feature(s) across the YES examples; connect to the concept ("Mori found which features matter by comparing examples — that's how AI recognizes things").
  - **Level 4 special panel:** the proxy reveal — show that every spotted example was also green, so Mori learned *green*. Explicit line: "Mori's pattern was only as good as the examples it saw."
- **Stats:** creatures tested; number of sort attempts. *(Framed positively — testing is good.)*
- **Buttons:** "Next level!" (primary) · "I'm done for now" (secondary).

### Step 6b — Not quite (incorrect sort)

- **Mori's response:** gentle, encouraging; "Close! Look where we disagreed."
- **Show the mismatches** explicitly (the creatures where child ≠ Mori). These are the most informative cases.
- **Encouragement:** "Try testing creatures like the ones we disagreed on."
- **Return to Lab** (Step 4). Hypothesis can be revised and re-sorted freely.

### Step 7 — Session summary (optional exit)

- **Heading:** "Great work, pattern detective!"
- **Stats:** levels solved this session; total solved; highest level reached.
- **Mori's closing:** "You found patterns the way an AI does — by testing and comparing, not by being told!"
- **Learning recap:** "AI recognizes things by finding patterns in features across examples. And remember Level 4 — a pattern is only as good as the examples it learned from!"
- **Buttons:** "Keep playing" · "Back to activities."

---

## Scoring & open-ended play

- **Win a level:** one clean sort (zero mismatches).
- **No penalty** for testing or for failed sorts; a failed sort routes back to the Lab with mismatches highlighted.
- **Optional light gamification:** award *bonus* stars for solving with fewer tests (rewards efficient hypothesizing), but **never subtract** for testing — the incentive must always point toward more investigation.
- Child may replay any unlocked level and continue indefinitely.

---

## Hints (progressive, never the answer)

- Hints appear only after **multiple failed sorts** at a level.
- Hints point at *where to look / what to test*, not the rule:
  - 1st: "Look closely at the creatures where you and Mori disagreed."
  - 2nd: "Try testing two creatures that are the same except for one feature."
  - 3rd: "Watch which feature Mori highlights when it changes its answer."
- **Hints must not give the rule directly** (resolves an open question from v1: the connection is always left to the child).

---

## Functional Requirements

### 1. App reorganization for multiple activities

1.1. Linear curriculum: Activity 2 locked until Activity 1 complete. 1.2. Track completion in persistent storage (localStorage). 1.3. Activity-specific folders: `components/activities/zhorai/`, `components/activities/mori/`, `components/activities/shared/`. 1.4. Activity-agnostic state management, extensible to future activities. 1.5. Locked activities show a lock icon and "Complete [previous activity] to unlock."

### 2. Character & feature-attention visualization

2.1. Mori with animated expressions (happy, thinking, confused, excited). 2.2. A **feature-attention** visualization (replaces v1 "brain regions"): shows Mori attending to specific creature features. 2.3. On each classification, Mori highlights the feature(s) it is attending to. 2.4. Mori has a distinct TTS voice from Zhorai.

### 3. Creature builder & testing system

3.1. Child can assemble a creature by selecting feature values (and/or pick from a tray). 3.2. Touch-friendly targets (≥60×60pt drag targets, ≥44×44pt tap). 3.3. Testing is unlimited and never penalized; no UI implying a test limit. 3.4. Each verdict shows YES/NO **plus** attended-feature highlight. 3.5. Tested creatures accumulate in visible YES/NO columns. 3.6. Audio + visual feedback for YES/NO.

### 4. Sort/challenge system

4.1. Generate a fresh batch of ~8–10 creatures per challenge. 4.2. Batches must be **seeded with trap creatures** that distinguish the true rule from the tempting wrong rule(s) at that level. 4.3. Child sorts into YES/NO bins via drag-and-drop. 4.4. On submit, reveal true labels with clear per-creature correct/incorrect. 4.5. Zero mismatches → level up; any mismatch → return to Lab with mismatches highlighted.

### 5. Rule & content system (engineered ambiguity)

5.1. Support the four-level progression: single feature → confound → conjunction → proxy. 5.2. **Starter sets must be consistent with more than one rule** (ambiguity is required, not incidental). 5.3. Each rule defines: the true rule; the tempting wrong rule(s); the starter set; and the trap creatures needed in challenge batches. 5.4. Creature features drawn from the controlled vocabulary (shape, color, pattern, spikes, eyes). 5.5. Content authored so the true rule is **only** discoverable by testing the distinguishing cases.

### 6. Progress & progression

6.1. Track levels solved per session and total. 6.2. Track highest level reached. 6.3. Save progress to localStorage. 6.4. Allow indefinite play (no forced end). 6.5. Levels unlock sequentially; solved levels are replayable.

### 7. Explanation & reinforcement

7.1. After each clean sort, show "How Mori Found the Pattern," highlighting the defining feature(s). 7.2. Level 4 must show the **proxy reveal** (spotted-correlated-with-green) and state the generalization lesson explicitly. 7.3. Explanations connect the activity to real AI pattern recognition. 7.4. Session summary on exit, including the generalization takeaway.

---

## Non-Goals (out of scope)

- **No rule creation by children** in this version.
- **No multiplayer.** (The "solve with a friend" twist is a future enhancement, not core.)
- **No timed challenges.**
- **No free-form creature drawing** — creatures are composed from the fixed feature vocabulary.
- **No NOT-conditions or complex boolean logic** beyond the single conjunction in Level 3.
- **No adaptive difficulty** — progression is fixed and sequential.
- **No natural-language rule guessing / NLP evaluation.** *(Removed from v1: correctness is now demonstrated by sorting, not by articulating the rule in words. This also eliminates the v1 semantic-matching complexity.)*

---

## Design Considerations

### Visual design

- **Mori:** red fuzzy monster, yellow horns, big buck-tooth smile, curly star-tipped tail.
- **Color scheme:** warm red-orange (Mori); YES = green (`#4CAF50`); NO = orange/red (`#FF6B6B`); warm cream/soft-gradient background.
- **Creatures:** clean, iconic, with each feature unambiguously readable (shape, color, pattern, spikes, eye-count must all be visually distinct).
- **Feature highlight:** clear glow/spotlight on the attended feature when Mori gives a verdict.

### Animation & feedback

- Smooth Mori expression transitions.
- Drag feedback: creature lifts and follows finger/cursor with slight rotation.
- Verdict animation: creature moves to the YES/NO column with a satisfying motion.
- Celebration: confetti + Mori dance on a clean sort.

### Audio

- Mori's voice distinct from Zhorai (playful).
- SFX: pickup, verdict chime (YES) / soft "hmm" (NO), celebration on level complete, gentle "look again" on a mismatch.

### Responsive design

- iPad (landscape/portrait) and iPhone (portrait).
- Tap targets ≥44×44pt; drag targets ≥60×60pt.
- Layout adapts (fewer creatures visible at once on phone).

---

## Technical Considerations

### Drag-and-drop

- Recommended: `@dnd-kit/core` (strong touch + accessibility support).
- Must support mouse and touch seamlessly.

### Content model (revised for engineered ambiguity)

ts

```ts
type Shape = 'round' | 'square' | 'triangular';
type Color = 'red' | 'blue' | 'green' | 'yellow';
type Pattern = 'spots' | 'stripes' | 'solid';

interface Creature {
  id: string;
  shape: Shape;
  color: Color;
  pattern: Pattern;
  spikes: boolean;
  eyes: 1 | 2 | 3;
}

interface Level {
  id: string;
  index: 1 | 2 | 3 | 4;
  // The rule Mori actually applies (predicate over a creature):
  trueRule: (c: Creature) => boolean;
  trueRuleLabel: string;            // e.g. "blue"
  temptingWrongRules: string[];     // e.g. ["round"] — for hint/explanation logic
  starterSet: Creature[];           // consistent with >1 rule by construction
  // Trap creatures that distinguish trueRule from temptingWrongRules,
  // guaranteed to appear in challenge batches:
  requiredTraps: Creature[];
  explanation: string;              // "How Mori Found the Pattern"
  // Level 4 only: the correlated proxy feature actually learned
  proxyFeature?: string;            // e.g. "green"
}
```

- Challenge-batch generator must include `requiredTraps` plus filler, shuffled.
- A content-authoring check should verify that `starterSet` is genuinely ambiguous (multiple simple rules fit it) and that `requiredTraps` separate the true rule from each tempting wrong rule.

### Feature-attention visualization

- On each verdict, compute which feature(s) the rule depends on for *this* creature and highlight them. For Level 4, highlight the **proxy** feature (green), since that's what Mori "actually" uses — this is what makes the contradiction visible.

### State management

- `MoriActivityContext` separate from Zhorai's.
- Shared utilities (speech, progress) via shared hooks.
- `ActivityProgressContext` for cross-activity unlock/progress state.

### Code organization

```
components/
  activities/
    shared/
      progress-bar.tsx
      celebration-animation.tsx
    zhorai/
      (existing components)
    mori/
      meet-mori-step.tsx
      feature-attention.tsx        // replaces brain-visualization
      observe-step.tsx             // starter set
      lab-interface.tsx            // test / creature builder
      sort-challenge.tsx           // batch sorting
      level-complete.tsx
      session-summary.tsx
lib/
  context/
    activity-progress-context.tsx
    zhorai-activity-context.tsx
    mori-activity-context.tsx
  data/
    mori-levels.ts                 // the four levels, starter sets, traps
```

---

## Success Metrics

- **Iteration actually happens:** median tests-before-first-sort ≥ a threshold on Levels 2–4 (i.e., children are testing, not one-shot guessing). *This is the metric that proves the v1 problem is fixed.*
- **Completion:** ≥60% of children who start a level eventually sort it correctly.
- **Engagement:** average ≥3 levels attempted per session.
- **Progression:** ≥50% reach Level 3 within first 3 sessions.
- **Concept transfer (the real test):** children can explain, in their own words, that (a) AI finds patterns in features from examples, and (b) a pattern can be wrong if the examples were narrow/biased (the Level 4 idea).
- **Replayability:** ≥40% return for additional sessions.
- **Fun:** ≥4.0/5.0 if feedback is collected.

