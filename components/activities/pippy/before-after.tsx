'use client';

import React from 'react';
import { Animal } from '@/lib/data/animals';
import { TrainingExample } from '@/types/pippy-activity';
import { AnimalDisplay } from './animal-card';
import { classifyAnimal } from '@/lib/data/pippy-prediction';

interface BeforeAfterProps {
  testAnimals: Animal[];
  originalNest: TrainingExample[];
  currentNest: TrainingExample[];
  expectedVerdicts: Record<string, 'YES' | 'NO'>;
}

export function BeforeAfter({
  testAnimals,
  originalNest,
  currentNest,
  expectedVerdicts,
}: BeforeAfterProps) {
  const beforeResults = testAnimals.map(a => classifyAnimal(a, originalNest));
  const afterResults  = testAnimals.map(a => classifyAnimal(a, currentNest));

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-fg-muted">Before vs. after your fix</h4>
      <div className="grid grid-cols-2 gap-3">
        {/* Before */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-critical text-center">Before</p>
          {beforeResults.map((r, i) => {
            const expected = expectedVerdicts[r.animalId];
            const wrong = r.verdict !== expected;
            return (
              <div
                key={r.animalId}
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{
                  borderColor: wrong ? '#FCA5A5' : '#86EFAC',
                  backgroundColor: wrong ? '#FFF1F2' : '#F0FDF4',
                }}
              >
                <AnimalDisplay animal={testAnimals[i]} size={36} showLabel={false} />
                <span
                  className="text-sm font-bold"
                  style={{ color: wrong ? '#B91C1C' : '#15803D' }}
                >
                  {r.verdict}
                </span>
                {wrong && <span className="text-xs text-critical">✗</span>}
              </div>
            );
          })}
        </div>

        {/* After */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-positive text-center">After</p>
          {afterResults.map((r, i) => {
            const expected = expectedVerdicts[r.animalId];
            const correct = r.verdict === expected;
            return (
              <div
                key={r.animalId}
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{
                  borderColor: correct ? '#86EFAC' : '#FCA5A5',
                  backgroundColor: correct ? '#F0FDF4' : '#FFF1F2',
                }}
              >
                <AnimalDisplay animal={testAnimals[i]} size={36} showLabel={false} />
                <span
                  className="text-sm font-bold"
                  style={{ color: correct ? '#15803D' : '#B91C1C' }}
                >
                  {r.verdict}
                </span>
                {correct && <span className="text-xs text-positive">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
