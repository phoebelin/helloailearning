'use client';

import { Button } from '@/components/ui/button';
import { MoriStepProps } from '@/types/mori-activity';
import { useMoriActivity } from '@/lib/context/mori-activity-context';
import { useRouter } from 'next/navigation';
import { LEVELS } from '@/lib/data/mori-levels';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SessionSummaryStep({ onNext }: MoriStepProps) {
  const { state, resetActivity } = useMoriActivity();
  const router = useRouter();

  const levelsSolvedThisSession = state.levelsCompletedThisSession.length;
  const reachedLevel4 = state.highestLevelReached >= 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="text-5xl mb-4">🕵️</p>
      <h1 className="text-4xl font-bold mb-4">Great work, pattern detective!</h1>

      {/* Stats */}
      <div
        className="max-w-sm rounded-2xl p-6 mb-6 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm text-fg-muted mb-2">
          Levels solved this session:{' '}
          <span className="font-bold text-black">{levelsSolvedThisSession} / {LEVELS.length}</span>
        </p>
        <p className="text-sm text-fg-muted mb-2">
          Highest level reached:{' '}
          <span className="font-bold text-black">Level {state.highestLevelReached}</span>
        </p>
        <p className="text-sm text-fg-muted">
          Creatures tested:{' '}
          <span className="font-bold text-black">{state.testedCreatures.length}</span>
        </p>
      </div>

      {/* Mori's closing */}
      <p className="text-[#967FD8] font-medium max-w-sm mb-2 text-base italic">
        &ldquo;You found patterns the way an AI does — by testing and comparing, not by being told!&rdquo;
      </p>

      {/* Learning recap */}
      <p className="text-fg-muted text-sm max-w-md mb-4 leading-relaxed">
        AI recognizes things by finding patterns in features across examples.
      </p>
      {reachedLevel4 && (
        <p className="text-fg-muted text-sm max-w-md mb-8 leading-relaxed font-medium">
          And remember Level 4 — a pattern is only as good as the examples it learned from.
          Narrow or biased examples lead to the wrong pattern.
        </p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <Button
          onClick={resetActivity}
          className="text-base px-8 py-3"
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
