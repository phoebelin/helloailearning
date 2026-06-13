'use client';

import { Button } from '@/components/ui/button';
import { MoriStepProps } from '@/types/mori-activity';
import { useMoriActivity } from '@/lib/context/mori-activity-context';
import { LEVELS } from '@/lib/data/mori-levels';
import { CreatureRenderer } from './creature-renderer';
import Image from 'next/image';

export function LevelComplete({ onNext }: MoriStepProps) {
  const { state, currentLevel, advanceLevel, exitSession } = useMoriActivity();

  if (!currentLevel) return null;

  const isLastLevel = state.currentLevelIndex >= LEVELS.length - 1;
  const isLevel4 = currentLevel.index === 4;

  const yesCreatures = currentLevel.starterSet.filter(c => currentLevel.trueRule(c));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      {/* Celebration */}
      <div className="text-5xl mb-4 animate-bounce">🎉</div>
      <Image
        src="/images/mori-course.png"
        alt="Mori celebrating"
        width={120}
        height={120}
        className="mb-4 object-contain"
      />
      <h1 className="text-4xl font-bold mb-2">You cracked it!</h1>
      <p className="text-gray-600 text-lg mb-6">
        Mori&apos;s rule was:{' '}
        <span className="font-bold text-black">{currentLevel.trueRuleLabel}</span>
      </p>

      {/* How Mori Found the Pattern */}
      <div
        className="max-w-lg rounded-2xl p-6 mb-6 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm font-bold text-[#967FD8] mb-3">
          How Mori Found the Pattern
        </p>

        {/* Highlight YES creatures + attended features */}
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          {yesCreatures.map(c => (
            <CreatureRenderer
              key={c.id}
              creature={c}
              size={64}
              highlightFeatures={currentLevel.attendedFeatures}
            />
          ))}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">{currentLevel.explanation}</p>

        {/* Level 4 proxy reveal */}
        {isLevel4 && currentLevel.proxyExplanation && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-bold text-amber-800 mb-1">⚠️ The Big Twist</p>
            <p className="text-sm text-amber-900 leading-relaxed">
              {currentLevel.proxyExplanation}
            </p>
          </div>
        )}

        <p className="text-xs text-[#7c6bc7] mt-4 italic">
          Mori found which feature mattered by comparing examples — that&apos;s exactly how AI recognizes things.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 text-sm text-gray-500">
        <span>
          Creatures tested: <span className="font-semibold text-black">{state.testedCreatures.length}</span>
        </span>
        <span>
          Levels solved: <span className="font-semibold text-black">{state.levelsCompletedThisSession.length}</span>
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {!isLastLevel ? (
          <Button
            onClick={() => { advanceLevel(); onNext(); }}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            Next level!
          </Button>
        ) : (
          <Button
            onClick={exitSession}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            See your summary
          </Button>
        )}
        <Button
          onClick={exitSession}
          variant="outline"
          className="text-base px-8 py-3"
          style={{ borderRadius: '12px' }}
        >
          I&apos;m done for now
        </Button>
      </div>
    </div>
  );
}
