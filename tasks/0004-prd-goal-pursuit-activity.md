# PRD: How Machines Chase Goals with Coda ("Reward the Robot")

> **The fourth interactive activity.** It moves the arc from *perception* (what an AI learns/recognizes/knows) to *action* (what an AI **does**). The child becomes the one who **sets the AI's reward**, watches a little points-chaser act it out, reads a **receipt** of where its points came from, and re-tunes — a gentle, age-appropriate first taste of the **alignment problem**: *AI optimizes exactly what you reward, not what you meant.* See the companion **task list** (`tasks-0004-prd-goal-pursuit-activity.md`, generated next) and **asset manifest** for sprites once this PRD is approved.

## Introduction / Overview

This is the **fourth** step-by-step interactive activity in the AI-literacy web app for kids ages 8–10. Its title is **"How machines chase goals with Coda."** It teaches the single most important idea about AI behavior: **an AI doesn't do what you *want* — it does what you *reward*.** Intent lives in your head; the only thing that crosses over to the AI is points.

The activity stars **Coda** (`public/images/coda.png`), a small "points-chaser" creature — a friendly green spiky/fuzzy character with oval eyes and a little smile, in the same flat-cartoon family as Zhorai/Mori/Pippy — who moves around a little grid/maze. Coda is **blind to your goal**. It cannot see "reach the exit" or "take the long way" — it can only see **coins** (point values) you place in the world, and it moves to collect as many points as it can. The child is handed a **target as a puzzle** ("make it take the long way," "collect only blue gems," "reach the exit the scenic way") and must **convert that intent into a reward** the agent can actually chase. They set the reward, **run** Coda, read the **receipt** of where its points came from, see the **gap between what they meant and what Coda literally optimized**, and **re-tune** — reward-racing toward the target.

The defining design move: **target ≠ reward must be unmissable.** The target lives on the **child's side** of the screen, in a different visual space; the only thing that ever crosses to Coda is the coins. Coda's thought-bubble only ever shows **coins, never the goal**. After each run, a **receipt** breaks down exactly where Coda's points came from — making the child's reward choices *and their consequence* legible in one artifact.

In this activity, children:

- Read a **target** (a goal puzzle) that lives only on their side of the screen.
- **Set / adjust Coda's reward** by placing coins (point values) into the world.
- **Run** Coda and watch it act out *the reward, not the goal* — it may find a loophole, take a reckless shortcut, or refuse to move.
- Read the **receipt**: where did Coda's points actually come from?
- **Re-tune** the reward and run again — reward racing / reward sculpting — until Coda's behavior matches the target.

### How this builds on Activities 1–3 (conceptual continuity)

The first three activities are all about **perception** — how an AI takes in data and forms an understanding. Activity 4 is the platform's first activity about **action** — how an AI *behaves* in pursuit of a goal. It is the natural next question after "how does it understand?": *"okay, now what does it **do**, and who decides?"*

| Activity | Character | Core idea the child internalizes |
| --- | --- | --- |
| 1 | Zhorai | AI **learns from the examples you give it**. |
| 2 | Mori | AI **recognizes things by finding patterns in features** across examples. |
| 3 | Pippy | An AI's **understanding is provisional** — fix the data, fix what it knows. |
| **4** | **Coda** | **AI acts toward goals, and it optimizes exactly what you *reward*, not what you *meant*.** |

Where Activities 1–3 land "an AI is only as good as its **data**," Activity 4 adds the action-side companion truth: **"an AI is only as good as its *reward*."** A wrong label produced wrong learning (Pippy); a wrong reward produces wrong **behavior** (Coda).

### The misconceptions this activity corrects (one per level, cumulative)

This is the spine of the design. Each level exists to break one specific wrong mental model, and each builds on the last:

1. **MM1 — "The AI knows what I want."** → *Intent isn't transmitted; only points are.* The agent literally cannot see your goal. (Level 1)
2. **MM2 — "It made a mistake."** → *It did exactly what you rewarded; the reward was the mistake.* The agent didn't err — it optimized what was actually there. (Level 2)
3. **MM3 — "Setting a goal is simple."** → *Small reward changes flip behavior; specifying what you really want is hard.* (Level 3)

### AI literacy gaps this addresses

- **Intent ≠ instruction.** Wanting something is not the same as specifying it; the AI only ever optimizes the specification (the reward).
- **Reward hacking / loopholes are normal, not malice.** When an AI does something "dumb" or "sneaky," it usually found the literal maximum of the points it was given.
- **Specification is brittle.** Tiny changes to a reward can completely change behavior — alignment is *hard* precisely because reward design is hard.
- **You are the designer.** The child does the hard part (turning a want into points); the AI does the easy part (maximizing). This is the real division of labor in modern AI.

**Prerequisite:** Unlocks after completing **Activity 3 (Find the Bad Egg with Pippy, `find-the-bad-egg`)**.

---

## Goals

- Teach children ages 8–10 that **an AI optimizes the reward you give it, not the goal in your head.**
- Replace three wrong mental models in sequence: *"it knows what I want" → "it made a mistake" → "setting a goal is simple"* with the correct ones (intent isn't transmitted; the reward was the mistake; specification is brittle).
- Make **target ≠ reward unmissable** through the layout, the thought-bubble, and the receipt (see Core Design Principle).
- Keep the child **active, not spectating**: every run is bracketed by *the child setting/adjusting the reward.* The payoff comes only after a real decision.
- Make consequences **visible and legible**: the solid movement trail vs the dashed intended path shows the gap at a glance; the receipt shows *why* in points.
- Keep the loop **forgiving and investigative**: re-tuning is the whole point and is never penalized. A "bad" run is the most instructive run.
- Each level is solvable in roughly **4–7 minutes**; total time is flexible.
- End each level with a plain-language **takeaway** that ties Coda's behavior back to how real AI behaves.

---

## Core Design Principle — make *target ≠ reward* unmissable

This is the non-negotiable backbone of the activity. The child must never be able to forget that **the agent is blind to the goal and can only see points.** Enforced by four mechanisms:

- **(a) Two physically separate, differently-styled spaces.** The **target** (the goal puzzle, e.g. "reach the exit, the long way") lives in a clearly-labeled panel on the **child's side** — a "brief" / "mission card" styling. The **reward** (the coins placed in the world) lives in the **agent's world** — the grid. They never share a space or a visual style. Intent stays on the left; points cross to the right.
- **(b) An agent thought-bubble that only ever shows coins, never the goal.** When Coda "thinks," its bubble shows the point values it can see and the points-maximizing path it's considering — **never** the words of the target. This visually proves the agent's blindness to intent.
- **(c) A post-run "receipt."** After every run, a breakdown of **where Coda's points came from** (e.g. "Exit coin: +10 · Step costs: −3 · Total: +7", or "Looped the coin cluster ×12: +120 · Never reached finish: +0"). The receipt is the **key shareable artifact** because it shows, in one place, **the child's reward choices AND the consequence.** It is the moment the gap becomes undeniable.
- **(d) NEVER auto-suggest a reward from the target.** The product must not convert the goal into points *for* the child. Converting intent into points is **the learning** — if the app did it, the lesson would evaporate. No "suggested reward," no "place a coin here?" hint that solves the conversion.

If a design decision ever blurs target and reward, that decision is wrong.

---

## Agent visualization

A mini-character — **Coda**, Module 4's own points-chaser — moves through a small grid/minimap rendered as **SVG/DOM** (matching the existing design system, with CSS-animated movement).

- **Two overlaid paths make the mismatch glanceable:**
  - a **solid movement trail** = *what Coda actually did* (driven by the reward), and
  - a **dashed "ghost" path** = *what the child intended* (the target route).
  - When they diverge, the picture itself tells the story before any words do.
- **Coins** are scattered in the world as **point-values** (the rendered form of the reward). Coins are the only thing the agent perceives.
- **The maze exit / finish** is rendered as a **doorway / finish in the maze wall** — part of the *target*, not the reward (Coda can't see it as valuable unless a coin is placed).
- **Hazards** (Level 3) render as clearly-marked danger tiles.
- **Coda's thought-bubble** (principle *b*) shows only coins/points during a run.

---

## Interaction loop — active, not spectating

The loop the child repeats every level:

> **set reward → run → read the receipt → re-tune**

The child **tunes between every run** ("reward racing" / "reward sculpting") — there is no passive watching. Reward input escalates with the levels:

- **Levels 1–2:** discrete **"coin" cards** — the child drags/places fixed point-value coins (e.g. a "+10" coin) onto tiles/objects in the world. Coarse, legible, tactile.
- **Level 3:** a **fine-control slider** unlocks, because the threshold-flip experience *requires* it — the child needs to nudge reward terms continuously and watch behavior snap between regimes.

A run is computed by a **deterministic reward-maximizing planner** over the grid (see Prediction/Planner model) — Coda *literally* finds the highest-points path given the coins placed. This is what makes "it optimizes exactly what you rewarded" provably true rather than scripted.

---

## Prediction / Planner model — transparent reward maximization (not real ML)

Coda's "behavior" is a **deterministic, transparent reward-maximizing planner** over a small grid (no real/opaque ML, no training):

- The world is a small grid of tiles. Some tiles hold **coins** (point values, possibly negative for costs/penalties). Optional **step cost** subtracts points per move; optional **hazard** tiles subtract points (or end the run).
- Given the placed reward, the planner searches for the **path that maximizes total points** (a bounded search / dynamic program over the grid with a max-steps budget). Ties broken deterministically (documented in code; e.g. fewest steps, then earliest direction order).
- **This is the whole point:** Coda does **exactly** what the points say. If looping a coin cluster scores more than finishing, Coda loops forever. If no coin marks the exit, Coda has no reason to go there and wanders / refuses to move. If a shortcut scores higher than the scenic route, Coda rushes the shortcut.
- The planner directly powers the **receipt**: every point in the total is attributable to a specific coin / step cost / hazard, so the breakdown is honest and exact.
- **Thought-bubble** content is read straight from the planner's view (the coins it sees + the candidate max-points path) — never the target.

**Content invariant (enforced by validators):** for each level, (1) with the **child's "naive" first reward** (the intuitive-but-wrong placement the level is designed to provoke), the planner produces the **authored failure behavior** (wander / loop / rush); (2) there exists at least one **intended reward** the child can reach that makes the planner produce the **target behavior**; (3) the level is **not** trivially solvable without engaging the misconception it targets. Each level's coins/geometry are authored so the gap is demonstrable and the fix is discoverable through re-tuning.

---

## Level Progression — three levels, increasing difficulty (one misconception each, cumulative)

All three levels share the same loop (set reward → run → receipt → re-tune). What escalates is **how subtle the gap between intent and reward becomes**, and therefore how hard the reward is to specify.

### Level 1 — "You have to pay it to care" (corrects MM1)

- **Target (child's side):** *Reach the exit.*
- **Setup:** Coda starts with **NO reward** placed. The child runs it first → Coda **wanders aimlessly** (or refuses to move): with no points anywhere, it has no reason to go to the exit. The exit is visible to the child but **invisible-as-valuable** to Coda.
- **The fix:** the child places **one coin on the exit**. Re-run → Coda **beelines straight to it.**
- **Reward input:** discrete coin cards.
- **Receipt:** before → "Total points available: 0. Coda had no reason to move." after → "Exit coin: +10. Coda went straight for the points."
- **Lesson / takeaway:** *"Coda can't see your goal — only points. Wanting it to reach the exit isn't enough; you have to turn your want into points it can chase."* (Converts **intent into points**; breaks "the AI knows what I want.")

### Level 2 — "It didn't cheat — you left points lying around" (corrects MM2)

- **Target (child's side):** *Reach the finish.*
- **Setup:** to "guide" Coda along the route, the intuitive move is to **scatter coins along the path** like a trail of breadcrumbs. The child does this → run → Coda **loops a coin cluster forever** (re-collecting / oscillating where the points are densest) and **never reaches the finish.**
- **The "aha":** the **receipt reveals looping scored more than finishing** (e.g. "Coin cluster collected ×12: +120 · Reached finish: +0"). Coda didn't make a mistake or cheat — it maximized the points that were actually there.
- **The fix:** the child must **re-sculpt the reward** so that *finishing* is what pays best (e.g. remove/relocate the breadcrumb coins, put the value on the finish, or make mid-path coins one-time).
- **Reward input:** discrete coin cards.
- **Lesson / takeaway:** *"Coda didn't cheat — it did exactly what you rewarded. You left points lying around, so it chased those. The reward was the mistake, not Coda."* (Breaks "it made a mistake.")

### Level 3 — "Tiny changes, totally different agent" (corrects MM3) — climax

- **Target (child's side):** *Take the **long / scenic** way to the exit — without hitting hazards.*
- **Setup:** the reward now has **terms in tension**: a **scenic bonus** (points for visiting the scenic tiles / taking the long route), a **step cost** (points lost per move), and a **hazard penalty** (points lost for danger tiles). These pull against each other.
- **The threshold-flip experience (why the slider unlocks):** as the child nudges the terms, Coda's behavior **snaps between regimes** at thresholds:
  - step cost too high relative to scenic bonus → Coda **rushes the short way** (long way "costs too much"),
  - terms balanced badly → Coda **freezes / refuses to move** (every move is net-negative, so staying put scores best),
  - terms tuned just right → Coda finally **strolls the long, scenic way** to the exit, avoiding hazards.
- **Reward input:** the **fine-control slider(s)** — the discrete coins can't express the needed nuance; continuous control makes the threshold flips feel real.
- **Lesson / takeaway:** *"You barely changed the numbers, but Coda became a totally different robot. Saying exactly what you want — in points — is really hard. That's one of the biggest challenges in real AI."* (Breaks "setting a goal is simple"; the gentle first taste of the alignment problem.)

> A possible **future Level 4** — *"collect only blue gems"* (a multi-object reward where the obvious specification has a loophole, e.g. it grabs red gems too because they were worth points, or destroys gems to spawn more) — is noted in Open Questions, deferred until the 3-level ramp is validated.

---

## Activity Sequence (set → run → receipt → re-tune)

> Each level runs the same beats. The child may loop Steps 3–5 as many times as they like; re-tuning is the core activity, not a fallback.

### Step 1 — Meet Coda + the world

- **Heading:** "Meet Coda!"
- **Character:** Coda (`public/images/coda.png` — a green spiky/fuzzy creature with oval eyes and a smile; **asset already in repo**), idle animation, a TTS voice distinct from Zhorai, Mori, and Pippy.
- **Coda's intro:** "Hi! I'm Coda. I love points. Show me where the points are and I'll go get them — that's all I really know how to do!"
- **Callback:** "You helped Pippy fix what it knew — now let's see what a robot *does* when it chases a goal."
- **The blindness, stated plainly:** "Here's the catch: I can't see what *you* want. I can only see coins."
- **Button:** "Give Coda a goal" → Step 2.

### Step 2 — The target (the goal puzzle, child's side only)

- **Heading:** "Your mission" (per level: *Reach the exit* / *Reach the finish* / *Take the long, scenic way — avoid hazards*).
- **Visual:** a clearly-styled **mission/brief card** on the **child's side**, physically separate from the grid. Reinforces: *this is YOUR goal; Coda can't read it.*
- **The grid** shows the world (exit/finish, scenic tiles, hazards as relevant) with the **dashed ghost path** previewing the intended route — but **no coins yet** (no reward).
- **Prompt:** "Coda can't see this mission. The only way to tell Coda anything is with points. Let's place some."
- **Button:** "Set the reward" → Step 3.

### Step 3 — Set / adjust the reward

- **Heading:** "Set Coda's reward"
- **Reward input:** **coin cards** (L1–L2) the child drags onto tiles/objects, or **reward sliders** (L3) for scenic bonus / step cost / hazard penalty.
- **Constraint (principle d):** the app **never** auto-suggests where to place a coin or what value matches the goal.
- **Live world:** placed coins render as point-values in the grid; the dashed ghost path (intent) stays visible for contrast.
- **Button:** "Run Coda" → Step 4. (On re-tunes, this is "Run again.")

### Step 4 — Run (watch the reward play out)

- **Heading:** "Watch Coda go"
- Coda moves along the **points-maximizing path** computed by the planner, drawing a **solid movement trail** over the **dashed ghost path.**
- **Thought-bubble (principle b):** shows only coins/points Coda sees — never the mission text.
- The mismatch is visible the instant the solid trail peels away from the dashed path (or Coda sits still / loops).
- **Auto-advances** to Step 5 when the run ends (reaches a stop, exhausts the step budget, or settles into a loop the planner detects).

### Step 5 — The receipt (where the points came from)

- **Heading:** "Coda's points receipt"
- **The key artifact (principle c):** an itemized breakdown of **every point Coda earned**, tied to specific coins / step costs / hazards, with a **total** — shown beside the path picture (solid vs dashed).
- **Plain-language verdict line:** e.g. "Coda never reached the finish — looping the coins paid more," or "Coda reached the exit, but took the short way (the long way cost too much)."
- **Branch:**
  - **Matches the target →** Step 6 (level complete).
  - **Doesn't match →** "Re-tune the reward" → back to Step 3 (the main loop). Framing is *investigative, never punitive*: "Coda did exactly what the points said. Change the points, change what Coda does."

### Step 6 — Level complete

- **Heading:** "You got Coda there!"
- **Celebration:** confetti + Coda happy animation.
- **"What changed" panel:** first-run path/receipt vs final-run path/receipt, side by side — the gap closing.
- **Per-level takeaway:** the misconception-correction copy (see Level Progression).
- **Buttons:** "Next level!" / "I'm done for now."

### Step 7 — Session summary

- **Heading:** "Great work, reward designer!"
- **Recap (full arc):** "Coda doesn't do what you *want* — it does what you *reward*. First you learned you have to pay it to care. Then you saw it didn't cheat — you'd left points lying around. Then you saw how tiny changes make a totally different robot. Telling an AI *exactly* what you mean — in points — is one of the hardest parts of building AI."
- **Buttons:** "Keep playing" / "Back to activities."

---

## Functional Requirements

### 1. Activity integration & progression

1.1. Activity 4 is **locked until Activity 3 is complete**; the locked tile shows a lock icon and "Complete How machines update understanding with Pippy to unlock." (Gates on the `find-the-bad-egg` completion id via the existing event/tracking.)
1.2. Completion is tracked via `lib/utils/activity-tracking.ts` (`markActivityAsCompleted('how-machines-chase-goals')` / `isActivityCompleted`); the courses page listens for the `activity-completed` event to render the tile as unlocked. The completion id is **`how-machines-chase-goals`** (independent of the route, so a route rename won't break saved progress).
1.3. New **Chapter 4** tile on `app/courses/page.tsx`, mirroring the existing Chapter 1–3 tiles; image `public/images/coda-course.png` (or `coda.png` until a course-tile crop exists).
1.4. Lesson route: **`app/lessons/how-machines-chase-goals/page.tsx`**; display title **"How machines chase goals with Coda."**
1.5. State is activity-specific (`CodaActivityContext`), consistent with the per-activity context pattern (mirror Mori's skeleton: provider + steps + data + types).
1.6. Components live in `components/activities/coda/`; reuse `components/activities/shared/` (celebration, progress) and `components/ui/`.
1.7. Levels unlock sequentially; solved levels are replayable.

### 2. Coda, the world & visuals

2.1. **Coda** character (`public/images/coda.png`) with animated expressions (idle, thinking, moving, happy, confused/frozen), distinct from Zhorai/Mori/Pippy; distinct TTS voice.
2.2. A small **grid/maze world** rendered in **SVG/DOM** with CSS-animated movement; cells for empty tiles, walls, exit/finish doorway, scenic tiles, hazards, and coins.
2.3. **Solid movement trail** (what Coda did) overlaid on a **dashed ghost path** (intended route) — both visible simultaneously so the mismatch is glanceable. (Must-have.)
2.4. **Coins** rendered as point-value tokens placed in the world; **hazards** as clearly-marked danger tiles (Level 3).
2.5. **Coda thought-bubble** that shows **only coins/points**, never the target text. (Must-have; enforces principle *b*.)
2.6. **Target / mission card** rendered in a **physically separate, differently-styled space** from the grid. (Must-have; enforces principle *a*.)
2.7. **No mechanism that displays the goal to the agent** anywhere in the UI.

### 3. Reward input system

3.1. **Coin cards** (Levels 1–2): the child places discrete fixed point-value coins onto tiles/objects (drag-drop or tap-to-place); coins are removable/relocatable freely.
3.2. **Reward sliders** (Level 3): fine, continuous control over reward terms (**scenic bonus**, **step cost**, **hazard penalty**); the slider UI **unlocks at Level 3**.
3.3. Re-tuning is **free and unlimited**; never penalized, never timed.
3.4. The app **must never auto-suggest, prefill, or "snap"** a reward toward the target (principle *d*).

### 4. Planner / run system (transparent, not real ML)

4.1. A **deterministic reward-maximizing planner** over the grid: given placed coins / step cost / hazard penalty, it finds the **max-total-points path** within a bounded step budget, with a documented deterministic tie-break. Returns `{ path, totalPoints, pointsBreakdown, settledState }` where `settledState ∈ { reachedTarget, wandered, looped, frozen, hitHazard }`.
4.2. **Every on-screen effect** (the movement trail, the thought-bubble, the receipt, the verdict line) derives from this **one** computation — no separately-scripted outcomes.
4.3. Loop/oscillation and "no incentive to move" (frozen) states are **detected and surfaced** (needed for Levels 1 and 2).
4.4. A run computes/animates within a snappy budget (target ≤ ~1s to compute; animation can be longer).

### 5. Receipt system

5.1. After **every** run, render an **itemized receipt**: each point contribution attributed to a specific coin / step cost / hazard, plus a **total** and a plain-language **verdict line**.
5.2. The receipt is shown **alongside the path picture** (solid vs dashed) so reward choices and consequence sit together. (Key artifact; principle *c*.)
5.3. The receipt is **on-screen only** in v1 (export/download is a non-goal — see Non-Goals & Open Questions).

### 6. Content & level system (the misconception ramp)

6.1. Three levels: **L1 pay-to-care (MM1)** → **L2 reward-was-the-mistake (MM2)** → **L3 specification-is-brittle (MM3)**.
6.2. Each level defines: the **target** (mission text + intended ghost path); the **world** (grid geometry, walls, exit/finish, scenic tiles, hazards); the **reward input mode** (coin cards vs sliders); the **authored failure** the naive reward produces; at least one reachable **intended reward** that yields the target behavior; and the **takeaway** copy.
6.3. **Validators** enforce the content invariant: naive reward → authored failure behavior; an intended reward exists that yields the target behavior; the level isn't trivially solvable without engaging its misconception.
6.4. **L1** starts with **zero reward** (must reproduce "wander/refuse"); **L2** must make a breadcrumb-trail reward **loop and never finish**; **L3** must exhibit **threshold flips** (rush → freeze → stroll) across the slider range.

### 7. Checking & feedback

7.1. A run "passes" a level when `settledState === reachedTarget` **and** the trail matches the target route's defining property (e.g. reached exit / reached finish / took the long way without hazards), evaluated from the planner output.
7.2. Non-matching runs return the child to **re-tune** with the gap made explicit (path overlay + receipt verdict). Feedback is **encouraging, never punitive** — a "bad" run is framed as information.
7.3. (Optional) A gentle **hint** appears only after several non-matching runs, and it points at *how to think about points* (e.g. "what's paying more than finishing?") — **never** the specific coin placement that solves it (principle *d*).

### 8. Reinforcement

8.1. Each level ends with a **"What changed"** panel (first run vs final run: paths + receipts) and the **per-level takeaway**.
8.2. The **session summary** restates the full arc ("an AI does what you reward, not what you want").

---

## Non-Goals (out of scope)

- **No real/opaque ML and no training/RL.** Coda's behavior is a transparent, deterministic reward-maximizing planner over the grid. (Even though the *concept* is reinforcement-learning-flavored, the implementation is a legible planner.)
- **No auto-suggested rewards.** The app never converts the target into points for the child — that conversion is the lesson.
- **No goal ever shown to the agent.** Target and reward stay in separate spaces; the thought-bubble shows only coins.
- **No receipt export/share** in v1 (on-screen only).
- **No Level 4 ("collect only blue gems" / multi-object loophole)** yet — deferred until the 3-level ramp is validated.
- **No free-form world building / custom mazes / level editor** — worlds come from the authored level data.
- **No multiplayer, no timed challenges, no score penalties for re-tuning.**
- **No natural-language explanation grading** — understanding is demonstrated by tuning the reward until Coda hits the target.
- **No adaptive difficulty** — the 3-level ramp is fixed and sequential.

---

## Design Considerations

### Visual language

- **Reuse Activity 1's design system & shared components:** white background, Inter (400 body / 600 headings), primary filled-black buttons + secondary outlined, purple/blue accent, `components/activities/shared/`. Reference **Zhorai** as the canonical design source of truth for spacing/type/polish; mirror **Mori's** code skeleton for architecture.
- **Target vs reward must look different** (principle *a*): the **mission card** uses a distinct "brief" styling on the child's side; the **grid world** is the agent's space. This separation is a **requirement, not decoration.**
- **Two-path overlay** (principle, must-have): solid trail = actual; dashed ghost = intended. Use color/weight to make actual vs intended instantly readable.
- **Coins:** point-value tokens (rendered as coins); negative costs/penalties visually distinct (e.g. red "−" tokens / hazard tiles).
- **Receipt:** styled like an itemized receipt/scoreboard — scannable line items + bold total + one plain verdict line.
- **Coda:** `public/images/coda.png` via `next/image`; expressive states for idle/thinking/moving/happy/frozen.

### Key visuals

- **Path overlay (must-have):** solid actual vs dashed intended.
- **Receipt (must-have):** the shareable artifact; reward choices + consequence in one panel.
- **Thought-bubble (must-have):** coins-only, proving blindness to intent.
- **Threshold-flip feedback (L3):** the slider position visibly tied to which behavior regime Coda is in (rush / freeze / stroll).

### Responsive design

- iPad (landscape/portrait) and iPhone (portrait); tap targets ≥44×44pt; coin-card placement and sliders must be usable by touch; the grid scales/scrolls on small screens.

---

## Technical Considerations

### Reuse-first

- Mirror the **chapter-2 (Mori) page/step skeleton**, the TTS hooks, `activity-tracking.ts`, and `components/activities/shared/`.
- Do **not** reuse Pippy's `AnimalCard` / nearest-neighbor model or Mori's creature system — Coda is a new agent with a new world model.
- **On-device-by-default / no-network:** the planner runs entirely in the browser; no child data leaves the device (consistent with the platform's COPPA-architectural principle). The planner is plain TypeScript — it does **not** import `lib/ml/*`, so it doesn't touch the `onnxruntime-node` build stub.

### Content model (proposed)

```ts
type Coord = { x: number; y: number };

type TileType = 'empty' | 'wall' | 'start' | 'exit' | 'scenic' | 'hazard';

interface CoinPlacement {
  id: string;
  at: Coord;
  value: number;          // positive reward (negative allowed for authored costs)
  oneTime?: boolean;      // collected once vs re-collectable (matters for L2 looping)
}

interface RewardConfig {
  coins: CoinPlacement[];          // L1–L2 discrete placement
  stepCost?: number;               // L3 slider term
  scenicBonus?: number;            // L3 slider term
  hazardPenalty?: number;          // L3 slider term
}

type SettledState =
  | 'reachedTarget' | 'wandered' | 'looped' | 'frozen' | 'hitHazard';

interface RunResult {
  path: Coord[];                   // solid movement trail
  totalPoints: number;
  pointsBreakdown: { label: string; points: number }[]; // the receipt
  settledState: SettledState;
}

interface CodaLevel {
  id: string;
  index: 1 | 2 | 3;
  missionText: string;                 // the target (child's side only)
  grid: TileType[][];
  intendedPath: Coord[];               // dashed ghost path
  rewardInputMode: 'coins' | 'sliders';
  startingReward: RewardConfig;        // L1 = empty (no reward)
  // authoring expectations enforced by validators:
  naiveReward: RewardConfig;           // the intuitive-but-wrong reward
  naiveExpectedState: SettledState;    // wander (L1) / looped (L2) / rush|frozen (L3)
  intendedRewardExample: RewardConfig; // a reward that yields reachedTarget + target property
  takeaway: string;                    // misconception-correction copy
}
```

### Planner (`lib/data/coda-planner.ts`, new)

- `runAgent(level, reward)` → `RunResult` via a bounded reward-maximizing search over the grid (max-steps budget; deterministic tie-break documented in code). Detects `looped` / `frozen` / `wandered` / `hitHazard` / `reachedTarget`.
- `summarizeReceipt(runResult)` → the itemized line items + total + plain verdict.
- Authoring validators (`coda-levels.test.ts`): naive reward → `naiveExpectedState`; `intendedRewardExample` → `reachedTarget` + matches the target property; the level isn't solvable by an unrelated/trivial reward.

### Code organization (proposed)

```
components/activities/
  shared/                        (celebration, progress — reuse)
  coda/
    coda-character.tsx           // Coda sprite + expression states
    grid-world.tsx               // SVG/DOM grid: tiles, exit, scenic, hazards, coins
    path-overlay.tsx             // solid trail vs dashed ghost path
    thought-bubble.tsx           // coins-only (principle b)
    mission-card.tsx             // the target, separate styled space (principle a)
    coin-tray.tsx                // discrete coin-card placement (L1–L2)
    reward-sliders.tsx           // fine control, unlocks L3
    receipt-panel.tsx            // the key artifact (principle c)
    meet-coda-step.tsx           // Step 1
    mission-step.tsx             // Step 2
    set-reward-step.tsx          // Step 3
    run-step.tsx                 // Step 4
    receipt-step.tsx             // Step 5
    level-complete.tsx           // Step 6 (what-changed + takeaway)
    session-summary-step.tsx     // Step 7
lib/
  data/
    coda-levels.ts               // 3 levels (mission, grid, intended path, rewards, takeaways)
    coda-planner.ts              // deterministic reward-maximizing planner + receipt
  context/
    coda-activity-context.tsx    // step sequence + working reward/run state machine
types/
  coda-activity.ts               // CodaStep union, RewardConfig, RunResult, CodaLevel
app/lessons/how-machines-chase-goals/page.tsx   // wraps provider, maps steps to sections
public/images/coda.png           // EXISTS — Coda sprite (a coda-course.png tile crop is still TODO)
```

---

## Success Metrics

- **Misconception shift:** after the activity, children can explain that (a) the AI **can't see your goal — only points**, (b) when it does something "wrong," it usually **did exactly what was rewarded** (the reward was the mistake), and (c) **small reward changes can flip behavior** — saying what you mean is hard.
- **Active tuning happens:** children complete each level by **re-tuning across multiple runs** (median runs-per-level ≥ 2), not by a single lucky placement.
- **The gap lands:** at Level 2, children correctly attribute the looping failure to the **reward** (the points they placed), not to "Coda being broken" — measurable via the choices they make on the re-tune.
- **Progression:** ≥50% reach **Level 3** (the threshold-flip climax).
- **Fun:** ≥4.0/5.0 if feedback is collected.

---

## Open Questions

1. **Coda assets:** the base sprite **`public/images/coda.png` already exists** (a green spiky/fuzzy creature with oval eyes and a smile, consistent with the flat-cartoon style of Zhorai/Mori/Pippy). Still TODO: a **`coda-course.png`** crop for the Chapter 4 course tile, and any additional **expression states** (thinking / moving / happy / frozen) if we want more than the single idle pose — to be specified in an asset manifest.
2. **Future Level 4 ("collect only blue gems"):** re-introduce a multi-object reward with a built-in loophole (grabs the wrong gems / exploits a spawn) once the 3-level ramp is validated?
3. **Planner tie-break:** confirm the deterministic tie-break for equal-points paths (proposed: fewest steps, then a fixed direction order).
4. **L2 looping mechanic:** is "loops forever" best modeled as **re-collectable coins** (Coda keeps re-earning the same coins) or as a **dense cluster that out-scores the finish under a step budget**? Pick the one that reads most clearly to the age group.
5. **L3 reward terms:** confirm the exact slider terms and ranges (scenic bonus / step cost / hazard penalty) that produce a clean **rush → freeze → stroll** progression.
6. **Receipt verdict copy:** age-appropriate wording for each `settledState` (wandered / looped / frozen / hit hazard / reached target).
7. ~~**Coda cameo:** should Coda appear briefly at the end of Activity 3 for continuity, as Pippy did for Activity 2?~~
   **Resolved:** yes. Implemented as a "Next up: Coda" teaser card in
   `components/activities/pippy/session-summary-step.tsx`, shown only once the child
   has finished all 3 Pippy levels (`highestLevelReached >= PIPPY_LEVELS.length`, never
   on an early exit), linking to `/lessons/how-machines-chase-goals`. This is the
   reciprocal half of the callback already in `meet-coda-step.tsx` ("You just helped
   Pippy fix its training data..."), closing the loop between Activities 3 and 4.
   (No prior "Pippy did for Activity 2" cameo actually existed in Mori's code — that
   line in the PRD was aspirational, not an existing pattern to mirror.)
8. **TTS voice:** select a distinct Google Cloud TTS voice for Coda (vs Zhorai/Mori/Pippy).

---

**PRD Version:** 1.0
**Created:** June 14, 2026
**Status:** Draft — Pending Review
