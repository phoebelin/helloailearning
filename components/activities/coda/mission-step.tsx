'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';

export function MissionStep({ onNext }: CodaStepProps) {
  const { currentLevel } = useCodaActivity();

  if (!currentLevel) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="text-sm font-bold text-[#967FD8] mb-2 uppercase tracking-wide">
        {currentLevel.title} — Your mission
      </p>
      <h1 className="text-4xl font-bold mb-6">{currentLevel.missionText}</h1>

      <div
        className="max-w-md rounded-2xl p-6 mb-10 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-gray-700 text-sm leading-relaxed">
          Coda doesn&apos;t know this mission. It only knows points. On the next screen,
          you&apos;ll decide what Coda earns points for — and that decision is the only
          way to tell it what you want.
        </p>
      </div>

      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Set Coda&apos;s reward
      </Button>
    </div>
  );
}
