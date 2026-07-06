'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter, PippyExpression } from './pippy-character';
import { QuizCards } from './quiz-cards';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';
import { classifyAnimal } from '@/lib/data/pippy-prediction';
import { getExpectedVerdict } from '@/lib/data/pippy-levels';

interface ObserveMistakeStepProps {
  onNext: () => void;
}

// Step 2 (the hook): Pippy takes a quiz on new animals it was never trained on.
// Some are clearly wrong → motivates the child to investigate.

export function ObserveMistakeStep({ onNext }: ObserveMistakeStepProps) {
  const { state, currentLevel } = usePippyActivity();
  const [revealed, setRevealed] = useState(false);

  if (!currentLevel) return null;

  const wrongCount = currentLevel.testAnimals.filter(animal => {
    const result = classifyAnimal(animal, state.originalNest);
    return result.verdict !== getExpectedVerdict(animal, currentLevel);
  }).length;

  const expression: PippyExpression = revealed
    ? wrongCount > 0 ? 'confused' : 'happy'
    : 'thinking';

  const speech = revealed
    ? wrongCount > 0
      ? `Wait… I got ${wrongCount} of those wrong! Why did I guess that?`
      : 'I got them all right!'
    : "Watch me take a quiz on animals I've never seen before!";

  const categoryPhrase =
    currentLevel.targetCategoryLabel === 'CATS'
      ? 'a cat'
      : currentLevel.targetCategoryLabel === 'OCEAN ANIMALS'
      ? 'an ocean animal'
      : 'a night animal';

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">Watch Pippy Take a Quiz</h1>

      <p className="text-fg-muted text-sm text-center max-w-md">
        These are brand-new animals Pippy was <strong>never trained on</strong>.
        Watch what Pippy guesses for each one.
      </p>

      <PippyCharacter expression={expression} speech={speech} size={130} />

      <QuizCards
        animals={currentLevel.testAnimals}
        trainingSet={state.originalNest}
        level={currentLevel}
        autoReveal={false}
        revealDelayMs={500}
        onAllRevealed={() => setRevealed(true)}
      />

      {revealed && wrongCount > 0 && (
        <div className="bg-brand-muted border border-brand rounded-xl p-4 text-sm text-fg-muted text-center max-w-md">
          <p className="font-semibold text-brand mb-1">
            Pippy got {wrongCount} wrong!
          </p>
          <p>
            This is clearly {categoryPhrase} — but Pippy said NO. Is Pippy{' '}
            <span className="line-through text-fg-subtle">broken</span>? Or did it
            learn something wrong? Let&rsquo;s investigate.
          </p>
        </div>
      )}

      {revealed && (
        <Button
          onClick={onNext}
          className="text-base px-8 py-3 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          See what Pippy learned from
        </Button>
      )}
    </div>
  );
}
