'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter, PippyExpression } from './pippy-character';
import { ConveyorBelt, examplesToBeltItems } from './conveyor-belt';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';

interface HowPippyLearnedStepProps {
  onNext: () => void;
}

// ─── Check for learning ───────────────────────────────────────────────────────

// One correct, one distractor, one neutral — per level.
// Level 0: YES creatures all have spikes.
// Level 1: YES creatures all have spots.
// Level 2: YES creatures all have a round shape.
const LEVEL_OPTIONS: Record<number, Array<{ id: string; text: string; correct: boolean }>> = {
  0: [
    { id: 'a', text: 'They all have spikes.',                           correct: true  },
    { id: 'b', text: "They're all the same color.",                     correct: false },
    { id: 'c', text: 'They each look a little different from each other.', correct: false },
  ],
  1: [
    { id: 'a', text: 'They all have spots.',                            correct: true  },
    { id: 'b', text: 'They all have the same shape.',                   correct: false },
    { id: 'c', text: 'They each look a little different from each other.', correct: false },
  ],
  2: [
    { id: 'a', text: 'They all have a round shape.',                    correct: true  },
    { id: 'b', text: "They're all the same color.",                     correct: false },
    { id: 'c', text: 'They each look a little different from each other.', correct: false },
  ],
};

function TrainingCheck({ levelIndex, onPassed }: { levelIndex: number; onPassed: () => void }) {
  const options = LEVEL_OPTIONS[levelIndex] ?? LEVEL_OPTIONS[0];
  const correctId = options.find(o => o.correct)!.id;

  const [selected, setSelected]   = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed]       = useState(false);

  // Single-select: clicking a new option replaces the previous selection.
  const pick = (id: string) => { if (!submitted) setSelected(id); };

  const handleCheck = () => {
    const correct = selected === correctId;
    setSubmitted(true);
    setPassed(correct);
    if (correct) onPassed();
  };

  const handleTryAgain = () => {
    setSelected(null);
    setSubmitted(false);
    setPassed(false);
  };

  const handleShowAnswer = () => {
    setSelected(correctId);
    setSubmitted(true);
    setPassed(true);
    onPassed();
  };

  return (
    <div className="border border-black rounded-xl p-6 w-full flex flex-col gap-4">
      <p className="text-base font-normal leading-relaxed text-black">
        What do you notice about the YES examples in Pippy&rsquo;s training?
      </p>

      <div className="flex flex-col gap-3">
        {options.map(option => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => pick(option.id)}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg border text-left w-full transition-all',
                isSelected
                  ? submitted && !passed
                    ? 'bg-yellow-100 border-yellow-400'
                    : 'bg-[#F4F0FF] border-[#967FD8]'
                  : 'bg-transparent border-transparent',
                submitted ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {isSelected ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="#967FD8"/>
                    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="black" strokeWidth="1"/>
                  </svg>
                )}
              </div>
              <span className="text-base font-normal leading-relaxed text-black flex-1">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback + action buttons */}
      <div className="flex items-center gap-4 mt-1">
        {submitted && passed && (
          <span className="text-base font-semibold text-[#967FD8]">🎉 That&rsquo;s right!</span>
        )}
        {submitted && !passed && (
          <span className="text-base font-semibold text-[#967FD8]">💪 Not quite — try again!</span>
        )}

        {!submitted && (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selected === null}
            className="bg-black text-white rounded-xl px-8 py-3 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check
          </button>
        )}
        {submitted && !passed && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleTryAgain}
              className="bg-black text-white rounded-xl px-6 py-3 text-base font-semibold"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleShowAnswer}
              className="border border-black text-black rounded-xl px-6 py-3 text-base font-semibold"
            >
              Show answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main step ────────────────────────────────────────────────────────────────

export function HowPippyLearnedStep({ onNext }: HowPippyLearnedStepProps) {
  const { state } = usePippyActivity();
  const [beltDone, setBeltDone]     = useState(false);
  const [checkPassed, setCheckPassed] = useState(false);
  const [runKey, setRunKey]         = useState(0);

  const items = examplesToBeltItems(state.workingNest);

  const expression: PippyExpression = beltDone ? 'happy' : 'thinking';
  const speech = beltDone
    ? "That's everything I learned from! If any of those examples are wrong, then I'll be wrong too."
    : 'Watch me go through every example I was given — each one stamped YES or NO…';

  const handleReplay = () => {
    setBeltDone(false);
    setRunKey(k => k + 1);
  };

  return (
    <div className="flex flex-col items-center p-8 max-w-5xl mx-auto gap-6">
      <h1 className="text-3xl font-bold text-center">Pippy&rsquo;s Training Set</h1>

      <p className="text-gray-600 text-center max-w-md leading-relaxed text-sm">
        Pippy doesn&rsquo;t have rules in its head. It only has the examples it was shown — each one
        stamped <strong>YES</strong> or <strong>NO</strong>. Everything Pippy believes comes from these.
      </p>

      <PippyCharacter expression={expression} speech={speech} size={130} />

      <div className="w-full">
        <ConveyorBelt
          key={runKey}
          items={items}
          startLabel="Watch Pippy learn ▶"
          beltDuration={1400}
          sortDuration={2800}
          gapDuration={700}
          onComplete={() => setBeltDone(true)}
        />
      </div>

      {beltDone && (
        <div className="flex flex-col items-center gap-4 mt-2 w-full max-w-xl">
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Pippy studied all {items.length} examples. But did it learn the right things?
          </p>

          <Button
            variant="outline"
            onClick={handleReplay}
            className="text-sm px-5 self-center"
            style={{ borderRadius: '12px' }}
          >
            ↺ Replay
          </Button>

          {/* Check for learning */}
          <TrainingCheck levelIndex={state.currentLevelIndex} onPassed={() => setCheckPassed(true)} />

          {/* Continue — only unlocked after check is passed */}
          {checkPassed && (
            <Button
              onClick={onNext}
              className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 self-center"
              style={{ borderRadius: '12px' }}
            >
              See Pippy make a guess
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
