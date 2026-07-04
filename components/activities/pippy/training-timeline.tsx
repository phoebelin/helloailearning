'use client';

import React, { useState } from 'react';
import { TrainingExample } from '@/types/pippy-activity';
import { AnimalDisplay } from './animal-card';

interface TrainingTimelineProps {
  nest: TrainingExample[];
}

export function TrainingTimeline({ nest }: TrainingTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...nest].sort((a, b) => a.addedAtStep - b.addedAtStep);
  const shown = expanded ? sorted : sorted.slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#967FD8] transition-colors"
      >
        <span>⏱ Training timeline</span>
        <span className="text-xs text-gray-400">({nest.length} examples)</span>
        <span className="text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="flex items-end gap-2 overflow-x-auto pb-2">
          {shown.map((ex, i) => {
            const isYes = ex.label === 'YES';
            return (
              <div key={ex.id} className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="relative rounded-lg border-2 p-1.5 flex flex-col items-center gap-0.5"
                  style={{
                    borderColor: isYes ? '#86EFAC' : '#FCA5A5',
                    backgroundColor: isYes ? '#F0FDF4' : '#FFF1F2',
                  }}
                >
                  <AnimalDisplay animal={ex.animal} size={36} showLabel={false} />
                  <span
                    className="text-[9px] font-bold px-1 rounded"
                    style={{ color: isYes ? '#15803D' : '#B91C1C' }}
                  >
                    {ex.label}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">#{i + 1}</span>
              </div>
            );
          })}
        </div>
      )}

      {!expanded && (
        <div className="flex items-center gap-1 overflow-x-auto">
          {shown.map(ex => {
            const isYes = ex.label === 'YES';
            return (
              <div
                key={ex.id}
                className="w-6 h-6 rounded shrink-0"
                title={`${ex.animal.name} — ${ex.label} (step ${ex.addedAtStep})`}
                style={{ backgroundColor: isYes ? '#86EFAC' : '#FCA5A5' }}
              />
            );
          })}
          {nest.length > 5 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-[#967FD8] font-semibold shrink-0"
            >
              +{nest.length - 5}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
