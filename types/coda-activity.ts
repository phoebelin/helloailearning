/**
 * Type definitions for the Goal Pursuit Activity with Coda
 * PRD: 0004-prd-goal-pursuit-activity.md
 *
 * Coda is a transparent, deterministic reward-maximizing planner that moves
 * through a small grid. The child sets Coda's reward (coins / sliders), runs
 * Coda, and reads a receipt of where its points came from. Win condition:
 * tune the reward until Coda's behavior matches the mission.
 */

// --- Grid & world ---

export interface Coord {
  x: number;
  y: number;
}

export type TileType = 'empty' | 'wall' | 'start' | 'exit' | 'scenic' | 'hazard';

// --- Reward ---

export interface CoinPlacement {
  id: string;
  at: Coord;
  value: number; // positive reward; negative allowed for authored costs
  oneTime?: boolean; // collected once vs re-collectable (matters for L2 looping)
}

export interface RewardConfig {
  coins: CoinPlacement[]; // L1-L2 discrete placement
  stepCost?: number; // L3 slider term (points lost per move)
  scenicBonus?: number; // L3 slider term (points gained per scenic tile entered)
  hazardPenalty?: number; // L3 slider term (points lost on entering a hazard tile)
}

// --- Run result (the planner's output) ---

export type SettledState =
  | 'reachedTarget'
  | 'wandered'
  | 'looped'
  | 'frozen'
  | 'hitHazard';

export interface RunResult {
  path: Coord[]; // solid movement trail, including the starting tile
  totalPoints: number;
  pointsBreakdown: { label: string; points: number }[]; // the receipt line items
  settledState: SettledState;
}

// --- Level definition ---

export interface CodaLevel {
  id: string;
  index: 1 | 2 | 3;
  title: string;
  missionText: string; // the target (child's side only)
  grid: TileType[][]; // grid[y][x]
  intendedPath: Coord[]; // dashed ghost path
  rewardInputMode: 'coins' | 'sliders';
  startingReward: RewardConfig; // L1 = empty (no reward)
  // Authoring expectations enforced by validators:
  naiveReward: RewardConfig; // the intuitive-but-wrong reward
  naiveExpectedState: SettledState; // wander (L1) / looped (L2) / rush|frozen (L3)
  intendedRewardExample: RewardConfig; // a reward that yields reachedTarget + the target property
  takeaway: string; // misconception-correction copy
}

// --- Steps ---

export type CodaStep =
  | 'meet-coda'
  | 'mission'
  | 'set-reward'
  | 'run'
  | 'receipt'
  | 'level-complete'
  | 'session-summary';

// --- Activity state ---

export interface CodaActivityState {
  currentStep: CodaStep;
  stepIndex: number;
  currentLevelIndex: number; // 0=Level1, 1=Level2, 2=Level3
  // Working reward for the current level (mutated by coin tray / sliders)
  workingReward: RewardConfig;
  // The most recent run, if any
  lastRun: RunResult | null;
  // The first run this level (for the "what changed" panel)
  firstRun: RunResult | null;
  runCountThisLevel: number;
  // Progress
  levelsCompletedThisSession: number[];
  sessionStartTime: number;
  // Cross-session (persisted in localStorage)
  totalLevelsCompleted: number;
  highestLevelReached: number; // 1-3
}

// --- Component props ---

export interface CodaStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}
