/**
 * Level content for the Goal Pursuit Activity with Coda.
 * PRD: 0004-prd-goal-pursuit-activity.md
 *
 * Only Level 1 ("You have to pay it to care") is authored so far. Levels 2-3
 * (reward-was-the-mistake, specification-is-brittle) are tracked as follow-up
 * tasks in tasks-0004-prd-goal-pursuit-activity.md (3.2, 3.3).
 */

import { CodaLevel, RunResult, TileType } from '@/types/coda-activity';

const E: TileType = 'empty';
const W: TileType = 'wall';

// 4x4 maze. Start top-left, exit bottom-right; the only route is along the
// top row then down the right column (the middle is walled off).
const LEVEL_1_GRID: TileType[][] = [
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
  grid: LEVEL_1_GRID,
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

export const CODA_LEVELS: CodaLevel[] = [LEVEL_1];

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
