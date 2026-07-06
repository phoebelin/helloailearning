'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PippyCharacter, PippyExpression } from './pippy-character';
import { NestInspector } from './nest-inspector';
import { ConfidenceMeter } from './confidence-meter';
import { TrainingTimeline } from './training-timeline';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';
import { classifyAnimal, classifyBatch, computeAccuracy, getNearestNeighbors } from '@/lib/data/pippy-prediction';
import { getExpectedVerdicts } from '@/lib/data/pippy-levels';
import { TrainingExample, PippyLevel } from '@/types/pippy-activity';
import { Animal } from '@/lib/data/animals';

interface InspectFixStepProps {
  onCheckBatch: () => void;
}

const HINTS = [
  "Look for an animal whose label seems obviously wrong.",
  "Focus on the animal Pippy got most wrong — what's its nearest training neighbor?",
  "The bad egg has the same features as the missed animal but the wrong label.",
  "Try 'Why did Pippy guess that?' on a wrong guess — the bad egg hides among the nearest neighbors.",
];

// ---------- Why did Pippy guess that? panel ----------

function WhyPanel({
  testAnimals,
  workingNest,
  level,
}: {
  testAnimals: Animal[];
  workingNest: TrainingExample[];
  level: PippyLevel;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const expected = getExpectedVerdicts(testAnimals, level);

  const missedAnimals = testAnimals.filter(animal => {
    const r = classifyAnimal(animal, workingNest);
    return r.verdict !== expected[animal.id];
  });

  if (missedAnimals.length === 0) return null;

  const selectedAnimal = missedAnimals.find(a => a.id === selected) ?? null;
  const neighbors = selectedAnimal
    ? getNearestNeighbors(selectedAnimal, workingNest, 2)
    : [];

  return (
    <div className="border border-purple-100 rounded-2xl p-4 bg-purple-50 flex flex-col gap-3">
      <p className="text-sm font-semibold text-[#967FD8]">
        Why did Pippy guess that?
      </p>
      <p className="text-xs text-gray-600">
        Tap an animal below to see which training example Pippy copied from.
        The bad egg hides among them — but you need to spot which label is wrong.
      </p>

      {/* Missed animals */}
      <div className="flex gap-2 flex-wrap">
        {missedAnimals.map(animal => (
          <button
            key={animal.id}
            onClick={() => setSelected(animal.id === selected ? null : animal.id)}
            className={[
              'flex flex-col items-center gap-1 p-2 rounded-xl border-2 bg-white transition-all text-xs font-medium',
              animal.id === selected
                ? 'border-[#967FD8] shadow-md'
                : 'border-gray-200 hover:border-[#967FD8]',
            ].join(' ')}
          >
            <AnimalImageSmall animal={animal} size={40} />
            <span className="text-gray-700">{animal.name}</span>
            <span className="text-red-500 text-[10px]">Pippy said NO ✗</span>
          </button>
        ))}
      </div>

      {/* Nearest neighbor reveal */}
      {selectedAnimal && neighbors.length > 0 && (
        <div className="bg-white border border-purple-100 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-xs text-gray-500">
            Pippy saw <strong>{selectedAnimal.name}</strong> and looked for the most similar
            animal it had trained on. The closest match{neighbors.length > 1 ? 'es were' : ' was'}:
          </p>
          <div className="flex gap-3 flex-wrap">
            {neighbors.map(ex => (
              <div key={ex.id} className="flex flex-col items-center gap-1 text-xs">
                <AnimalImageSmall animal={ex.animal} size={44} />
                <span className="font-medium text-gray-700">{ex.animal.name}</span>
                <span
                  className="font-bold px-2 py-0.5 rounded-full"
                  style={
                    ex.label === 'YES'
                      ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                      : { backgroundColor: '#FEE2E2', color: '#B91C1C' }
                  }
                >
                  {ex.label}
                </span>
                <span className="text-gray-400 text-[10px]">→ Pippy guessed {ex.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic">
            Does that label look right to you? If not — you may have found the bad egg.
          </p>
        </div>
      )}
    </div>
  );
}

function AnimalImageSmall({ animal, size }: { animal: Animal; size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded bg-gray-100 flex items-center justify-center text-[9px] text-gray-500 text-center"
        style={{ width: size, height: size }}
      >
        {animal.name}
      </div>
    );
  }
  return (
    <Image
      src={animal.image}
      alt={animal.name}
      width={size}
      height={size}
      className="object-contain"
      onError={() => setFailed(true)}
    />
  );
}

// ---------- Main step ----------

export function InspectFixStep({ onCheckBatch }: InspectFixStepProps) {
  const {
    state,
    currentLevel,
    relabelExample,
    removeExample,
    undoEdit,
    canUndo,
    failedCheckAttempts,
  } = usePippyActivity();

  // useMemo must be before any early return (Rules of Hooks)
  const accuracy = useMemo(() => {
    if (!currentLevel) return 0;
    const expected = getExpectedVerdicts(currentLevel.checkBatch, currentLevel);
    const results = classifyBatch(currentLevel.checkBatch, state.workingNest);
    return computeAccuracy(results, expected);
  }, [state.workingNest, currentLevel]);

  if (!currentLevel) return null;

  const hintIndex = Math.min(failedCheckAttempts - 1, HINTS.length - 1);
  const showHint = failedCheckAttempts >= 2;

  const expression: PippyExpression =
    accuracy >= 0.85 ? 'excited' : failedCheckAttempts > 0 ? 'confused' : 'thinking';

  const speech =
    accuracy >= 0.85
      ? "I think something changed — I feel more confident now!"
      : failedCheckAttempts > 0
      ? "I'm still getting some wrong. Keep looking!"
      : "Something in my training is confusing me. Can you find it?";

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-3xl mx-auto gap-6">
      <h1 className="text-2xl font-bold text-center">Find the Bad Egg</h1>

      {/* Pippy + live confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <PippyCharacter expression={expression} speech={speech} size={140} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4 justify-center">
          <ConfidenceMeter accuracy={accuracy} />
        </div>
      </div>

      {/* Why did Pippy guess that? */}
      <WhyPanel
        testAnimals={currentLevel.testAnimals}
        workingNest={state.workingNest}
        level={currentLevel}
      />

      {/* Training timeline */}
      <TrainingTimeline nest={state.workingNest} />

      {/* Main inspector */}
      <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
        <NestInspector
          nest={state.workingNest}
          onRelabel={relabelExample}
          onRemove={removeExample}
          onUndo={undoEdit}
          canUndo={canUndo}
          highlightedIds={state.lastCheckMisses}
        />
      </div>

      {/* Hint */}
      {showHint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
          <span className="font-semibold">Hint: </span>{HINTS[hintIndex]}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onCheckBatch}
          className="text-sm px-6 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          Test Pippy again
        </Button>
        <Button
          onClick={onCheckBatch}
          className="bg-black text-white hover:bg-black/90 text-sm px-6 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          I think it&rsquo;s fixed!
        </Button>
      </div>
    </div>
  );
}
