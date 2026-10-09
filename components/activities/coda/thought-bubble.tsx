'use client';

import type { RewardConfig } from '@/types/coda-activity';
import { thoughtBubbleView } from '@/lib/data/coda-planner';

interface ThoughtBubbleProps {
  reward: RewardConfig;
  mode: 'coins' | 'sliders';
}

const fmt = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;

/**
 * Coda's thought bubble — the ONLY thing Coda "sees". It is built from
 * `thoughtBubbleView`, which never includes the mission (PRD principle b).
 */
export function ThoughtBubble({ reward, mode }: ThoughtBubbleProps) {
  const view = thoughtBubbleView(reward);
  const coins = [...view.coins].sort((a, b) => b.value - a.value);
  const total = coins.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="relative" data-testid="thought-bubble">
      <div
        className="rounded-2xl p-4 text-left"
        style={{ backgroundColor: '#f3efff', border: '2px solid #d9cff5' }}
      >
        <p className="text-xs font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
          💭 What Coda sees
        </p>

        {mode === 'coins' ? (
          coins.length === 0 ? (
            <p className="text-sm text-fg-muted" data-testid="thought-bubble-empty">
              &ldquo;I don&rsquo;t see any points anywhere. Nothing is worth
              walking to!&rdquo;
            </p>
          ) : (
            <>
              <ul className="text-sm text-fg-muted space-y-1">
                {coins.map(c => (
                  <li key={c.id} className="flex justify-between gap-3">
                    <span>
                      🪙 square {c.at.x + 1} across, {c.at.y + 1} down
                    </span>
                    <span className="font-semibold text-[#967FD8]">{fmt(c.value)} pts</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-fg-subtle mt-2">
                Points on the board: <strong>{fmt(total)}</strong>
              </p>
            </>
          )
        ) : (
          <ul className="text-sm text-fg-muted space-y-1">
            <li className="flex justify-between gap-3">
              <span>🌿 Scenic tile bonus</span>
              <span className="font-semibold text-[#967FD8]">{fmt(view.scenicBonus ?? 0)} pts</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>👟 Every step costs</span>
              <span className="font-semibold text-[#967FD8]">{fmt(-(view.stepCost ?? 0))} pts</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>⚠️ Hazard tile costs</span>
              <span className="font-semibold text-[#967FD8]">
                {fmt(-(view.hazardPenalty ?? 0))} pts
              </span>
            </li>
          </ul>
        )}

        <p className="text-xs text-fg-subtle mt-2 italic">
          Coda sees points, not your mission.
        </p>
      </div>
      {/* bubble tail */}
      <div
        aria-hidden
        className="absolute -bottom-2 left-8 h-4 w-4 rotate-45"
        style={{ backgroundColor: '#f3efff', borderRight: '2px solid #d9cff5', borderBottom: '2px solid #d9cff5' }}
      />
    </div>
  );
}
