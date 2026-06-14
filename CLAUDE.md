# Hello AI Learning

> **Read this first — the gap that confuses every newcomer:**
> This repo is the **curriculum** side of a two-sided product. It is an interactive
> AI-literacy web app: a landing page + a small set of hands-on lesson activities.
>
> The **platform PRD** ([docs/prd-summary.md](docs/prd-summary.md)) describes a much
> larger **project-builder platform** (kids train & publish their own AI models,
> plus accounts/COPPA, moderation, teacher dashboards, school licensing). **Almost
> none of that platform exists in this codebase yet.** If you read the PRD and go
> looking for publish flows, auth, or moderation code, you will not find it — that
> is expected. Build curriculum activities here; treat the platform as roadmap.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind + shadcn/ui (`components/ui`) ·
on-device ML via `@xenova/transformers` · Google Cloud TTS · Notion (waitlist).

## Commands

```bash
npm run dev          # dev server on http://localhost:3000
npm run build        # production build
npm run lint         # next lint
npm test             # Jest unit tests
npm run test:e2e     # Playwright e2e (tests/e2e, auto-starts dev server)
```

Secrets live in `.env.local` (Google Cloud TTS creds, Notion token). Not committed.

## Where things live

| Path | What |
| --- | --- |
| `app/page.tsx` | Marketing landing page + waitlist form |
| `app/courses/` | Course catalog (gates lessons on completion) |
| `app/lessons/` | Lesson pages: `how-machines-learn` (Zhorai), `how-machines-use-patterns` (Mori), `how-machines-update-understanding` (Pippy) |
| `app/api/` | `waitlist` (Notion), `tts` (Google Cloud) |
| `components/activities/<name>/` | Step components for newer activities (mori, pippy) |
| `components/activity/` | Step components for the original Zhorai activity |
| `components/ui/` | shadcn primitives — reuse these, don't hand-roll |
| `lib/context/*-activity-context.tsx` | Per-activity React Context (state machine) |
| `lib/data/*-levels.ts` | Level/creature/question data for each activity |
| `lib/ml/` | On-device ML (BERT predictor, semantic similarity) |
| `lib/utils/activity-tracking.ts` | localStorage completion tracking + `activity-completed` event |
| `types/*-activity.ts` | Per-activity type definitions |
| `tasks/` | PRDs + task lists driving feature work (see workflow below) |

## The activity-authoring pattern

Every lesson activity (Zhorai, Mori, Pippy) follows the same shape. Two different
references, for two different purposes — don't conflate them:

- **Architecture / how to wire a new activity → mirror Mori** (`chapter-2`). It's the
  cleanest skeleton: provider + steps + data + types, all wired at the real lesson route.
- **Visual language & design system → reference Zhorai.** Zhorai is the canonical design
  source of truth (Figma-faithful spacing/type, the intended look for a rich, finished
  activity). Match its visual language. *Do not* copy its code structure wholesale —
  Zhorai's implementation has rough edges (see note below).

To add an activity, follow the Mori skeleton:

1. **Types** — `types/<name>-activity.ts`: the step union, state shape, data models.
2. **Data** — `lib/data/<name>-levels.ts`: engineered levels/content, kept out of components.
3. **Context** — `lib/context/<name>-activity-context.tsx`: a provider holding the
   step sequence + state machine (`goToStep`, `nextStep`, domain actions, derived values).
4. **Steps** — `components/activities/<name>/*`: one component per step, presentational.
5. **Page** — `app/lessons/<route>/page.tsx`: wraps content in the provider and maps
   steps to scroll sections.
6. **Completion** — call `markActivityAsCompleted('<activity-id>')` at the end; the
   courses page listens for the `activity-completed` event to unlock the next lesson.

Naming is layered — keep them straight: **codename** (Mori) · **route**
(`how-machines-use-patterns`) · **completion id** (`find-the-secret-rule`) ·
**display title** ("Find the Secret Rule"). The completion id is independent of the
route, so route renames don't affect saved progress or lesson gating.

**Zhorai caveat** (it's the design reference, but its code has known rough edges, left
intentionally for now): step components in `components/activity/` use raw `<button>`s and
`onNext` prop-drilling rather than the cleaner context-only pattern.

**On-device ML gotcha:** `@xenova/transformers` auto-selects the native `onnxruntime-node`
backend under Node, which crashes SSR / `next build`. `next.config.mjs` stubs it out
(`onnxruntime-node: false`) so inference runs browser-only via the WASM backend. Don't
remove that stub — any page importing the ML code (`lib/ml/*`) will break the build without it.

## Design principles (from the PRD — apply to curriculum work too)

1. **On-device by default.** Prefer in-browser models (`@xenova/transformers`, and per
   the PRD, TF.js/MediaPipe) over server API calls. Cheaper, faster, and COPPA-friendly.
2. **The child is the designer, not the consumer.** Activities require real decisions
   before any payoff. "Click button, get cool thing" is not acceptable. Failure should
   be visible and instructive.
3. **Show the work, not just the output.** Make the learner's reasoning/decisions visible.
4. **Compliance is architectural.** Audience is K-12, mostly under-13. Never send child
   data to a third-party service without explicit consent. Keep biometric/voice/camera
   data on-device. (Mostly forward-looking, but design with it in mind now.)

## Workflow & QA

- **Feature work** uses the `ai-dev-tasks/` flow: write a PRD → generate a task list →
  implement task-by-task. Existing PRDs and task lists are in `tasks/`.
- **QA** the `qa-agent` skill drives an activity end-to-end, finds/fixes bugs, and writes
  a dated report (see `qa-report-*.md`, `README_QA.md`). Run it after building/changing a flow.

## Conventions

- Reuse `components/ui/` primitives and Tailwind; match the surrounding file's style.
- Keep content/data in `lib/data/`, not hard-coded in components.
- Activities are `'use client'` and lean on their context provider for state — don't
  scatter activity state across components.
- Persisted progress goes through `lib/utils/activity-tracking.ts`, not raw localStorage.
