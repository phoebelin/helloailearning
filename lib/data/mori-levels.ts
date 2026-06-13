/**
 * The four engineered levels for the Mori Pattern Learning Activity.
 *
 * Design principles:
 * - Starter sets are consistent with >1 rule (engineered ambiguity).
 * - requiredTraps distinguish the true rule from each temptingWrongRule.
 * - Level 4's trueRule is the PROXY (green), not the apparent rule (spots).
 */

import { Creature, LevelData } from '@/types/mori-activity';

// ---------------------------------------------------------------------------
// Level 1 — Single feature: has spikes  (tutorial)
// ---------------------------------------------------------------------------

const L1_STARTER: Creature[] = [
  { id: 'l1-s1', shape: 'round',      color: 'red',    pattern: 'spots',   spikes: true,  eyes: 2 },
  { id: 'l1-s2', shape: 'square',     color: 'blue',   pattern: 'stripes', spikes: true,  eyes: 1 },
  { id: 'l1-s3', shape: 'triangular', color: 'green',  pattern: 'solid',   spikes: true,  eyes: 3 },
  { id: 'l1-s4', shape: 'round',      color: 'yellow', pattern: 'solid',   spikes: false, eyes: 2 },
  { id: 'l1-s5', shape: 'square',     color: 'red',    pattern: 'stripes', spikes: false, eyes: 1 },
];

const L1_TRAPS: Creature[] = [
  { id: 'l1-t1', shape: 'triangular', color: 'blue',   pattern: 'spots',   spikes: true,  eyes: 2 },
  { id: 'l1-t2', shape: 'round',      color: 'green',  pattern: 'stripes', spikes: false, eyes: 3 },
];

const L1_FILLERS: Creature[] = [
  { id: 'l1-f1', shape: 'square',     color: 'yellow', pattern: 'spots',   spikes: true,  eyes: 3 },
  { id: 'l1-f2', shape: 'triangular', color: 'red',    pattern: 'stripes', spikes: false, eyes: 1 },
  { id: 'l1-f3', shape: 'round',      color: 'blue',   pattern: 'solid',   spikes: true,  eyes: 1 },
  { id: 'l1-f4', shape: 'square',     color: 'green',  pattern: 'stripes', spikes: false, eyes: 2 },
  { id: 'l1-f5', shape: 'triangular', color: 'yellow', pattern: 'spots',   spikes: true,  eyes: 1 },
  { id: 'l1-f6', shape: 'round',      color: 'red',    pattern: 'solid',   spikes: false, eyes: 3 },
];

// ---------------------------------------------------------------------------
// Level 2 — Confound: true rule is BLUE, but every YES in the starter is also ROUND
// Tempting wrong rule: "round"
// Required traps: blue-square (YES) and round-red (NO)
// ---------------------------------------------------------------------------

const L2_STARTER: Creature[] = [
  // All YES: round AND blue — temptingly consistent with "round"
  { id: 'l2-s1', shape: 'round', color: 'blue',  pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l2-s2', shape: 'round', color: 'blue',  pattern: 'stripes', spikes: false, eyes: 1 },
  { id: 'l2-s3', shape: 'round', color: 'blue',  pattern: 'solid',   spikes: true,  eyes: 2 },
  // NO: neither round nor blue
  { id: 'l2-s4', shape: 'square',     color: 'red',   pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l2-s5', shape: 'triangular', color: 'green', pattern: 'stripes', spikes: false, eyes: 1 },
];

const L2_TRAPS: Creature[] = [
  // blue but NOT round → YES  (breaks the "round" hypothesis)
  { id: 'l2-t1', shape: 'square',     color: 'blue', pattern: 'spots',   spikes: false, eyes: 1 },
  // round but NOT blue → NO  (breaks the "round" hypothesis)
  { id: 'l2-t2', shape: 'round',      color: 'red',  pattern: 'stripes', spikes: false, eyes: 2 },
];

const L2_FILLERS: Creature[] = [
  { id: 'l2-f1', shape: 'triangular', color: 'blue',   pattern: 'solid',   spikes: true,  eyes: 3 },
  { id: 'l2-f2', shape: 'round',      color: 'blue',   pattern: 'spots',   spikes: true,  eyes: 1 },
  { id: 'l2-f3', shape: 'square',     color: 'green',  pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l2-f4', shape: 'round',      color: 'yellow', pattern: 'stripes', spikes: true,  eyes: 3 },
  { id: 'l2-f5', shape: 'triangular', color: 'red',    pattern: 'solid',   spikes: false, eyes: 2 },
  { id: 'l2-f6', shape: 'square',     color: 'blue',   pattern: 'stripes', spikes: false, eyes: 3 },
];

// ---------------------------------------------------------------------------
// Level 3 — Conjunction: round AND spotted
// Tempting wrong rules: "round", "spotted"
// Required traps force failure on any single-feature hypothesis
// ---------------------------------------------------------------------------

const L3_STARTER: Creature[] = [
  { id: 'l3-s1', shape: 'round',  color: 'red',    pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l3-s2', shape: 'round',  color: 'blue',   pattern: 'spots',   spikes: true,  eyes: 1 },
  { id: 'l3-s3', shape: 'round',  color: 'green',  pattern: 'spots',   spikes: false, eyes: 3 },
  // NO: spotted but NOT round
  { id: 'l3-s4', shape: 'square', color: 'yellow', pattern: 'spots',   spikes: false, eyes: 2 },
  // NO: round but NOT spotted
  { id: 'l3-s5', shape: 'round',  color: 'red',    pattern: 'stripes', spikes: false, eyes: 1 },
];

const L3_TRAPS: Creature[] = [
  // spotted but not round → NO
  { id: 'l3-t1', shape: 'square',     color: 'red',  pattern: 'spots',   spikes: false, eyes: 1 },
  // round but not spotted → NO
  { id: 'l3-t2', shape: 'round',      color: 'yellow', pattern: 'stripes', spikes: true, eyes: 2 },
  // spotted but not round → NO
  { id: 'l3-t3', shape: 'triangular', color: 'blue', pattern: 'spots',   spikes: false, eyes: 1 },
];

const L3_FILLERS: Creature[] = [
  { id: 'l3-f1', shape: 'round',      color: 'green',  pattern: 'spots',   spikes: true,  eyes: 1 },
  { id: 'l3-f2', shape: 'round',      color: 'yellow', pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l3-f3', shape: 'square',     color: 'blue',   pattern: 'solid',   spikes: false, eyes: 3 },
  { id: 'l3-f4', shape: 'triangular', color: 'red',    pattern: 'stripes', spikes: true,  eyes: 2 },
  { id: 'l3-f5', shape: 'round',      color: 'red',    pattern: 'spots',   spikes: false, eyes: 3 },
  { id: 'l3-f6', shape: 'square',     color: 'green',  pattern: 'stripes', spikes: false, eyes: 1 },
];

// ---------------------------------------------------------------------------
// Level 4 — Proxy: Mori's ACTUAL rule is GREEN (not spotted)
// In the starter set every spotted creature also happens to be green.
// trueRule = green. The contradiction creatures expose the proxy.
// ---------------------------------------------------------------------------

const L4_STARTER: Creature[] = [
  // ALL YES: green AND spotted — ambiguous between "spots" and "green"
  { id: 'l4-s1', shape: 'round',      color: 'green', pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l4-s2', shape: 'square',     color: 'green', pattern: 'spots',   spikes: true,  eyes: 1 },
  { id: 'l4-s3', shape: 'triangular', color: 'green', pattern: 'spots',   spikes: false, eyes: 3 },
  // NO: not green, not spotted
  { id: 'l4-s4', shape: 'round',      color: 'red',   pattern: 'stripes', spikes: false, eyes: 2 },
  { id: 'l4-s5', shape: 'square',     color: 'blue',  pattern: 'solid',   spikes: false, eyes: 1 },
];

const L4_TRAPS: Creature[] = [
  // GREEN but NOT spotted → Mori says YES! (exposes the proxy)
  { id: 'l4-t1', shape: 'round',  color: 'green', pattern: 'solid',   spikes: false, eyes: 2 },
  // SPOTTED but NOT green → Mori says NO! (exposes the proxy)
  { id: 'l4-t2', shape: 'square', color: 'red',   pattern: 'spots',   spikes: true,  eyes: 1 },
];

const L4_FILLERS: Creature[] = [
  { id: 'l4-f1', shape: 'round',      color: 'green',  pattern: 'spots',   spikes: false, eyes: 1 },
  { id: 'l4-f2', shape: 'triangular', color: 'green',  pattern: 'stripes', spikes: true,  eyes: 3 },
  { id: 'l4-f3', shape: 'square',     color: 'blue',   pattern: 'spots',   spikes: false, eyes: 2 },
  { id: 'l4-f4', shape: 'round',      color: 'red',    pattern: 'stripes', spikes: false, eyes: 2 },
  { id: 'l4-f5', shape: 'triangular', color: 'yellow', pattern: 'solid',   spikes: false, eyes: 1 },
  { id: 'l4-f6', shape: 'round',      color: 'green',  pattern: 'stripes', spikes: false, eyes: 2 },
];

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------

export const LEVELS: LevelData[] = [
  {
    id: 'level-1',
    index: 1,
    title: 'Level 1',
    trueRule: (c) => c.spikes === true,
    trueRuleLabel: 'has spikes',
    attendedFeatures: ['spikes'],
    temptingWrongRules: [],
    starterSet: L1_STARTER,
    requiredTraps: L1_TRAPS,
    sortFillers: L1_FILLERS,
    explanation:
      'Mori looked at the examples and noticed one thing they all had in common: spikes! Every YES creature had spikes, and every NO creature didn\'t. That\'s the pattern — not color, not shape, just spikes.',
  },
  {
    id: 'level-2',
    index: 2,
    title: 'Level 2',
    trueRule: (c) => c.color === 'blue',
    trueRuleLabel: 'is blue',
    attendedFeatures: ['color'],
    temptingWrongRules: ['round'],
    starterSet: L2_STARTER,
    requiredTraps: L2_TRAPS,
    sortFillers: L2_FILLERS,
    explanation:
      'Mori\'s rule was: the creature is blue. Tricky, right? Every YES creature in the starter set was also round, so "round" seemed like a good guess — but a blue square also matched, and a red round didn\'t. Color was the only thing that always worked.',
  },
  {
    id: 'level-3',
    index: 3,
    title: 'Level 3',
    trueRule: (c) => c.shape === 'round' && c.pattern === 'spots',
    trueRuleLabel: 'round AND spotted',
    attendedFeatures: ['shape', 'pattern'],
    temptingWrongRules: ['round', 'spotted'],
    starterSet: L3_STARTER,
    requiredTraps: L3_TRAPS,
    sortFillers: L3_FILLERS,
    explanation:
      'Mori\'s rule needed TWO features at the same time: round AND spotted. A spotted square? Nope. A round striped one? Also nope. Only round + spotted = YES. This is how AI can learn rules that depend on combinations of features, not just one thing.',
  },
  {
    id: 'level-4',
    index: 4,
    title: 'Level 4',
    // Mori actually learned GREEN, not spots — the proxy rule
    trueRule: (c) => c.color === 'green',
    trueRuleLabel: 'is green',
    attendedFeatures: ['color'],
    temptingWrongRules: ['spotted'],
    starterSet: L4_STARTER,
    requiredTraps: L4_TRAPS,
    sortFillers: L4_FILLERS,
    explanation:
      'Here\'s the twist: Mori\'s rule was green, not spotted! Mori was supposed to learn "spotted," but every spotted creature it was ever shown was also green. So Mori learned the wrong thing — it learned green instead.',
    proxyFeature: 'color',
    proxyExplanation:
      'Mori didn\'t learn "spots" — it learned "green," because every spotted creature in its training examples was also green. The pattern is only as good as the examples it came from. If the examples are narrow or biased, the AI learns the wrong thing — and won\'t know it.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getLevelByIndex(index: number): LevelData | undefined {
  return LEVELS[index];
}

/**
 * Build the shuffled sort batch for a level.
 * Always includes requiredTraps + sortFillers, shuffled.
 */
export function buildSortBatch(level: LevelData): Creature[] {
  const all = [...level.requiredTraps, ...level.sortFillers];
  return all.sort(() => Math.random() - 0.5);
}

/**
 * Compute which features Mori is "attending to" for a given creature and level.
 * For most levels this is just level.attendedFeatures.
 * The function exists so callers don't need to special-case Level 4.
 */
export function getAttendedFeatures(level: LevelData): LevelData['attendedFeatures'] {
  return level.attendedFeatures;
}
