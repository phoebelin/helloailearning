# Platform PRD — Summary

> **Snapshot, not source of truth.** This distills the *Hello AI Learning — Platform
> PRD* (Google Doc, "Project Platform v1.0", last updated June 2026). The live Doc is
> the authority and may have changed:
> https://docs.google.com/document/d/1DJBen5LF5JpA0HZ8ZLUR8Wm1Tf1FKq_OvAZtGKyjRw8/edit
>
> **Scope reminder:** this PRD covers the **project-builder platform**, which is
> **largely unbuilt in this repo today**. The repo currently implements the *curriculum*
> side. The curriculum's five modules are documented separately (not in this Doc).

## The product & the flywheel

A two-sided platform: an AI-literacy **curriculum** (teaches how AI works) + a **project
builder** (kids deploy real AI tools — classifiers, agents, interactive experiences — that
they publish and share).

**Flywheel:** kids build real AI projects → publish & share them → new families discover
the platform → schools see measurable outcomes → partnerships deepen reach → repeat.
Evaluate every decision by whether it strengthens a link in that chain. An impressive but
*unshared* artifact weakens it; making sharing one step easier strengthens it.

## Design principles

1. **The child is the designer, not the consumer** — meaningful decisions before any AI
   output; visible, instructive failure.
2. **On-device by default** — browser models (TF.js, MediaPipe) over server APIs; cheaper,
   faster, COPPA-friendly. Reach for server-proxied frontier APIs only when on-device can't deliver.
3. **The artifact shows the work, not just the output** — a share link reveals the child's design decisions.
4. **Compliance is an architectural constraint** — COPPA/FERPA + 2025 COPPA amendments designed in, not bolted on.
5. **Ship the loop before the library** — one project type done excellently beats five mediocre ones.

## Users

Student under-13 (parent-consented) · Student 13–17 (self-consent) · Parent (consent +
receives share links) · Teacher (assigns, tracks class) · Visitor (uses a share link, no
account) · School Admin (license, billing, SSO).

## Phases & milestones

### Phase 1 — Prove the Flywheel
*One project type, done excellently. Exit: a share link brings a new person to the platform.*
- **M1.1 On-Device Training Foundation** — train an image/sound classifier in-browser, no
  server inference (TF.js + transfer learning on MobileNetV2; speech-commands for audio).
- **M1.2 Account & Consent** — age-gate at signup; under-13 parent-consent flow; COPPA-compliant
  data model (`User` / `ChildProfile` / `ConsentAuditLog`); separate consent for any third-party calls.
- **M1.3 Publish & Share** — trained model → working app at a permanent human-readable URL
  (`/p/[slug]`); client-side inference only; Open Graph share previews; QR code.
- **M1.4 Moderation Gate** — nothing publishes without passing automated review (OpenAI text
  moderation + AWS Rekognition images incl. CSAM/NCMEC); human review queue, 24h SLA; instant admin unpublish.
- **M1.5 Showcase Gallery** — public, no-account browse of published projects at `/explore`.

### Phase 2 — Expand the Surface
*Three more project types + first school integration. Exit: a teacher assigns a project; a
student publishes; the link is opened from outside the school.*
- **M2.1 Recommendation Engine** — curate a dataset + attribute tags; on-device cosine-similarity recs.
- **M2.2 Chatbot / AI Character** — persona + Q&A knowledge; **server-proxied LLM** (Claude
  Haiku / GPT-4o-mini), output moderation, rate limits, age gate for under-13.
- **M2.3 Sensor-Triggered App** — gestures (MediaPipe Hands) / sounds → responses; all detection on-device.
- **M2.4 Teacher Dashboard** — classes, class codes, assignments, roster status, bulk CSV onboarding (school COPPA exception).
- **M2.5 Curriculum Bridge** — completing a module drops students into the matching project builder.

### Phase 3 — Deepen the Moat
*Community layer, hardest-to-copy project type, school revenue. Exit: a school signs a paid
license; a student cites their portfolio URL externally.*
- **M3.1 RL Simulation** — design a reward function, watch a Q-learning agent train in-canvas (Web Worker, vanilla JS).
- **M3.2 Experiment Card & Remix** — documented experiment as the shareable artifact; "Remix this" pre-loads the config.
- **M3.3 Student Portfolio** — opt-in public page (`/u/[username]`) collecting published projects; strict under-13 limits.
- **M3.4 School Licensing & Premium** — Stripe billing, Google/Clever SSO, school analytics, premium individual tier.

## Cross-cutting (all phases, not deferred)

- **Compliance** — age verification precedes all data collection; under-13 data never leaves
  to third parties without logged consent; biometric data on-device only; automated deletion;
  6th-grade-reading-level privacy policy; accessible account deletion.
- **Moderation** — no UGC text/image reaches a public URL un-moderated; images moderated at
  *upload* time; generative outputs moderated before display; mandatory CSAM detection + NCMEC reporting.
- **Share/Publish** — every project type yields a unique permanent human-readable URL that
  loads with no login; correct Open Graph metadata; `?ref=` attribution tracking.

## Architecture posture (on-device vs server)

On-device (browser): classifier train+inference (TF.js), recommender (JS cosine sim), sensor
detection (MediaPipe), RL training (Web Worker). Server-proxied: chatbot LLM calls, text/image
moderation, portfolio ISR pages. Stack named in PRD: Next.js/Node app server · Postgres ·
S3 + CDN · Redis (rate limits, queues) · BullMQ workers (moderation, email, screenshots).

## Open questions (per PRD)

LLM provider for chatbot (Claude Haiku vs GPT-4o-mini) · under-13 chatbot access · moderation
reviewer staffing · under-13 portfolio public visibility · school FERPA DPA · remix attribution for under-13.
