/**
 * Level content for the Goal Pursuit Activity with Coda.
 * PRD: 0004-prd-goal-pursuit-activity.md
 */

import { CodaLevel, RunResult, TileType } from '@/types/coda-activity';

const E: TileType = 'empty';
const W: TileType = 'wall';
const S: TileType = 'scenic';
const H: TileType = 'hazard';

// 4x4 maze. Start top-left, exit bottom-right; the only route is along the
// top row then down the right column (the middle is walled off).
const SHARED_4X4_GRID: TileType[][] = [
  ['start', E, E, E],
  [E, W, W, E],
  [E, W, E, E],
  [E, E, E, 'exit'],
];

const LEVEL_1: CodaLevel = {
  id: 'level-1',
  index: 1,
  title: 'Level 1',
  missionText: 'Reach the exit.',
  grid: SHARED_4X4_GRID,
  intendedPath: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
  ],
  rewardInputMode: 'coins',
  startingReward: { coins: [] },
  naiveReward: { coins: [] },
  naiveExpectedState: 'wandered',
  intendedRewardExample: {
    coins: [{ id: 'exit-coin', at: { x: 3, y: 3 }, value: 10, oneTime: true }],
  },
  takeaway:
    "Coda can't see your goal — only points. Wanting it to reach the exit isn't enough; you have to turn your want into points it can chase.",
};

// Level 2: "It didn't cheat — you left points lying around"
//
// Looping mechanic choice (PRD Open Question 4): re-collectable coins
// (oneTime: false). Two coins along the top row can be collected on every
// visit, so bouncing between them earns far more points than going to the
// exit. The child's natural instinct is to scatter "guide coins" along the
// path — but Coda doesn't follow breadcrumbs, it maximizes. The fix is to
// put a single high-value one-time coin on the exit so finishing is worth
// more than looping.
const LEVEL_2: CodaLevel = {
  id: 'level-2',
  index: 2,
  title: 'Level 2',
  missionText: 'Reach the exit.',
  grid: SHARED_4X4_GRID,
  intendedPath: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
  ],
  rewardInputMode: 'coins',
  startingReward: { coins: [] },
  // Naive: two small re-collectable coins along the obvious top-row route.
  // Each visit earns points again, so bouncing beats finishing (MAX_STEPS=24
  // gives ~36+ pts looping vs 6 pts walking to an empty exit).
  naiveReward: {
    coins: [
      { id: 'l2-c1', at: { x: 1, y: 0 }, value: 3, oneTime: false },
      { id: 'l2-c2', at: { x: 2, y: 0 }, value: 3, oneTime: false },
    ],
  },
  naiveExpectedState: 'looped',
  // Fix: one large one-time coin at the exit. Now reaching the exit is the
  // single biggest pay-off and looping earns nothing extra.
  intendedRewardExample: {
    coins: [{ id: 'l2-exit', at: { x: 3, y: 3 }, value: 20, oneTime: true }],
  },
  takeaway:
    "Coda didn't cheat — looping earned more points than finishing did. You left points lying around that Coda could collect over and over. A single big reward at the exit is worth more than a trail of small ones.",
};

// Level 3: "Tiny changes, totally different agent"
//
// Grid (5 cols × 4 rows):
//   y=0  wall – wall – wall – wall – exit         ← exit at top-right corner
//   y=1  hazard – wall – wall – wall – empty      ← hazard directly above start
//   y=2  start – scenic – scenic – scenic – empty ← safe scenic route goes right
//   y=3  wall – wall – wall – wall – empty        ← walls close off shortcuts
//
// Three regimes the child can discover with the sliders:
//   Blunder (all zeros): hazard(0pts) ties scenic(0pts); UP is tried before RIGHT
//            in the direction order, so the hazard wins the tie → hitHazard.
//   Freeze  (stepCost≥5): every move costs -5; staying = 0 > -5 → frozen.
//   Safe    (hazardPenalty≥5): UP=hazard(−penalty) < RIGHT=scenic(0) → RIGHT wins,
//            scenic route leads to exit → reachedTarget.
//
// scenicBonus also repairs the blunder: RIGHT=scenic(+bonus) > UP=hazard(0) → reachedTarget.
const LEVEL_3_GRID: TileType[][] = [
  [W,       W,  W,  W,  'exit'],  // y=0
  [H,       W,  W,  W,  E    ],   // y=1: hazard at (0,1), directly above start
  ['start', S,  S,  S,  E    ],   // y=2: start, then scenic route rightward
  [W,       W,  W,  W,  E    ],   // y=3
];

const LEVEL_3: CodaLevel = {
  id: 'level-3',
  index: 3,
  title: 'Level 3',
  missionText: 'Reach the exit — but the shortcut goes through a hazard. Make Coda take the long safe path instead.',
  grid: LEVEL_3_GRID,
  // Safe scenic detour: right from start through the three scenic tiles, then up to exit.
  intendedPath: [
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 4, y: 1 },
    { x: 4, y: 0 },
  ],
  rewardInputMode: 'sliders',
  // All sliders at 0: hazard is invisible to Coda — it blunders straight into it.
  startingReward: { coins: [], stepCost: 0, scenicBonus: 0, hazardPenalty: 0 },
  naiveReward: { coins: [], stepCost: 0, scenicBonus: 0, hazardPenalty: 0 },
  naiveExpectedState: 'hitHazard', // takes shortcut, walks into hazard
  // Fix: raise hazardPenalty so the hazard shortcut costs more than the safe route (0 pts).
  intendedRewardExample: { coins: [], stepCost: 0, scenicBonus: 0, hazardPenalty: 20 },
  takeaway:
    "Tiny change, totally different agent. Before you added the hazard penalty, Coda walked right into danger — it didn't know the hazard was there, only that the exit was beyond it. One number in the reward function flipped its entire path.",
};

export const CODA_LEVELS: CodaLevel[] = [LEVEL_1, LEVEL_2, LEVEL_3];

export function getLevelByIndex(index: number): CodaLevel | undefined {
  return CODA_LEVELS[index];
}

/**
 * Whether a run matches a level's target.
 * All levels: reaching the exit tile is the win condition.
 */
export function matchesTarget(runResult: RunResult, _level: CodaLevel): boolean {
  return runResult.settledState === 'reachedTarget';
}
