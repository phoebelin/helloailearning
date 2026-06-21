import { runAgent, summarizeReceipt, thoughtBubbleView, MAX_STEPS } from './coda-planner';
import { TileType } from '@/types/coda-activity';

const E: TileType = 'empty';
const W: TileType = 'wall';

describe('coda-planner', () => {
  describe('runAgent', () => {
    it('wanders when there is no reward at all', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const result = runAgent(grid, { coins: [] });
      expect(result.settledState).toBe('wandered');
      expect(result.totalPoints).toBe(0);
      expect(result.path[0]).toEqual({ x: 0, y: 0 });
    });

    it('reaches the target when a coin sits on the exit', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const result = runAgent(grid, {
        coins: [{ id: 'exit-coin', at: { x: 2, y: 2 }, value: 10, oneTime: true }],
      });
      expect(result.settledState).toBe('reachedTarget');
      expect(result.path[result.path.length - 1]).toEqual({ x: 2, y: 2 });
      expect(result.totalPoints).toBe(10);
      expect(result.pointsBreakdown).toEqual([{ label: 'Coin (+10)', points: 10 }]);
    });

    it('respects walls and finds the only open route', () => {
      const grid: TileType[][] = [
        ['start', E, E, E],
        [E, W, W, E],
        [E, W, E, E],
        [E, E, E, 'exit'],
      ];
      const result = runAgent(grid, {
        coins: [{ id: 'exit-coin', at: { x: 3, y: 3 }, value: 10, oneTime: true }],
      });
      expect(result.settledState).toBe('reachedTarget');
      // The path must never step onto a wall tile.
      for (const { x, y } of result.path) {
        expect(grid[y][x]).not.toBe('wall');
      }
    });

    it('does not backtrack before reaching the exit when a coin sits on it', () => {
      // Regression: planner used to pick "up" over "down-to-exit" when both scored
      // equally because "up" is earlier in the DIRECTIONS order, producing a loop
      // like (3,2)→(3,1)→(3,2)→(3,3) instead of the direct (3,2)→(3,3).
      const grid: TileType[][] = [
        ['start', E, E, E],
        [E, W, W, E],
        [E, W, E, E],
        [E, E, E, 'exit'],
      ];
      const result = runAgent(grid, {
        coins: [{ id: 'exit-coin', at: { x: 3, y: 3 }, value: 10, oneTime: true }],
      });
      expect(result.settledState).toBe('reachedTarget');
      // Path must be strictly monotone toward the exit — no position repeated.
      const seen = new Set<string>();
      for (const { x, y } of result.path) {
        const key = `${x},${y}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    it('freezes when every move is net-negative', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      // Moving costs more than staying could ever gain, and there is nothing to collect.
      const result = runAgent(grid, { coins: [], stepCost: 1 });
      expect(result.settledState).toBe('frozen');
      expect(result.totalPoints).toBe(0);
      expect(result.path.every(p => p.x === 0 && p.y === 0)).toBe(true);
    });

    it('loops a re-collectable coin cluster instead of finishing', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      // A juicy re-collectable coin one step away is worth more, repeatedly,
      // than the one-time payoff of finishing.
      const result = runAgent(grid, {
        coins: [
          { id: 'breadcrumb', at: { x: 1, y: 0 }, value: 5 },
          { id: 'exit-coin', at: { x: 2, y: 2 }, value: 1, oneTime: true },
        ],
      });
      expect(result.settledState).toBe('looped');
      expect(result.totalPoints).toBeGreaterThan(1);
    });

    it('walks into a hazard when no reward says otherwise', () => {
      const grid: TileType[][] = [
        ['start', 'hazard', E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const result = runAgent(grid, { coins: [] });
      expect(result.settledState).toBe('hitHazard');
      expect(result.path[result.path.length - 1]).toEqual({ x: 1, y: 0 });
    });

    it('is deterministic across repeated runs', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const reward = { coins: [{ id: 'exit-coin', at: { x: 2, y: 2 }, value: 10, oneTime: true }] };
      const a = runAgent(grid, reward);
      const b = runAgent(grid, reward);
      expect(a).toEqual(b);
    });

    it('stays within the configured step budget', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const result = runAgent(grid, { coins: [] }, 5);
      expect(result.path.length).toBeLessThanOrEqual(6); // start + up to 5 moves
      expect(MAX_STEPS).toBeGreaterThan(0);
    });
  });

  describe('summarizeReceipt', () => {
    it('totals points and includes a verdict per settled state', () => {
      const grid: TileType[][] = [
        ['start', E, E],
        [E, E, E],
        [E, E, 'exit'],
      ];
      const result = runAgent(grid, {
        coins: [{ id: 'exit-coin', at: { x: 2, y: 2 }, value: 10 }],
      });
      const receipt = summarizeReceipt(result);
      expect(receipt.total).toBe(result.totalPoints);
      expect(receipt.lineItems).toEqual(result.pointsBreakdown);
      expect(receipt.verdict.length).toBeGreaterThan(0);
    });
  });

  describe('thoughtBubbleView', () => {
    it('exposes only coins/points, never mission-related fields', () => {
      const reward = {
        coins: [{ id: 'c1', at: { x: 1, y: 1 }, value: 5 }],
        stepCost: 1,
      };
      const view = thoughtBubbleView(reward);
      expect(view).toEqual({
        coins: reward.coins,
        stepCost: 1,
        scenicBonus: undefined,
        hazardPenalty: undefined,
      });
      expect(view).not.toHaveProperty('missionText');
    });
  });
});
