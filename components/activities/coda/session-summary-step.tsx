'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { useRouter } from 'next/navigation';
import { CODA_LEVELS } from '@/lib/data/coda-levels';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SessionSummaryStep({ onNext }: CodaStepProps) {
  const { state, resetActivity } = useCodaActivity();
  const router = useRouter();

  const levelsSolvedThisSession = state.levelsCompletedThisSession.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="text-5xl mb-4">🤖</p>
      <h1 className="text-4xl font-bold mb-4">Great work, reward designer!</h1>

      <div
        className="max-w-sm rounded-2xl p-6 mb-6 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm text-gray-600 mb-2">
          Levels solved this session:{' '}
          <span className="font-bold text-black">{levelsSolvedThisSession} / {CODA_LEVELS.length}</span>
        </p>
        <p className="text-sm text-gray-600">
          Highest level reached:{' '}
          <span className="font-bold text-black">Level {state.highestLevelReached}</span>
        </p>
      </div>

      <p className="text-[#967FD8] font-medium max-w-sm mb-2 text-base italic">
        &ldquo;I only ever did what scored the most points — that was your job to shape, not mine.&rdquo;
      </p>

      <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
        AI systems chase whatever they&apos;re rewarded for — not what you meant.
        Designing the reward well is part of designing the AI.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <Button
          onClick={resetActivity}
          className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
          style={{ borderRadius: '12px' }}
        >
          Keep playing
        </Button>
        <Button
          onClick={() => router.push('/courses')}
          variant="outline"
          className="text-base px-8 py-3"
          style={{ borderRadius: '12px' }}
        >
          Back to activities
        </Button>
      </div>
    </div>
  );
}
