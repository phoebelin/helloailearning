'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Animal } from '@/lib/data/animals';
import { TrainingExample } from '@/types/pippy-activity';
import { PippyLevel } from '@/types/pippy-activity';
import { getExpectedVerdict } from '@/lib/data/pippy-levels';
import { classifyAnimal } from '@/lib/data/pippy-prediction';

// Visually distinct from the training belt: cards that show "?" then flip to Pippy's guess.
// Used in observe-mistake (step 2) and check-batch (step 5).

interface QuizCardState {
  animal: Animal;
  verdict: 'YES' | 'NO';
  expected: 'YES' | 'NO';
  revealed: boolean;
}

interface QuizCardsProps {
  animals: Animal[];
  trainingSet: TrainingExample[];
  level: PippyLevel;
  autoReveal?: boolean;       // reveal all after a short delay
  revealDelayMs?: number;     // ms between each card reveal
  onAllRevealed?: () => void;
}

function AnimalQuizCard({ card, index, revealDelayMs }: {
  card: QuizCardState;
  index: number;
  revealDelayMs: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!card.revealed) return;
    const t = setTimeout(() => setRevealed(true), index * revealDelayMs);
    return () => clearTimeout(t);
  }, [card.revealed, index, revealDelayMs]);

  const isCorrect = card.verdict === card.expected;

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 transition-all"
      style={{
        borderColor: revealed ? (isCorrect ? '#86EFAC' : '#FCA5A5') : '#E5E7EB',
        backgroundColor: revealed ? (isCorrect ? '#F0FDF4' : '#FFF1F2') : '#FFFFFF',
        minWidth: 100,
      }}
    >
      {imgFailed ? (
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium text-center p-1">
          {card.animal.name}
        </div>
      ) : (
        <Image
          src={card.animal.image}
          alt={card.animal.name}
          width={64}
          height={64}
          className="object-contain"
          onError={() => setImgFailed(true)}
        />
      )}

      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {card.animal.name}
      </span>

      {/* Verdict flip: ? → Pippy's guess */}
      <div
        className="text-sm font-bold px-3 py-1 rounded-full border-2 transition-all"
        style={
          revealed
            ? {
                backgroundColor: card.verdict === 'YES' ? '#DCFCE7' : '#FEE2E2',
                color: card.verdict === 'YES' ? '#15803D' : '#B91C1C',
                borderColor: card.verdict === 'YES' ? '#86EFAC' : '#FCA5A5',
              }
            : { backgroundColor: '#F3F4F6', color: '#6B7280', borderColor: '#D1D5DB' }
        }
      >
        {revealed ? card.verdict : '?'}
      </div>

      {/* ✓ / ✗ indicator */}
      {revealed && (
        <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
          {isCorrect ? '✓ Correct' : `✗ Should be ${card.expected}`}
        </span>
      )}
    </div>
  );
}

export function QuizCards({
  animals,
  trainingSet,
  level,
  autoReveal = true,
  revealDelayMs = 400,
  onAllRevealed,
}: QuizCardsProps) {
  const cards: QuizCardState[] = animals.map(animal => ({
    animal,
    verdict: classifyAnimal(animal, trainingSet).verdict,
    expected: getExpectedVerdict(animal, level),
    revealed: false,
  }));

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!autoReveal) return;
    const t = setTimeout(() => {
      setRevealed(true);
      const finalDelay = (animals.length - 1) * revealDelayMs + 600;
      setTimeout(() => onAllRevealed?.(), finalDelay);
    }, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardsWithReveal = cards.map(c => ({ ...c, revealed }));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {cardsWithReveal.map((card, i) => (
          <AnimalQuizCard
            key={card.animal.id}
            card={card}
            index={i}
            revealDelayMs={revealDelayMs}
          />
        ))}
      </div>
      {!revealed && (
        <button
          onClick={() => {
            setRevealed(true);
            const finalDelay = (animals.length - 1) * revealDelayMs + 600;
            setTimeout(() => onAllRevealed?.(), finalDelay);
          }}
          className="px-6 py-2 rounded-xl bg-[#967FD8] text-white font-semibold hover:bg-[#7c68b8] transition-colors text-sm"
        >
          See Pippy&rsquo;s guesses ▶
        </button>
      )}
    </div>
  );
}
