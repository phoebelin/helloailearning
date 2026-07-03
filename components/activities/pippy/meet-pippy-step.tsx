'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter } from './pippy-character';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';

interface MeetPippyStepProps {
  onNext: () => void;
}

export function MeetPippyStep({ onNext }: MeetPippyStepProps) {
  const { currentLevel } = usePippyActivity();
  const categoryLabel = currentLevel?.targetCategoryLabel ?? 'ANIMALS';

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-xl mx-auto gap-6">
      <h1 className="text-3xl sm:text-4xl font-bold">Meet Pippy!</h1>

      <PippyCharacter
        expression="happy"
        size={200}
        speech={`Hi! I've been learning to spot ${categoryLabel.toLowerCase()}. Watch me try — I hope I get them right!`}
      />

      {/* Required up-front goal line */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-1 font-medium">Pippy is learning to recognize:</p>
        <p className="text-2xl font-bold text-[#967FD8]">{categoryLabel}</p>
      </div>

      <p className="text-gray-600 text-lg leading-relaxed">
        This is Pippy, Mori&rsquo;s friend! Pippy studies labeled examples to learn categories.
        But something has gone wrong — let&rsquo;s see what Pippy does.
      </p>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 max-w-sm">
        <span className="font-semibold text-[#967FD8]">From Activity 2: </span>
        You helped Mori find its pattern — now let&rsquo;s see what Pippy learned.
      </div>

      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 min-h-[44px]"
        style={{ borderRadius: '12px' }}
      >
        Watch Pippy try
      </Button>
    </div>
  );
}
