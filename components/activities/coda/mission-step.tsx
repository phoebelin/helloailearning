'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { MissionCard } from './mission-card';
import { GridWorld } from './grid-world';

export function MissionStep({ onNext }: CodaStepProps) {
  const { currentLevel } = useCodaActivity();
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(64);

  const cols = currentLevel?.grid[0]?.length ?? 4;
  const updateTileSize = useCallback(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const available = el.clientWidth;
    const gapTotal = 4 * (cols - 1);
    const computed = Math.floor((available - gapTotal) / cols);
    setTileSize(Math.max(44, Math.min(computed, 80)));
  }, [cols]);

  useEffect(() => {
    updateTileSize();
    if (!gridContainerRef.current) return;
    const observer = new ResizeObserver(updateTileSize);
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, [updateTileSize]);

  if (!currentLevel) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 gap-6 sm:gap-8">
      {/* Mission card — the child's side */}
      <MissionCard
        missionText={currentLevel.missionText}
        levelTitle={currentLevel.title}
      />

      {/* Grid with ghost path — no coins yet */}
      <div ref={gridContainerRef} className="flex flex-col items-center gap-3 w-full max-w-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">
          The world — dashed line shows your goal
        </p>
        <GridWorld
          grid={currentLevel.grid}
          ghostPath={currentLevel.intendedPath}
          tileSize={tileSize}
        />
        <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
          Coda can&rsquo;t see the dashed path. It only sees coins. On the next screen,
          you&rsquo;ll decide what Coda earns points for.
        </p>
      </div>

      <Button
        onClick={onNext}
        className="text-base px-8 py-3 min-h-[44px] w-full max-w-xs"
        style={{ borderRadius: '12px' }}
      >
        Set Coda&rsquo;s reward
      </Button>
    </div>
  );
}
