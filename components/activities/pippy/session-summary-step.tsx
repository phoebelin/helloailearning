'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PippyCharacter } from './pippy-character';
import { usePippyActivity } from '@/lib/context/pippy-activity-context';
import { useRouter } from 'next/navigation';

export function SessionSummaryStep() {
  const { state, resetActivity } = usePippyActivity();
  const router = useRouter();

  const levelsSolved = state.levelsCompletedThisSession.length;
  const totalSolved  = state.totalLevelsCompleted;
  const highest      = state.highestLevelReached;

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 max-w-xl mx-auto gap-6 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold">Great work, data detective! 🔍</h1>

      <PippyCharacter
        expression="happy"
        speech="You changed what I understand — just by fixing my examples!"
        size={160}
      />

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center">
        <div>
          <p className="text-3xl font-bold text-[#967FD8]">{levelsSolved}</p>
          <p className="text-sm text-gray-500">solved this session</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#967FD8]">{totalSolved}</p>
          <p className="text-sm text-gray-500">total solved</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#967FD8]">Level {highest}</p>
          <p className="text-sm text-gray-500">highest reached</p>
        </div>
      </div>

      {/* Full arc recap */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-left flex flex-col gap-3">
        <p className="font-semibold text-[#967FD8]">What you discovered:</p>
        <ul className="text-sm text-gray-700 leading-relaxed flex flex-col gap-2">
          <li>
            <span className="font-semibold">🔧 AI isn&rsquo;t broken — it learned bad data.</span>{' '}
            When Pippy made mistakes, it wasn&rsquo;t a bug. It learned exactly what its examples taught it.
          </li>
          <li>
            <span className="font-semibold">🔄 Understanding is provisional.</span>{' '}
            When the data changes, Pippy&rsquo;s understanding changes too. An AI is never really &ldquo;finished.&rdquo;
          </li>
          <li>
            <span className="font-semibold">👁 Labels matter most when the truth is invisible.</span>{' '}
            For things like &ldquo;nocturnal&rdquo; that you can&rsquo;t see in a picture, Pippy
            depends entirely on its labels being right.{' '}
            <strong>An AI is only as good as its data.</strong>
          </li>
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={resetActivity}
          className="bg-black text-white hover:bg-black/90 text-base px-8 py-3 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          Keep playing
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/courses')}
          className="text-base px-8 py-3 min-h-[44px]"
          style={{ borderRadius: '12px' }}
        >
          Back to activities
        </Button>
      </div>
    </div>
  );
}
