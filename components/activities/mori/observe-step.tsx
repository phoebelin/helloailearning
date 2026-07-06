'use client';

import { Button } from '@/components/ui/button';
import { MoriStepProps } from '@/types/mori-activity';
import { useMoriActivity } from '@/lib/context/mori-activity-context';
import { CreatureRenderer } from './creature-renderer';

export function ObserveStep({ onNext }: MoriStepProps) {
  const { currentLevel } = useMoriActivity();

  if (!currentLevel) return null;

  const yesCreatures = currentLevel.starterSet.filter(c => currentLevel.trueRule(c));
  const noCreatures  = currentLevel.starterSet.filter(c => !currentLevel.trueRule(c));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 pb-16 px-6 text-center">
      <div className="mb-2">
        <span className="text-xs font-semibold text-[#967FD8] uppercase tracking-widest">
          {currentLevel.title}
        </span>
      </div>
      <h1 className="text-3xl font-bold mb-2">Here&apos;s what Mori already knows</h1>
      <p className="text-fg-muted text-base mb-8 max-w-md">
        These creatures were shown to Mori. Some match its rule, some don&apos;t.
        What do you think the rule is?
      </p>

      {/* YES / NO columns */}
      <div className="flex gap-8 mb-10 flex-wrap justify-center">
        {/* YES column */}
        <div>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="w-3 h-3 rounded-full bg-[#4CAF50] inline-block" />
            <p className="text-sm font-bold text-positive uppercase tracking-wide">YES</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center max-w-[280px]">
            {yesCreatures.map(c => (
              <div
                key={c.id}
                className="flex flex-col items-center p-3 rounded-2xl bg-positive-muted border border-positive"
              >
                <CreatureRenderer creature={c} size={72} />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-fill self-stretch hidden sm:block" />

        {/* NO column */}
        <div>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="w-3 h-3 rounded-full bg-[#FF6B6B] inline-block" />
            <p className="text-sm font-bold text-critical uppercase tracking-wide">NO</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center max-w-[280px]">
            {noCreatures.map(c => (
              <div
                key={c.id}
                className="flex flex-col items-center p-3 rounded-2xl bg-critical-muted border border-critical"
              >
                <CreatureRenderer creature={c} size={72} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[#967FD8] font-medium max-w-sm mb-8 text-base italic">
        &ldquo;These match my rule… and these don&apos;t. What&apos;s my secret?&rdquo;
      </p>

      <Button
        onClick={onNext}
        className="text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Test your own creatures!
      </Button>
    </div>
  );
}
