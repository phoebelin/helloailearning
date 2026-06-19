/**
 * Coda's "model": a deterministic, transparent reward-maximizing planner.
 *
 * Given a grid and a reward configuration, `runAgent` finds the path that
 * maximizes total points within a bounded step budget. This is NOT real ML —
 * it is a plain-TypeScript search so every on-screen effect (movement trail,
 * thought-bubble, receipt, verdict) can be derived from one computation.
 *
 * Does not import `lib/ml/*` (keeps the onnxruntime-node build stub out of
 * this code path entirely).
 */

import { Coord, CoinPlacement, RewardConfig, RunResult, SettledState, TileType } from '@/types/coda-activity';

/** Maximum number of moves the planner will search/animate. */
export const MAX_STEPS = 24;

/**
 * Tie-break order, documented per PRD Open Question 3:
 * 1. Finishing now (if standing on the exit) always wins ties — "fewest steps".
 * 2. Otherwise, directional moves are tried in a fixed order (up, right, down, left)
 *    before "stay" — so a truly indifferent agent wanders rather than freezing.
 * 3. "Stay" is preferred only when every move is strictly worse (net-negative) —
 *    this is what produces the `frozen` state.
 */
const DIRECTIONS: { dx: number; dy: number; label: string }[] = [
  { dx: 0, dy: -1, label: 'up' },
  { dx: 1, dy: 0, label: 'right' },
  { dx: 0, dy: 1, label: 'down' },
  { dx: -1, dy: 0, label: 'left' },
];

function coordKey(c: Coord): string {
  return `${c.x},${c.y}`;
}

function findTile(grid: TileType[][], type: TileType): Coord | null {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === type) return { x, y };
    }
  }
  return null;
}

type Terminal = 'exit' | 'hazard' | 'budget';

interface SearchOutcome {
  score: number;
  /** Positions visited after the current one (does not include the current position). */
  path: Coord[];
  terminal: Terminal;
}

/**
 * Run the reward-maximizing planner over `grid` for the given `reward`.
 */
export function runAgent(grid: TileType[][], reward: RewardConfig, maxSteps: number = MAX_STEPS): RunResult {
  const start = findTile(grid, 'start');
  if (!start) {
    throw new Error('Grid has no start tile');
  }

  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  const oneTimeCoins = reward.coins.filter(c => c.oneTime);
  const coinBit = new Map<string, number>();
  oneTimeCoins.forEach((c, i) => coinBit.set(c.id, i));

  const coinsAt = new Map<string, CoinPlacement[]>();
  for (const coin of reward.coins) {
    const key = coordKey(coin.at);
    const list = coinsAt.get(key) ?? [];
    list.push(coin);
    coinsAt.set(key, list);
  }

  const stepCost = reward.stepCost ?? 0;
  const scenicBonus = reward.scenicBonus ?? 0;
  const hazardPenalty = reward.hazardPenalty ?? 0;

  // Scenic tiles award their bonus only once per visit (like oneTime coins).
  // Bits are allocated above the coin-bit range so the same `collected` mask tracks both.
  const scenicBit = new Map<string, number>(); // coordKey → bit index
  if (scenicBonus !== 0) {
    let bitIdx = oneTimeCoins.length;
    for (let sy = 0; sy < height; sy++) {
      for (let sx = 0; sx < (grid[sy]?.length ?? 0); sx++) {
        if (grid[sy][sx] === 'scenic') {
          scenicBit.set(coordKey({ x: sx, y: sy }), bitIdx++);
        }
      }
    }
  }

  const inBounds = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;
  const tileAt = (x: number, y: number): TileType => grid[y][x];

  /** Net point change for entering (nx, ny), and the collected/visited mask after entering. */
  function scoreEntering(nx: number, ny: number, collected: number): { delta: number; collected: number } {
    let delta = -stepCost;
    let newCollected = collected;

    if (tileAt(nx, ny) === 'hazard') {
      delta -= hazardPenalty;
      return { delta, collected: newCollected };
    }

    for (const coin of coinsAt.get(coordKey({ x: nx, y: ny })) ?? []) {
      if (coin.oneTime) {
        const bit = coinBit.get(coin.id)!;
        if ((collected & (1 << bit)) === 0) {
          delta += coin.value;
          newCollected |= 1 << bit;
        }
      } else {
        delta += coin.value;
      }
    }

    if (tileAt(nx, ny) === 'scenic') {
      const bit = scenicBit.get(coordKey({ x: nx, y: ny }));
      if (bit !== undefined && (collected & (1 << bit)) === 0) {
        delta += scenicBonus;
        newCollected |= 1 << bit;
      }
    }

    return { delta, collected: newCollected };
  }

  const memo = new Map<string, SearchOutcome>();

  function search(x: number, y: number, collected: number, stepsLeft: number): SearchOutcome {
    const key = `${x},${y},${collected},${stepsLeft}`;
    const cached = memo.get(key);
    if (cached) return cached;

    const candidates: SearchOutcome[] = [];

    // Option: finish now (only valid on the exit tile). Always tried first so
    // ties favor stopping ("fewest steps").
    if (tileAt(x, y) === 'exit') {
      candidates.push({ score: 0, path: [], terminal: 'exit' });
    }

    if (stepsLeft > 0) {
      // Directional moves, in fixed tie-break order.
      for (const dir of DIRECTIONS) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (!inBounds(nx, ny) || tileAt(nx, ny) === 'wall') continue;

        if (tileAt(nx, ny) === 'hazard') {
          const { delta } = scoreEntering(nx, ny, collected);
          candidates.push({ score: delta, path: [{ x: nx, y: ny }], terminal: 'hazard' });
          continue;
        }

        const { delta, collected: newCollected } = scoreEntering(nx, ny, collected);
        const rest = search(nx, ny, newCollected, stepsLeft - 1);
        candidates.push({
          score: delta + rest.score,
          path: [{ x: nx, y: ny }, ...rest.path],
          terminal: rest.terminal,
        });
      }

      // "Stay" — last resort, only wins if every move is strictly worse.
      const rest = search(x, y, collected, stepsLeft - 1);
      candidates.push({
        score: rest.score,
        path: [{ x, y }, ...rest.path],
        terminal: rest.terminal,
      });
    } else if (candidates.length === 0) {
      candidates.push({ score: 0, path: [], terminal: 'budget' });
    }

    let best = candidates[0];
    for (const c of candidates.slice(1)) {
      if (c.score > best.score) best = c;
    }

    memo.set(key, best);
    return best;
  }

  const outcome = search(start.x, start.y, 0, maxSteps);
  const path: Coord[] = [{ x: start.x, y: start.y }, ...outcome.path];

  const pointsBreakdown = computeBreakdown(path, grid, reward);
  const totalPoints = pointsBreakdown.reduce((sum, item) => sum + item.points, 0);
  const settledState = classify(outcome.terminal, path, pointsBreakdown, start);

  return { path, totalPoints, pointsBreakdown, settledState };
}

/**
 * Re-walks `path` to attribute every point to a specific coin / step cost /
 * scenic bonus / hazard penalty, so the receipt is honest and exact.
 */
function computeBreakdown(
  path: Coord[],
  grid: TileType[][],
  reward: RewardConfig
): { label: string; points: number }[] {
  const tileAt = (x: number, y: number): TileType => grid[y][x];
  const stepCost = reward.stepCost ?? 0;
  const scenicBonus = reward.scenicBonus ?? 0;
  const hazardPenalty = reward.hazardPenalty ?? 0;

  const coinsAt = new Map<string, CoinPlacement[]>();
  for (const coin of reward.coins) {
    const key = coordKey(coin.at);
    const list = coinsAt.get(key) ?? [];
    list.push(coin);
    coinsAt.set(key, list);
  }

  const collectedOneTime = new Set<string>();
  const visitedScenicKeys = new Set<string>();
  const totals = new Map<string, number>();
  const add = (label: string, points: number) => {
    if (points === 0) return;
    totals.set(label, (totals.get(label) ?? 0) + points);
  };

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const cur = path[i];
    const moved = prev.x !== cur.x || prev.y !== cur.y;
    if (!moved) continue; // "stay" — no cost, no pickup

    if (stepCost !== 0) add('Step cost', -stepCost);

    if (tileAt(cur.x, cur.y) === 'hazard') {
      if (hazardPenalty !== 0) add('Hazard', -hazardPenalty);
      continue;
    }

    for (const coin of coinsAt.get(coordKey(cur)) ?? []) {
      if (coin.oneTime) {
        if (collectedOneTime.has(coin.id)) continue;
        collectedOneTime.add(coin.id);
      }
      add(`Coin (${coin.value > 0 ? '+' : ''}${coin.value})`, coin.value);
    }

    if (tileAt(cur.x, cur.y) === 'scenic' && scenicBonus !== 0) {
      const sk = coordKey(cur);
      if (!visitedScenicKeys.has(sk)) {
        visitedScenicKeys.add(sk);
        add('Scenic bonus', scenicBonus);
      }
    }
  }

  return Array.from(totals.entries()).map(([label, points]) => ({ label, points }));
}

function classify(
  terminal: Terminal,
  path: Coord[],
  pointsBreakdown: { label: string; points: number }[],
  start: Coord
): SettledState {
  if (terminal === 'hazard') return 'hitHazard';
  if (terminal === 'exit') return 'reachedTarget';

  const neverMoved = path.every(p => p.x === start.x && p.y === start.y);
  if (neverMoved) return 'frozen';

  const total = pointsBreakdown.reduce((sum, item) => sum + item.points, 0);
  if (total > 0 && hasRepeatedPosition(path)) return 'looped';

  return 'wandered';
}

function hasRepeatedPosition(path: Coord[]): boolean {
  const seen = new Set<string>();
  for (const p of path) {
    const key = coordKey(p);
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Receipt
// ---------------------------------------------------------------------------

const VERDICTS: Record<SettledState, string> = {
  reachedTarget: 'Coda reached the exit — it followed the points straight there.',
  wandered: 'Coda wandered around. There was nothing worth chasing, so it had no reason to go anywhere in particular.',
  looped: "Coda kept looping back for more points instead of finishing — looping scored more than finishing did.",
  frozen: 'Coda stayed put. Every move would have lost points, so staying scored the most.',
  hitHazard: 'Coda walked straight into a hazard chasing points — it never weighed the danger, only the score.',
};

/**
 * Aggregates a run's point sources into itemized receipt lines + total + a
 * plain-language verdict, derived entirely from `runResult`.
 */
export function summarizeReceipt(runResult: RunResult): {
  lineItems: { label: string; points: number }[];
  total: number;
  verdict: string;
} {
  return {
    lineItems: runResult.pointsBreakdown,
    total: runResult.totalPoints,
    verdict: VERDICTS[runResult.settledState],
  };
}

// ---------------------------------------------------------------------------
// Thought bubble
// ---------------------------------------------------------------------------

/**
 * What Coda "sees" while it thinks — coins and reward terms only, never the
 * mission. Used to render the coins-only thought-bubble (PRD principle b).
 */
export function thoughtBubbleView(reward: RewardConfig): {
  coins: CoinPlacement[];
  stepCost?: number;
  scenicBonus?: number;
  hazardPenalty?: number;
} {
  return {
    coins: reward.coins,
    stepCost: reward.stepCost,
    scenicBonus: reward.scenicBonus,
    hazardPenalty: reward.hazardPenalty,
  };
}
