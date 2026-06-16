'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CodaStepProps, Coord } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { GridWorld } from './grid-world';
import { CoinTray } from './coin-tray';

let coinSeq = 0;
function nextCoinId() {
  return `coin-${++coinSeq}`;
}

export function SetRewardStep({ onNext }: CodaStepProps) {
  const { state, currentLevel, placeCoin, removeCoin } = useCodaActivity();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  if (!currentLevel) return null;

  const { coins } = state.workingReward;

  const handleTileClick = (coord: Coord) => {
    // If there's already a coin here, remove it (toggle off)
    const existing = coins.find(c => c.at.x === coord.x && c.at.y === coord.y);
    if (existing) {
      removeCoin(existing.id);
      return;
    }
    // Place a coin only if a value is selected
    if (selectedValue === null) return;
    placeCoin({
      id: nextCoinId(),
      at: coord,
      value: selectedValue,
      oneTime: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Give Coda a reward</h1>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
          Coda will chase whatever earns the most points.
          Select a coin value below, then tap a tile to place it —
          tap a placed coin to remove it.
        </p>
      </div>

      {/* Grid */}
      <div className="flex flex-col items-center gap-3">
        <GridWorld
          grid={currentLevel.grid}
          coins={coins}
          ghostPath={currentLevel.intendedPath}
          onTileClick={handleTileClick}
        />
        {coins.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            No coins placed — Coda has nothing to chase.
          </p>
        )}
      </div>

      {/* Coin tray */}
      <CoinTray
        selectedValue={selectedValue}
        onSelectValue={setSelectedValue}
      />

      {/* Current reward summary */}
      {coins.length > 0 && (
        <div
          className="w-full max-w-sm rounded-xl p-4 text-left"
          style={{ backgroundColor: '#f3efff' }}
        >
          <p className="text-xs font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
            Coda&rsquo;s reward (what it sees)
          </p>
          <ul className="text-sm text-gray-700 space-y-1">
            {coins.map(c => (
              <li key={c.id} className="flex justify-between">
                <span>
                  Coin at ({c.at.x}, {c.at.y})
                </span>
                <span className="font-semibold text-[#967FD8]">+{c.value} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-10 py-3"
        style={{ borderRadius: '12px' }}
      >
        Run Coda
      </Button>
    </div>
  );
}
