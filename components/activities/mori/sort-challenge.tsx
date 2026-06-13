'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { MoriStepProps, Creature } from '@/types/mori-activity';
import { useMoriActivity } from '@/lib/context/mori-activity-context';
import { CreatureRenderer } from './creature-renderer';

// ---------- Draggable creature card ----------

function DraggableCard({
  creature,
  isAssigned,
  isCorrect,
  isIncorrect,
  isRevealed,
}: {
  creature: Creature;
  isAssigned: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isRevealed: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: creature.id,
    disabled: isRevealed,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }}
      className={`flex flex-col items-center p-2 rounded-xl border transition-all select-none touch-none ${
        isRevealed
          ? isCorrect
            ? 'border-green-400 bg-green-50 ring-2 ring-green-300'
            : isIncorrect
            ? 'border-red-400 bg-red-50 ring-2 ring-red-300'
            : 'border-gray-200 bg-white'
          : isAssigned
          ? 'border-[#967FD8] bg-[#f3efff] cursor-default'
          : 'border-gray-200 bg-white hover:border-[#967FD8] cursor-grab active:cursor-grabbing hover:shadow-md'
      }`}
    >
      <CreatureRenderer creature={creature} size={64} />
      {isRevealed && (
        <span className={`mt-1 text-xs font-bold ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </div>
  );
}

function FloatingCard({ creature }: { creature: Creature }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-xl border-2 border-[#967FD8] bg-white shadow-2xl rotate-3 pointer-events-none">
      <CreatureRenderer creature={creature} size={64} />
    </div>
  );
}

// ---------- Sort bin ----------

function SortBin({
  id,
  label,
  color,
  bgColor,
  borderColor,
  creatures,
  assignments,
  isRevealed,
  correctIds,
}: {
  id: 'yes' | 'no';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  creatures: Creature[];
  assignments: Record<string, 'yes' | 'no'>;
  isRevealed: boolean;
  correctIds: Set<string>;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const assigned = creatures.filter(c => assignments[c.id] === id);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col rounded-2xl border-2 transition-all min-h-[180px] p-4 ${
        isOver
          ? `${bgColor} border-current scale-[1.02] shadow-lg`
          : `bg-white ${borderColor}`
      }`}
      style={{ borderColor: isOver ? color : undefined }}
    >
      <p className={`text-sm font-bold mb-3 ${color}`}>{label}</p>
      <div className="flex flex-wrap gap-3">
        {assigned.map(c => (
          <div key={c.id} className={isOver ? 'opacity-80' : ''}>
            {isRevealed ? (
              <div
                className={`flex flex-col items-center p-2 rounded-xl border-2 ${
                  correctIds.has(c.id)
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-400 bg-red-50'
                }`}
              >
                <CreatureRenderer creature={c} size={60} />
                <span className={`mt-1 text-xs font-bold ${correctIds.has(c.id) ? 'text-green-700' : 'text-red-600'}`}>
                  {correctIds.has(c.id) ? '✓' : '✗'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center p-2 rounded-xl border border-gray-200 bg-gray-50">
                <CreatureRenderer creature={c} size={60} />
              </div>
            )}
          </div>
        ))}
        {assigned.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            {isOver ? 'Drop here!' : 'Drag creatures here'}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Main Sort Challenge ----------

export function SortChallenge({ onNext }: MoriStepProps) {
  const {
    state,
    currentLevel,
    generateSortBatch,
    setSortAssignment,
    submitSort,
    resetSort,
    goToStep,
  } = useMoriActivity();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [passedThisAttempt, setPassedThisAttempt] = useState(false);

  // Generate a fresh batch on mount and whenever the level advances
  useEffect(() => {
    generateSortBatch();
    setIsRevealed(false);
    setPassedThisAttempt(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentLevelIndex]);

  const batch = state.sortBatch ?? [];
  const assignments = state.sortAssignments;
  const allAssigned = batch.length > 0 && batch.every(c => assignments[c.id]);

  const activeDragCreature = batch.find(c => c.id === activeDragId) ?? null;

  // After reveal, compute per-creature correctness
  const correctIds = new Set<string>();
  if (isRevealed && currentLevel) {
    for (const c of batch) {
      const expected = currentLevel.trueRule(c) ? 'yes' : 'no';
      if (assignments[c.id] === expected) correctIds.add(c.id);
    }
  }
  const mismatchCount = isRevealed ? batch.length - correctIds.size : 0;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const bin = over.id as 'yes' | 'no';
    if (bin !== 'yes' && bin !== 'no') return;
    setSortAssignment(active.id as string, bin);
  }, [setSortAssignment]);

  const handleSubmit = useCallback(() => {
    const { passed } = submitSort();
    setIsRevealed(true);
    setPassedThisAttempt(passed);
  }, [submitSort]);

  const handleTryAgain = useCallback(() => {
    resetSort();
    setIsRevealed(false);
    setPassedThisAttempt(false);
    // scroll back to lab handled by parent page
    goToStep('lab');
  }, [resetSort, goToStep]);

  const handleNextLevel = useCallback(() => {
    onNext();
  }, [onNext]);

  if (!currentLevel) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 pb-20 px-4">
      {/* Header */}
      <div className="mb-1">
        <span className="text-xs font-semibold text-[#967FD8] uppercase tracking-widest">
          {currentLevel.title} — Sort Challenge
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-center">Sort these the way Mori would</h1>
      <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
        Drag each creature into the YES or NO bin based on your best guess of Mori&apos;s rule.
      </p>

      {/* Result banner (after reveal) */}
      {isRevealed && (
        <div
          className={`mb-6 px-6 py-3 rounded-xl text-sm font-semibold text-center ${
            passedThisAttempt
              ? 'bg-green-100 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {passedThisAttempt
            ? '🎉 Perfect! You sorted them all correctly!'
            : `${mismatchCount} mismatch${mismatchCount !== 1 ? 'es' : ''} — check the highlighted creatures and try again.`}
        </div>
      )}

      <DndContext
        onDragStart={e => setActiveDragId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        {/* Creature tray (unassigned) */}
        {!isRevealed && (
          <div className="w-full max-w-2xl mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Creatures to sort
            </p>
            <div className="flex flex-wrap gap-3">
              {batch
                .filter(c => !assignments[c.id])
                .map(c => (
                  <DraggableCard
                    key={c.id}
                    creature={c}
                    isAssigned={false}
                    isRevealed={false}
                  />
                ))}
              {batch.every(c => assignments[c.id]) && (
                <p className="text-xs text-gray-400 italic py-4">All sorted — check your work!</p>
              )}
            </div>
          </div>
        )}

        {/* YES / NO bins */}
        <div className="flex gap-4 w-full max-w-2xl mb-8">
          <SortBin
            id="yes"
            label="YES ✓"
            color="text-green-700"
            bgColor="bg-green-50"
            borderColor="border-green-300"
            creatures={batch}
            assignments={assignments}
            isRevealed={isRevealed}
            correctIds={correctIds}
          />
          <SortBin
            id="no"
            label="NO ✗"
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-300"
            creatures={batch}
            assignments={assignments}
            isRevealed={isRevealed}
            correctIds={correctIds}
          />
        </div>

        <DragOverlay>
          {activeDragCreature ? <FloatingCard creature={activeDragCreature} /> : null}
        </DragOverlay>
      </DndContext>

      {/* CTA buttons */}
      {!isRevealed ? (
        <Button
          onClick={handleSubmit}
          disabled={!allAssigned}
          className="bg-black text-white hover:bg-black/90 text-base px-10 py-3 disabled:opacity-40"
          style={{ borderRadius: '12px' }}
        >
          Check my sorting!
        </Button>
      ) : passedThisAttempt ? (
        <Button
          onClick={handleNextLevel}
          className="bg-black text-white hover:bg-black/90 text-base px-10 py-3"
          style={{ borderRadius: '12px' }}
        >
          See how Mori found the pattern →
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500 italic">
            Try testing creatures like the ones Mori disagreed on.
          </p>
          <Button
            onClick={handleTryAgain}
            className="bg-[#967FD8] text-white hover:bg-[#7c6bc7] text-base px-10 py-3"
            style={{ borderRadius: '12px' }}
          >
            Back to the Lab
          </Button>
        </div>
      )}
    </div>
  );
}
