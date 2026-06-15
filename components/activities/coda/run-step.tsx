'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { thoughtBubbleView } from '@/lib/data/coda-planner';

export function RunStep({ onNext }: CodaStepProps) {
  const { state, runAgentForLevel } = useCodaActivity();

  const handleRun = () => {
    runAgentForLevel();
    onNext();
  };

  const thoughtBubble = thoughtBubbleView(state.workingReward);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Coda is thinking...</h1>
      <p className="text-gray-600 max-w-md mb-8 text-lg">
        Coda only thinks about points. Here&apos;s what&apos;s in its head right now —
        no mission, no map, just coins and scores.
      </p>

      <div
        className="max-w-md w-full rounded-2xl p-6 mb-10 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm font-bold text-[#967FD8] mb-3">Coda&apos;s thought bubble</p>
        {thoughtBubble.coins.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nothing worth chasing.</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {thoughtBubble.coins.map(c => (
              <li key={c.id}>+{c.value} points at ({c.at.x}, {c.at.y})</li>
            ))}
          </ul>
        )}
      </div>

      <Button
        onClick={handleRun}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Run Coda
      </Button>
    </div>
  );
}
