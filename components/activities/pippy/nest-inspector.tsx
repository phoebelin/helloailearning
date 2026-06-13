'use client';

import React, { useState } from 'react';
import { TrainingExample } from '@/types/pippy-activity';
import { AnimalCard } from './animal-card';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

type LabelFilter = 'all' | 'YES' | 'NO';

interface NestInspectorProps {
  nest: TrainingExample[];
  onRelabel: (id: string) => void;
  onRemove: (id: string) => void;
  onUndo: () => void;
  canUndo: boolean;
  highlightedIds?: string[];
  compact?: boolean;
}

export function NestInspector({
  nest,
  onRelabel,
  onRemove,
  onUndo,
  canUndo,
  highlightedIds = [],
  compact = false,
}: NestInspectorProps) {
  const [filter, setFilter] = useState<LabelFilter>('all');

  const filtered = filter === 'all' ? nest : nest.filter(e => e.label === filter);
  const highlightSet = new Set(highlightedIds);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {(['all', 'YES', 'NO'] as LabelFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filter === f
                  ? 'bg-[#967FD8] text-white border-[#967FD8]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#967FD8]',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : `${f} only`}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="gap-1 text-xs"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </Button>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No examples match this filter.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filtered.map(ex => (
            <AnimalCard
              key={ex.id}
              example={ex}
              onRelabel={onRelabel}
              onRemove={onRemove}
              highlighted={highlightSet.has(ex.id)}
              compact={compact}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {nest.length} example{nest.length !== 1 ? 's' : ''}
        {filtered.length !== nest.length ? ` · ${filtered.length} shown` : ''}
        {' · '}Tap a card to relabel or remove it.
      </p>
    </div>
  );
}
