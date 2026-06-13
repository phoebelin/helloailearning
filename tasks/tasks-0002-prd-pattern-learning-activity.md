# Task List: Pattern Learning Activity with Mori — "Find the Secret Rule"

**Source PRD**: `0002-prd-pattern-learning-activity.md`

## Current State Assessment

The codebase is a Next.js (App Router) app that has already shipped Activity 1 (Ecosystem Learning with Zhorai). Relevant existing infrastructure:

- `components/activity/*` — Activity 1's step components live in a flat folder (not yet reorganized into `components/activities/zhorai/`).
- `lib/context/activity-context.tsx` — Zhorai-specific activity state (still the original name).
- `lib/context/mori-activity-context.tsx` — A Mori activity context already exists (early stub from prior work; will be extended).
- `hooks/use-speech-recognition.ts`, `hooks/use-text-to-speech.ts`, `hooks/use-enhanced-text-to-speech.ts` — Speech infrastructure already in place; Mori only needs TTS (a distinct voice), not STT, since v2 of this PRD removes natural-language guessing.
- `app/lessons/how-machines-learn/page.tsx` — Lesson hub; no cross-activity unlock/progress system yet.
- `@dnd-kit/core` and `@dnd-kit/utilities` are already in `package.json` — no install needed for drag-and-drop.
- Tailwind, shadcn/ui, Inter font, Jest + Testing Library, and Playwright (e2e) are all configured.
- `components/lesson-layout.tsx` and `components/lesson-nav.tsx` provide reusable step navigation.

What this means for Activity 2:

- The folder reorg into `components/activities/{zhorai,mori,shared}/` and the cross-activity progress/lock system are still required (PRD §1).
- Activity 2 does **not** need any STT, NLP, or semantic guess matching (explicitly out of scope in v2). The win condition is now sorting, not naming. This significantly shrinks the scope vs. v1.
- The drag-and-drop system is the same engine in two places: a creature *builder/picker* in the Lab and a YES/NO *bin sort* in the Challenge. Both can use the existing `@dnd-kit/core` install.
- Mori's "feature-attention" visualization replaces v1's "brain regions"; it overlays a glow on the specific feature(s) Mori attended to during a verdict.
- Content authoring is a first-class concern in v2: the four levels each require a starter set that is genuinely ambiguous and a set of trap creatures that distinguish the true rule from each tempting wrong rule. This needs validators, not just data.

## Tasks

- [ ] 1.0 Reorganize codebase for multi-activity support and add activity-progress system
- [ ] 2.0 Define creature data model, level content, and engineered-ambiguity validators
- [ ] 3.0 Build Mori character, creature renderer, and feature-attention visualization
- [ ] 4.0 Implement intro and Lab (test) flow — Steps 1–4
- [ ] 5.0 Implement Sort challenge, feedback, progressive hints, and level progression — Steps 5–7
- [ ] 6.0 Integrate full Mori activity into the app, apply polish/responsive design, and run final QA

---

I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed.
