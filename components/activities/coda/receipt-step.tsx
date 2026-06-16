'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { ReceiptPanel } from './receipt-panel';
import { GridWorld } from './grid-world';

export function ReceiptStep({ onNext }: CodaStepProps) {
  const { state, currentLevel, matchesCurrentTarget, resetRewardForLevel, goToStep } = useCodaActivity();

  if (!state.lastRun || !currentLevel) return null;

  const handleTryAgain = () => {
    resetRewardForLevel();
    goToStep('set-reward');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-3xl font-bold text-center">Coda&rsquo;s receipt</h1>

      {/* Side-by-side on wider screens, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-2xl">
        {/* Grid showing ghost path vs actual run path */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">
            Where Coda went
          </p>
          <div className="flex gap-4 text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1">
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 3,
                  background: '#967FD8',
                  borderRadius: 2,
                  opacity: 0.5,
                  borderTop: '2px dashed #967FD8',
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
                  opacity: 0.6,
                }}
              />
              Coda&rsquo;s path
            </span>
          </div>
          <GridWorld
            grid={currentLevel.grid}
            coins={state.workingReward.coins}
            ghostPath={currentLevel.intendedPath}
            runPath={state.lastRun.path}
            tileSize={56}
          />
        </div>

        {/* Receipt panel */}
        <ReceiptPanel runResult={state.lastRun} />
      </div>

      {/* Runs this level */}
      {state.runCountThisLevel > 1 && (
        <p className="text-xs text-gray-400">
          Run {state.runCountThisLevel} of this level
        </p>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {matchesCurrentTarget ? (
          <Button
            onClick={onNext}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            Coda made it! Continue →
          </Button>
        ) : (
          <>
            <Button
              onClick={handleTryAgain}
              className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
              style={{ borderRadius: '12px' }}
            >
              Re-tune the reward
            </Button>
            {state.runCountThisLevel >= 3 && (
              <p className="text-xs text-[#967FD8] text-center leading-relaxed">
                Hint: think about what Coda earns points for — not just where you want it to go,
                but where the points actually are.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
