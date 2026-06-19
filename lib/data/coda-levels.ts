/**
 * Level content for the Goal Pursuit Activity with Coda.
 * PRD: 0004-prd-goal-pursuit-activity.md
 */

import { CodaLevel, RunResult, TileType } from '@/types/coda-activity';

const E: TileType = 'empty';
const W: TileType = 'wall';

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

export const CODA_LEVELS: CodaLevel[] = [LEVEL_1, LEVEL_2];

export function getLevelByIndex(index: number): CodaLevel | undefined {
  return CODA_LEVELS[index];
}

/**
 * Whether a run matches a level's target. For Level 1, the target is simply
 * "reach the exit" — later levels (2-3) layer on additional path properties
 * (e.g. "without looping", "the long way, avoiding hazards").
 */
export function matchesTarget(runResult: RunResult, _level: CodaLevel): boolean {
  return runResult.settledState === 'reachedTarget';
}
