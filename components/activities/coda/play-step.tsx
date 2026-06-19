'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CodaStepProps, Coord } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { thoughtBubbleView } from '@/lib/data/coda-planner';
import { GridWorld } from './grid-world';
import { CoinTray } from './coin-tray';
import { MissionCard } from './mission-card';
import { ReceiptPanel } from './receipt-panel';

let coinSeq = 0;
function nextCoinId() {
  return `coin-${++coinSeq}`;
}

export function PlayStep({ onNext }: CodaStepProps) {
  const {
    state,
    currentLevel,
    placeCoin,
    removeCoin,
    runAgentForLevel,
    resetRewardForLevel,
    matchesCurrentTarget,
  } = useCodaActivity();

  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  if (!currentLevel) return null;

  const { coins } = state.workingReward;
  const hasRun = state.lastRun !== null;

  const handleTileClick = (coord: Coord) => {
    if (hasRun) return; // grid is locked while receipt is showing
    const existing = coins.find(c => c.at.x === coord.x && c.at.y === coord.y);
    if (existing) {
      removeCoin(existing.id);
      return;
    }
    if (selectedValue === null) return;
    placeCoin({
      id: nextCoinId(),
      at: coord,
      value: selectedValue,
      oneTime: true,
    });
  };

  const handleRun = () => {
    runAgentForLevel();
  };

  const handleRetune = () => {
    resetRewardForLevel();
    setSelectedValue(null);
  };

  const thoughtBubble = thoughtBubbleView(state.workingReward);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      {/* Mission reminder (contrast: child's side) */}
      <div className="w-full max-w-2xl">
        <MissionCard missionText={currentLevel.missionText} />
      </div>

      {/* Main play surface */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-2xl">

        {/* Left: grid */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">
            {hasRun ? "Where Coda went" : "Place coins on the grid"}
          </p>
          {hasRun && (
            <div className="flex gap-4 text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 3,
                    border: '2px dashed rgba(150,127,216,0.7)',
                    borderRadius: 2,
                  }}
                />
                Goal path
              </span>
              <span className="flex items-center gap-1">
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 3,
                    background: '#1d4ed8',
                    borderRadius: 2,
                    opacity: 0.7,
                  }}
                />
                Coda&rsquo;s path
              </span>
            </div>
          )}
          <GridWorld
            grid={currentLevel.grid}
            coins={coins}
            ghostPath={currentLevel.intendedPath}
            runPath={hasRun ? (state.lastRun?.path ?? []) : []}
            onTileClick={!hasRun ? handleTileClick : undefined}
          />
          {!hasRun && coins.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center">
              No coins placed — Coda has nothing to chase.
            </p>
          )}
        </div>

        {/* Right: coin tray (pre-run) or receipt (post-run) */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {!hasRun ? (
            <>
              <CoinTray
                selectedValue={selectedValue}
                onSelectValue={setSelectedValue}
                disabled={false}
              />

              {/* Thought bubble */}
              {coins.length > 0 && (
                <div
                  className="rounded-xl p-4 text-left"
                  style={{ backgroundColor: '#f3efff' }}
                >
                  <p className="text-xs font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
                    Coda&rsquo;s thought bubble
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {thoughtBubble.coins.map(c => (
                      <li key={c.id} className="flex justify-between">
                        <span className="text-gray-500">
                          at ({c.at.x}, {c.at.y})
                        </span>
                        <span className="font-semibold text-[#967FD8]">
                          {c.value > 0 ? '+' : ''}{c.value} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-2 italic">
                    Coda sees points, not your mission.
                  </p>
                </div>
              )}

              <Button
                onClick={handleRun}
                className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 w-full"
                style={{ borderRadius: '12px' }}
              >
                Run Coda →
              </Button>
            </>
          ) : (
            <>
              <ReceiptPanel runResult={state.lastRun!} />

              {state.runCountThisLevel > 1 && (
                <p className="text-xs text-gray-400 text-center">
                  Run {state.runCountThisLevel} of this level
                </p>
              )}

              {matchesCurrentTarget ? (
                <Button
                  onClick={onNext}
                  className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 w-full"
                  style={{ borderRadius: '12px' }}
                >
                  Coda made it! Continue →
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleRetune}
                    className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 w-full"
                    style={{ borderRadius: '12px' }}
                  >
                    Re-tune the reward
                  </Button>
                  {state.runCountThisLevel >= 3 && (
                    <p className="text-xs text-[#967FD8] text-center leading-relaxed">
                      Hint: think about where the points actually are — not where you
                      want Coda to go, but what earns the most points.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
