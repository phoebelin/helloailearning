'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { CodaStepProps, Coord, CoinPlacement } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { thoughtBubbleView } from '@/lib/data/coda-planner';
import { GridWorld } from './grid-world';
import { CodaExpression } from './coda-character';
import { CoinTray } from './coin-tray';
import { RewardSliders } from './reward-sliders';
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
  const [activeDragValue, setActiveDragValue] = useState<number | null>(null);
  const [codaAnimPos, setCodaAnimPos] = useState<Coord | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const startCoord = useMemo(() => {
    if (!currentLevel) return null;
    for (let y = 0; y < currentLevel.grid.length; y++) {
      for (let x = 0; x < currentLevel.grid[y].length; x++) {
        if (currentLevel.grid[y][x] === 'start') return { x, y };
      }
    }
    return null;
  }, [currentLevel]);

  useEffect(() => {
    if (!state.lastRun) {
      setCodaAnimPos(null);
      setIsAnimating(false);
      return;
    }
    const path = state.lastRun.path;
    if (!path || path.length === 0) return;
    setIsAnimating(true);
    const posTimers = path.map((pos, i) =>
      setTimeout(() => setCodaAnimPos(pos), i * 350)
    );
    const doneTimer = setTimeout(() => setIsAnimating(false), path.length * 350 + 150);
    return () => {
      posTimers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [state.lastRun]);

  if (!currentLevel) return null;

  const { coins } = state.workingReward;
  const hasRun = state.lastRun !== null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragValue((event.active.data.current?.value as number) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragValue(null);
    if (!over || hasRun) return;
    const value = active.data.current?.value as number | undefined;
    const coord = over.data.current?.coord as Coord | undefined;
    if (value == null || !coord) return;
    const existing = coins.find(c => c.at.x === coord.x && c.at.y === coord.y);
    if (existing) {
      removeCoin(existing.id);
    } else {
      placeCoin({ id: nextCoinId(), at: coord, value, oneTime: true } satisfies CoinPlacement);
    }
  };

  // Fallback: click-to-select + click-tile for keyboard/accessibility users
  const handleTileClick = (coord: Coord) => {
    if (hasRun) return;
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

  function getCodaExpression(): CodaExpression {
    if (!hasRun) return 'idle';
    if (isAnimating) return 'moving';
    const settled = state.lastRun?.settledState;
    if (settled === 'reachedTarget') return 'happy';
    if (settled === 'frozen') return 'frozen';
    return 'confused';
  }
  const codaExpression = getCodaExpression();

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
              {hasRun ? "Where Coda went" : "Drag coins onto the grid"}
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
              droppable={!hasRun}
              codaPos={hasRun ? (codaAnimPos ?? undefined) : (startCoord ?? undefined)}
              codaExpression={codaExpression}
            />
            {!hasRun && currentLevel.rewardInputMode === 'coins' && coins.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center">
                No coins placed — Coda has nothing to chase.
              </p>
            )}
          </div>

          {/* Right: reward controls (pre-run) or receipt (post-run) */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {!hasRun ? (
              <>
                {currentLevel.rewardInputMode === 'sliders' ? (
                  <>
                    <RewardSliders disabled={false} />

                    {/* Slider thought bubble */}
                    {(thoughtBubble.scenicBonus !== undefined ||
                      thoughtBubble.stepCost !== undefined ||
                      thoughtBubble.hazardPenalty !== undefined) && (
                      <div
                        className="rounded-xl p-4 text-left"
                        style={{ backgroundColor: '#f3efff' }}
                      >
                        <p className="text-xs font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
                          Coda&rsquo;s thought bubble
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li className="flex justify-between">
                            <span className="text-gray-500">🌿 Scenic bonus</span>
                            <span className="font-semibold text-[#967FD8]">
                              {(thoughtBubble.scenicBonus ?? 0) > 0 ? '+' : ''}
                              {thoughtBubble.scenicBonus ?? 0} pts
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">👟 Step cost</span>
                            <span className="font-semibold text-[#967FD8]">
                              -{thoughtBubble.stepCost ?? 0} pts
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">⚠️ Hazard penalty</span>
                            <span className="font-semibold text-[#967FD8]">
                              -{thoughtBubble.hazardPenalty ?? 0} pts
                            </span>
                          </li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-2 italic">
                          Coda sees these numbers, not your mission.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <CoinTray
                      selectedValue={selectedValue}
                      onSelectValue={setSelectedValue}
                      disabled={false}
                    />

                    {/* Coin thought bubble */}
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
                  </>
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

      {/* Floating ghost coin shown while dragging */}
      <DragOverlay>
        {activeDragValue !== null ? (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#FCD34D',
              border: '3px solid #F59E0B',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
              cursor: 'grabbing',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#78350F', lineHeight: 1 }}>
              {activeDragValue}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              pts
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
