'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter, PippyExpression } from './pippy-character';
import { ConveyorBelt, examplesToBeltItems } from './conveyor-belt';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';

interface InvestigateTrainingStepProps {
  onNext: () => void;
}

// Step 3: Investigation — open what Pippy learned from.
// Framed as finding the cause, not a passive tour. Belt shows training examples with
// labels pre-attached (they were *given*, not decided by Pippy).
// No discovery MCQ — the category was stated up front in Step 1.

export function InvestigateTrainingStep({ onNext }: InvestigateTrainingStepProps) {
  const { state, currentLevel } = usePippyActivity();
  const [beltDone, setBeltDone] = useState(false);
  const [runKey, setRunKey] = useState(0);

  if (!currentLevel) return null;

  const items = examplesToBeltItems(state.workingNest);
  const expression: PippyExpression = beltDone ? 'confused' : 'thinking';
  const speech = beltDone
    ? "These are the examples I learned from. If any label is wrong, I'll have learned wrong."
    : "Here are all the animals I studied — each one already labeled YES or NO…";

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 max-w-5xl mx-auto gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">What Pippy Learned From</h1>

      <p className="text-gray-600 text-center max-w-lg leading-relaxed text-sm">
        Pippy doesn&rsquo;t really &ldquo;know&rdquo; what {currentLevel.targetCategoryLabel.toLowerCase()} are.
        It only has these labeled examples. The mistake is hiding in here.
      </p>

      <PippyCharacter expression={expression} speech={speech} size={130} />

      <div className="w-full">
        <ConveyorBelt
          key={runKey}
          items={items}
          startLabel="Look at Pippy's examples ▶"
          beltDuration={600}
          sortDuration={900}
          gapDuration={200}
          onComplete={() => setBeltDone(true)}
        />
      </div>

      {beltDone && (
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-gray-700 text-center max-w-md">
            <p className="font-semibold text-yellow-700 mb-1">🥚 One of these is a bad egg!</p>
            <p>
              Somewhere in Pippy&rsquo;s training data is a mislabeled animal — an animal that was
              given the wrong YES/NO label. That one wrong label is causing all the mistakes.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setBeltDone(false); setRunKey(k => k + 1); }}
              className="text-sm px-5 min-h-[44px]"
              style={{ borderRadius: '12px' }}
            >
              ↺ Replay
            </Button>
            <Button
              onClick={onNext}
              className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 min-h-[44px]"
              style={{ borderRadius: '12px' }}
            >
              Find the bad egg
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
