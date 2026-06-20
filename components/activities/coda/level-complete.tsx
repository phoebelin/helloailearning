'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CodaStepProps, SettledState } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { CODA_LEVELS } from '@/lib/data/coda-levels';
import { summarizeReceipt } from '@/lib/data/coda-planner';
import { Celebration } from '@/components/activities/shared/celebration';
import { GridWorld } from './grid-world';

const OUTCOME_LABEL: Record<SettledState, string> = {
  wandered: 'Coda wandered aimlessly',
  looped: 'Coda looped forever',
  frozen: 'Coda refused to move',
  hitHazard: 'Coda hit a hazard',
  reachedTarget: 'Coda reached the goal!',
};

export function LevelComplete({ onNext }: CodaStepProps) {
  const { state, currentLevel, advanceLevel, goToStep } = useCodaActivity();

  if (!currentLevel) return null;

  const isLastLevel = state.currentLevelIndex >= CODA_LEVELS.length - 1;
  const showComparison =
    state.firstRun !== null &&
    state.lastRun !== null &&
    state.runCountThisLevel > 1;

  const handleContinue = () => {
    advanceLevel();
    if (!isLastLevel) onNext();
  };

  const handleEndSession = () => {
    advanceLevel();
    goToStep('session-summary');
  };

  return (
    <>
      {/* Confetti fires once per level-complete (key forces remount per level) */}
      <Celebration key={`celebration-${state.currentLevelIndex}`} active duration={3000} />

      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-3 animate-bounce">🎉</div>
        <Image
          src="/images/coda.png"
          alt="Coda celebrating"
          width={100}
          height={100}
          className="mb-4 object-contain"
        />
        <h1 className="text-4xl font-bold mb-6">Coda reached the goal!</h1>

        {/* What-changed comparison panel */}
        {showComparison ? (
          <div className="w-full max-w-2xl mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
              What changed
            </p>
            <div className="flex flex-row gap-4 items-start justify-center">
              {/* First attempt */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  First try
                </p>
                <GridWorld
                  grid={currentLevel.grid}
                  ghostPath={currentLevel.intendedPath}
                  runPath={state.firstRun!.path}
                  tileSize={44}
                />
                <p className="text-xs font-semibold text-red-500 mt-1 max-w-[130px]">
                  {OUTCOME_LABEL[state.firstRun!.settledState]}
                </p>
                <p className="text-xs text-gray-400">
                  {state.firstRun!.totalPoints} pts total
                </p>
                <p className="text-xs text-gray-400 max-w-[140px] leading-relaxed">
                  {summarizeReceipt(state.firstRun!).verdict}
                </p>
              </div>

              <div className="text-2xl text-gray-300 self-center mt-12">→</div>

              {/* Winning run */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  What worked
                </p>
                <GridWorld
                  grid={currentLevel.grid}
                  ghostPath={currentLevel.intendedPath}
                  runPath={state.lastRun!.path}
                  tileSize={44}
                />
                <p className="text-xs font-semibold text-green-600 mt-1 max-w-[130px]">
                  Coda reached the goal!
                </p>
                <p className="text-xs text-gray-400">
                  {state.lastRun!.totalPoints} pts total
                </p>
                <p className="text-xs text-gray-400 max-w-[140px] leading-relaxed">
                  {summarizeReceipt(state.lastRun!).verdict}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Single-attempt success — no comparison needed */
          <p className="text-gray-500 text-sm mb-6">
            You nailed it on the first try!
          </p>
        )}

        {/* Takeaway */}
        <div
          className="max-w-lg rounded-2xl p-6 mb-6 text-left"
          style={{ backgroundColor: '#f3efff' }}
        >
          <p className="text-sm font-bold text-[#967FD8] mb-3">What just happened</p>
          <p className="text-gray-700 text-sm leading-relaxed">{currentLevel.takeaway}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 text-sm text-gray-500">
          <span>
            Runs this level:{' '}
            <span className="font-semibold text-black">{state.runCountThisLevel}</span>
          </span>
          <span>
            Levels solved:{' '}
            <span className="font-semibold text-black">
              {state.levelsCompletedThisSession.length}
            </span>
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={handleContinue}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            {isLastLevel ? 'See your results →' : 'Next level! →'}
          </Button>
          {!isLastLevel && (
            <Button
              onClick={handleEndSession}
              variant="outline"
              className="text-base px-8 py-3"
              style={{ borderRadius: '12px' }}
            >
              I&apos;m done for now
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
