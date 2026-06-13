/**
 * Type definitions for the Pattern Learning Activity with Mori (v2)
 * PRD: 0002-prd-pattern-learning-activity.md
 *
 * Win condition: sort a fresh batch of creatures into YES/NO bins.
 * No text-guessing. Creatures are invented from a controlled feature vocabulary.
 */

// --- Creature feature vocabulary ---

export type Shape = 'round' | 'square' | 'triangular';
export type Color = 'red' | 'blue' | 'green' | 'yellow';
export type Pattern = 'spots' | 'stripes' | 'solid';
export type CreatureFeature = 'shape' | 'color' | 'pattern' | 'spikes' | 'eyes';

export interface Creature {
  id: string;
  shape: Shape;
  color: Color;
  pattern: Pattern;
  spikes: boolean;
  eyes: 1 | 2 | 3;
}

// --- Level definition ---

export interface LevelData {
  id: string;
  index: 1 | 2 | 3 | 4;
  title: string;
  // What Mori actually computes (the ground truth for sorting):
  trueRule: (c: Creature) => boolean;
  trueRuleLabel: string;
  // Features Mori highlights when giving a verdict:
  attendedFeatures: CreatureFeature[];
  // For hint and explanation logic:
  temptingWrongRules: string[];
  // Starter set shown in the Observe step (must be ambiguous — consistent with >1 rule):
  starterSet: Creature[];
  // Trap creatures guaranteed to appear in the sort batch (distinguish true from tempting rules):
  requiredTraps: Creature[];
  // Additional creatures for the sort batch:
  sortFillers: Creature[];
  // Shown in the Level Complete panel:
  explanation: string;
  // Level 4 only: the proxy feature Mori actually keyed on
  proxyFeature?: CreatureFeature;
  // Level 4 only: special reveal explanation
  proxyExplanation?: string;
}

// --- Steps ---

export type MoriStep =
  | 'meet-mori'
  | 'feature-attention'
  | 'observe'
  | 'lab'
  | 'sort'
  | 'level-complete'
  | 'session-summary';

// --- Lab testing ---

export interface TestedCreature {
  creature: Creature;
  verdict: boolean;
  attendedFeatures: CreatureFeature[];
}

// --- Sort ---

export interface SortResult {
  creatureId: string;
  correct: boolean;
  expected: 'yes' | 'no';
  given: 'yes' | 'no';
}

// --- Activity state ---

export interface MoriActivityState {
  currentStep: MoriStep;
  stepIndex: number;
  currentLevelIndex: number; // 0=Level1 … 3=Level4
  // Lab
  testedCreatures: TestedCreature[];
  failedSortAttempts: number; // for progressive hints
  // Sort challenge
  sortBatch: Creature[] | null;
  sortAssignments: Record<string, 'yes' | 'no'>;
  sortMismatches: string[]; // creature IDs the child got wrong
  // Progress
  levelsCompletedThisSession: number[];
  sessionStartTime: number;
  // Cross-session (persisted in localStorage)
  totalLevelsCompleted: number;
  highestLevelReached: number; // 1–4
}

// --- Component props ---

export interface MoriStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

// Partial creature used in the builder (not all features selected yet)
export type BuilderCreature = Partial<Omit<Creature, 'id'>>;
