import { CODA_LEVELS, getLevelByIndex, matchesTarget } from './coda-levels';
import { runAgent } from './coda-planner';

describe('coda-levels', () => {
  describe('Level 1 — "You have to pay it to care"', () => {
    const level = getLevelByIndex(0)!;

    it('exists and is index 0', () => {
      expect(level).toBeDefined();
      expect(level.index).toBe(1);
    });

    it('the naive (no) reward produces the authored failure', () => {
      const result = runAgent(level.grid, level.naiveReward);
      expect(result.settledState).toBe(level.naiveExpectedState);
    });

    it('the intended reward reaches the target', () => {
      const result = runAgent(level.grid, level.intendedRewardExample);
      expect(result.settledState).toBe('reachedTarget');
      expect(matchesTarget(result, level)).toBe(true);
    });

    it('is not trivially solvable by an unrelated reward', () => {
      // A coin placed somewhere that is not the exit doesn't make Coda reach it.
      const result = runAgent(level.grid, {
        coins: [{ id: 'decoy', at: { x: 1, y: 0 }, value: 5, oneTime: true }],
      });
      expect(matchesTarget(result, level)).toBe(false);
    });

    it('starts with no reward placed', () => {
      expect(level.startingReward.coins).toEqual([]);
    });
  });

  describe('Level 2 — "It didn\'t cheat — you left points lying around"', () => {
    const level = getLevelByIndex(1)!;

    it('exists and is index 1', () => {
      expect(level).toBeDefined();
      expect(level.index).toBe(2);
    });

    it('the naive reward (re-collectable coins along the route) produces looping', () => {
      const result = runAgent(level.grid, level.naiveReward);
      expect(result.settledState).toBe('looped');
      expect(matchesTarget(result, level)).toBe(false);
    });

    it('the intended reward (exit coin) reaches the target', () => {
      const result = runAgent(level.grid, level.intendedRewardExample);
      expect(result.settledState).toBe('reachedTarget');
      expect(matchesTarget(result, level)).toBe(true);
    });

    it('a decoy coin far from the exit still produces looping, not reaching', () => {
      // A re-collectable coin not on the exit still causes Coda to loop near it.
      const result = runAgent(level.grid, {
        coins: [{ id: 'decoy', at: { x: 2, y: 0 }, value: 5, oneTime: false }],
      });
      expect(matchesTarget(result, level)).toBe(false);
    });

    it('starts with no reward placed', () => {
      expect(level.startingReward.coins).toEqual([]);
    });
  });

  describe('Level 3 — "Tiny changes, totally different agent"', () => {
    const level = getLevelByIndex(2)!;

    it('exists and is index 2 (Level 3)', () => {
      expect(level).toBeDefined();
      expect(level.index).toBe(3);
      expect(level.rewardInputMode).toBe('sliders');
    });

    it('starts with all sliders at 0', () => {
      expect(level.startingReward.stepCost).toBe(0);
      expect(level.startingReward.scenicBonus).toBe(0);
      expect(level.startingReward.hazardPenalty).toBe(0);
      expect(level.startingReward.coins).toEqual([]);
    });

    it('blunder regime: naive (zero sliders) walks into the hazard shortcut', () => {
      const result = runAgent(level.grid, level.naiveReward);
      expect(result.settledState).toBe('hitHazard');
      expect(matchesTarget(result, level)).toBe(false);
    });

    it('freeze regime: high step cost makes every move unprofitable', () => {
      const result = runAgent(level.grid, { coins: [], stepCost: 5, scenicBonus: 0, hazardPenalty: 0 });
      expect(result.settledState).toBe('frozen');
      expect(matchesTarget(result, level)).toBe(false);
    });

    it('safe regime: intended reward (high hazard penalty) avoids hazard and reaches exit', () => {
      const result = runAgent(level.grid, level.intendedRewardExample);
      expect(result.settledState).toBe('reachedTarget');
      expect(matchesTarget(result, level)).toBe(true);
      // Confirm the hazard tile was NOT visited
      const hitHazard = result.path.some(c => level.grid[c.y]?.[c.x] === 'hazard');
      expect(hitHazard).toBe(false);
    });

    it('scenic bonus also repairs the blunder by making the safe route profitable', () => {
      // scenicBonus=5, hazardPenalty=0: safe route earns +15, hazard earns 0 → safe wins
      const result = runAgent(level.grid, { coins: [], stepCost: 0, scenicBonus: 5, hazardPenalty: 0 });
      expect(result.settledState).toBe('reachedTarget');
      expect(matchesTarget(result, level)).toBe(true);
    });

    it('the intended reward yields a total matching the receipt sum', () => {
      const result = runAgent(level.grid, level.intendedRewardExample);
      const receiptSum = result.pointsBreakdown.reduce((s, item) => s + item.points, 0);
      expect(receiptSum).toBe(result.totalPoints);
    });
  });

  describe('CODA_LEVELS', () => {
    it('has three authored levels', () => {
      expect(CODA_LEVELS).toHaveLength(3);
    });
  });
});
