'use client';

import React from 'react';

interface ConfidenceMeterProps {
  accuracy: number; // 0–1
  label?: string;
}

function getColor(accuracy: number): string {
  if (accuracy >= 0.85) return '#22C55E'; // green
  if (accuracy >= 0.5)  return '#F59E0B'; // amber
  return '#EF4444';                       // red
}

function getEmoji(accuracy: number): string {
  if (accuracy >= 0.85) return '😊';
  if (accuracy >= 0.5)  return '😕';
  return '😟';
}

export function ConfidenceMeter({ accuracy, label = 'Pippy\'s accuracy' }: ConfidenceMeterProps) {
  const pct = Math.round(accuracy * 100);
  const color = getColor(accuracy);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-gray-600">{label}</span>
        <span className="flex items-center gap-1" style={{ color }}>
          {getEmoji(accuracy)} {pct}%
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {accuracy >= 0.85
          ? 'Pippy is sorting well now!'
          : accuracy >= 0.5
          ? 'Pippy is still making some mistakes.'
          : 'Pippy is getting most things wrong.'}
      </p>
    </div>
  );
}
