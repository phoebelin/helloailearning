'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter } from './pippy-character';
import { QuizCards } from './quiz-cards';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';

interface CheckBatchStepProps {
  onPass: () => void;
  onFail: () => void;
}

// Step 5: Re-test using quiz-cards (same visual as Step 2).
// NOTE: runCheckBatch() updates state asynchronously (React 18 batches setState).
// We trigger the check once on mount, then watch state.lastCheckPass to auto-advance.

export function CheckBatchStep({ onPass, onFail }: CheckBatchStepProps) {
  const { state, currentLevel, runCheckBatch } = usePippyActivity();
  const didRun = useRef(false);
  const didCallOnPass = useRef(false);

  // Run the check exactly once when this step mounts
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    runCheckBatch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance when pass; react to the state update (not the synchronous return value)
  useEffect(() => {
    if (state.lastCheckPass !== true || didCallOnPass.current) return;
    didCallOnPass.current = true;
    const t = setTimeout(onPass, 2000);
    return () => clearTimeout(t);
  }, [state.lastCheckPass, onPass]);

  if (!currentLevel) return null;

  const pass = state.lastCheckPass;
  const misses = state.lastCheckMisses;

  if (pass) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 gap-4 min-h-[60vh]">
        <PippyCharacter
          expression="excited"
          speech="Yes! I'm getting them all right now!"
          size={160}
        />
        <p className="text-xl font-semibold text-positive">All correct! ✓</p>
        <p className="text-fg-muted text-sm">Taking you to the results…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 max-w-2xl mx-auto gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">Let&rsquo;s See if Pippy Gets It Now</h1>

      <PippyCharacter
        expression="confused"
        speech={
          misses.length > 0
            ? `Closer! I still get ${misses.length} wrong.`
            : 'Let me take the quiz again…'
        }
        size={140}
      />

      <QuizCards
        animals={currentLevel.checkBatch}
        trainingSet={state.workingNest}
        level={currentLevel}
        autoReveal={true}
        revealDelayMs={350}
      />

      {pass === false && misses.length > 0 && (
        <div className="bg-brand-muted border border-brand rounded-xl p-4 text-sm text-fg-muted text-center max-w-sm">
          <p className="font-semibold text-brand mb-1">Not fixed yet</p>
          <p>
            Try &ldquo;Why did Pippy guess that?&rdquo; on the animals it still gets wrong —
            the bad egg is near them.
          </p>
        </div>
      )}

      {pass === false && (
        <Button
          onClick={onFail}
          className="text-base px-8 py-3 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          Back to training
        </Button>
      )}
    </div>
  );
}
