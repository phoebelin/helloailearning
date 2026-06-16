'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { CODA_LEVELS } from '@/lib/data/coda-levels';

export function LevelComplete({ onNext }: CodaStepProps) {
  const { state, currentLevel, advanceLevel } = useCodaActivity();

  if (!currentLevel) return null;

  const isLastLevel = state.currentLevelIndex >= CODA_LEVELS.length - 1;

  const handleContinue = () => {
    advanceLevel();
    // Last level: advanceLevel() switches currentStep to 'session-summary', which
    // renders in this same scroll section — no further navigation needed.
    if (!isLastLevel) onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="text-5xl mb-4 animate-bounce">🎉</div>
      <Image
        src="/images/coda.png"
        alt="Coda celebrating"
        width={120}
        height={120}
        className="mb-4 object-contain"
      />
      <h1 className="text-4xl font-bold mb-2">Coda reached the goal!</h1>

      <div
        className="max-w-lg rounded-2xl p-6 mb-8 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm font-bold text-[#967FD8] mb-3">What just happened</p>
        <p className="text-gray-700 text-sm leading-relaxed">{currentLevel.takeaway}</p>
      </div>

      <div className="flex gap-6 mb-8 text-sm text-gray-500">
        <span>
          Runs this level: <span className="font-semibold text-black">{state.runCountThisLevel}</span>
        </span>
        <span>
          Levels solved: <span className="font-semibold text-black">{state.levelsCompletedThisSession.length}</span>
        </span>
      </div>

      <Button
        onClick={handleContinue}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Continue
      </Button>
    </div>
  );
}
