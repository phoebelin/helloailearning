'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter } from './pippy-character';
import { ConfidenceMeter } from './confidence-meter';
import { BeforeAfter } from './before-after';
import { Celebration } from '@/components/activities/shared/celebration';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';
import { computeAccuracyOnCheckBatch, getExpectedVerdicts } from '@/lib/data/pippy-levels';

export function LevelComplete() {
  const { state, currentLevel, advanceLevel, exitSession } = usePippyActivity();
  if (!currentLevel) return null;

  const isLastLevel = currentLevel.index === 3;
  const accuracyBefore = computeAccuracyOnCheckBatch(state.originalNest, currentLevel);
  const accuracyAfter  = computeAccuracyOnCheckBatch(state.workingNest, currentLevel);
  const expected = getExpectedVerdicts(currentLevel.testAnimals, currentLevel);

  // advanceLevel() updates the context (next level + reset to the observe-mistake
  // hook, or session-summary on the last level); the page reacts to the level
  // change and handles navigation + remounting the step sections.
  const handleNext = () => {
    advanceLevel();
  };

  return (
    <>
      <Celebration active duration={3000} />

      <div className="flex flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#967FD8]">
          You Fixed Pippy&rsquo;s Understanding! 🎉
        </h1>

        <PippyCharacter
          expression="excited"
          speech="You changed what I understand — just by fixing my examples!"
          size={160}
        />

        {/* What changed panel */}
        <div className="w-full bg-fill rounded-2xl p-5 flex flex-col gap-5 border border-hairline">
          <h2 className="text-base font-semibold text-fg-muted">What changed</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-fg-muted">Before your fix</p>
              <ConfidenceMeter accuracy={accuracyBefore} label="Accuracy" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-fg-muted">After your fix</p>
              <ConfidenceMeter accuracy={accuracyAfter} label="Accuracy" />
            </div>
          </div>

          <BeforeAfter
            testAnimals={currentLevel.testAnimals}
            originalNest={state.originalNest}
            currentNest={state.workingNest}
            expectedVerdicts={expected}
          />
        </div>

        {/* Visibility-ramp takeaway */}
        <div className="w-full bg-brand-muted border border-brand rounded-2xl p-5">
          <p className="text-xs font-semibold text-[#967FD8] uppercase tracking-wider mb-2">
            What this shows
          </p>
          <p className="text-sm text-fg-muted leading-relaxed italic">
            &ldquo;{currentLevel.takeaway}&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center text-sm text-fg-muted">
          <div>
            <p className="text-2xl font-bold text-[#967FD8]">{state.originalNest.length}</p>
            <p>examples inspected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#967FD8]">Level {currentLevel.index}</p>
            <p>complete</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isLastLevel ? (
            <>
              <Button
                onClick={handleNext}
                className="text-base px-8 py-3 min-h-[44px]"
                style={{ borderRadius: '12px' }}
              >
                Next level!
              </Button>
              <Button
                variant="outline"
                onClick={exitSession}
                className="text-base px-8 py-3 min-h-[44px]"
                style={{ borderRadius: '12px' }}
              >
                I&rsquo;m done for now
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              className="text-base px-8 py-3 min-h-[44px]"
              style={{ borderRadius: '12px' }}
            >
              See your summary
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
