'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { MissionCard } from './mission-card';
import { GridWorld } from './grid-world';

export function MissionStep({ onNext }: CodaStepProps) {
  const { currentLevel } = useCodaActivity();

  if (!currentLevel) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      {/* Mission card — the child's side */}
      <MissionCard
        missionText={currentLevel.missionText}
        levelTitle={currentLevel.title}
      />

      {/* Grid with ghost path — no coins yet */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          The world — dashed line shows your goal
        </p>
        <GridWorld
          grid={currentLevel.grid}
          ghostPath={currentLevel.intendedPath}
        />
        <p className="text-xs text-gray-400 max-w-xs text-center leading-relaxed">
          Coda can&rsquo;t see the dashed path. It only sees coins. On the next screen,
          you&rsquo;ll decide what Coda earns points for.
        </p>
      </div>

      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Set Coda&rsquo;s reward
      </Button>
    </div>
  );
}
