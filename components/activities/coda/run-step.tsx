'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { thoughtBubbleView } from '@/lib/data/coda-planner';
import { GridWorld } from './grid-world';

export function RunStep({ onNext }: CodaStepProps) {
  const { state, currentLevel, runAgentForLevel } = useCodaActivity();

  if (!currentLevel) return null;

  const thoughtBubble = thoughtBubbleView(state.workingReward);

  const handleRun = () => {
    runAgentForLevel();
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ready to run!</h1>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
          Coda will chase the highest-scoring path it can find.
          Its thought bubble shows only coins — no mission, no map.
        </p>
      </div>

      {/* Grid showing current reward setup (no ghost path — focus on the reward) */}
      <GridWorld
        grid={currentLevel.grid}
        coins={state.workingReward.coins}
      />

      {/* Thought bubble */}
      <div
        className="w-full max-w-sm rounded-2xl p-4 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-xs font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
          Coda&rsquo;s thought bubble
        </p>
        {thoughtBubble.coins.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Nothing worth chasing — Coda will wander.
          </p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {thoughtBubble.coins.map(c => (
              <li key={c.id} className="flex gap-2">
                <span className="text-[#967FD8] font-bold">+{c.value} pts</span>
                <span className="text-gray-500">
                  at ({c.at.x}, {c.at.y})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        onClick={handleRun}
        className="bg-black text-white hover:bg-black/90 text-base px-10 py-3"
        style={{ borderRadius: '12px' }}
      >
        Run Coda →
      </Button>
    </div>
  );
}
