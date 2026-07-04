'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { TrainingExample } from '@/types/pippy-activity';
import { Animal } from '@/lib/data/animals';

// Training-only visual: labels ride in pre-attached (they were *given*, not decided by Pippy).
// Visually distinct from QuizCards (testing) to reinforce the train vs test distinction.

export interface BeltItem {
  id: string;
  animal: Animal;
  label: 'YES' | 'NO';
}

type Phase = 'idle' | 'on-belt' | 'sorting';

interface ConveyorBeltProps {
  items: BeltItem[];
  beltDuration?: number;
  sortDuration?: number;
  gapDuration?: number;
  startLabel?: string;
  onComplete?: () => void;
}

// ---------- Pile ----------

const Pile = React.forwardRef<HTMLDivElement, {
  items: BeltItem[];
  label: string;
  color: string;
  bg: string;
  border: string;
}>(function Pile({ items, label, color, bg, border }, ref) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        className="text-sm font-bold px-4 py-1.5 rounded-full border-2"
        style={{ backgroundColor: bg, color, borderColor: border }}
      >
        {label} &nbsp;{items.length}
      </div>
      <div
        ref={ref}
        className="w-full flex flex-wrap justify-center content-start gap-1 rounded-2xl border-2 p-2"
        style={{ minHeight: 56, borderColor: border, backgroundColor: bg + '88' }}
      >
        {items.map(item => (
          <AnimalThumbnail key={item.id + '-pile'} animal={item.animal} size={48} />
        ))}
      </div>
    </div>
  );
});

function AnimalThumbnail({ animal, size }: { animal: Animal; size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded bg-gray-100 flex items-center justify-center text-[9px] text-gray-500 text-center p-0.5"
        style={{ width: size, height: size }}
      >
        {animal.name}
      </div>
    );
  }
  return (
    <Image
      src={animal.image}
      alt={animal.name}
      width={size}
      height={size}
      className="object-contain shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

// ---------- Belt surface ----------

function BeltSurface({ moving }: { moving: boolean }) {
  return (
    <div
      className="w-full rounded-lg"
      style={{
        height: 48,
        backgroundImage:
          'repeating-linear-gradient(90deg, #cbd5e1 0px, #cbd5e1 22px, #94a3b8 22px, #94a3b8 30px)',
        backgroundSize: '30px 100%',
        animation: moving ? 'beltMove 0.9s linear infinite' : 'none',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
      }}
    />
  );
}

// ---------- Main ----------

export function ConveyorBelt({
  items,
  beltDuration = 900,
  sortDuration = 1400,
  gapDuration = 350,
  startLabel = 'Start ▶',
  onComplete,
}: ConveyorBeltProps) {
  const [idx, setIdx]         = useState(0);
  const [phase, setPhase]     = useState<Phase>('idle');
  const [yesPile, setYesPile] = useState<BeltItem[]>([]);
  const [noPile, setNoPile]   = useState<BeltItem[]>([]);
  const [started, setStarted] = useState(false);
  const [sortOffset, setSortOffset] = useState({ dx: 0, dyYes: 0, dyNo: 0 });

  const cardAreaRef = useRef<HTMLDivElement>(null);
  const yesPileRef  = useRef<HTMLDivElement>(null);
  const noPileRef   = useRef<HTMLDivElement>(null);

  const currentItem = items[idx] ?? null;
  const isDone = idx >= items.length;

  const measure = useCallback(() => {
    const cardEl = cardAreaRef.current;
    const yesEl  = yesPileRef.current;
    const noEl   = noPileRef.current;
    if (!cardEl || !yesEl || !noEl) return;

    const cardR = cardEl.getBoundingClientRect();
    const yesR  = yesEl.getBoundingClientRect();
    const noR   = noEl.getBoundingClientRect();
    const cx    = cardR.left + cardR.width  / 2;
    const cy    = cardR.top  + cardR.height / 2;

    setSortOffset({
      dx:    (yesR.left + yesR.width  / 2) - cx,
      dyYes: (yesR.top  + yesR.height / 2) - cy,
      dyNo:  (noR.top   + noR.height  / 2) - cy,
    });
  }, []);

  const advance = useCallback(() => {
    if (idx >= items.length) return;
    const item = items[idx];

    measure();
    setPhase('on-belt');

    const t1 = setTimeout(() => setPhase('sorting'), beltDuration);
    const t2 = setTimeout(() => {
      if (item.label === 'YES') setYesPile(p => [...p, item]);
      else setNoPile(p => [...p, item]);
      setPhase('idle');
    }, beltDuration + sortDuration);
    const t3 = setTimeout(() => setIdx(i => i + 1), beltDuration + sortDuration + gapDuration);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [idx, items, beltDuration, sortDuration, gapDuration, measure]);

  useEffect(() => {
    if (!started) return;
    if (isDone) { onComplete?.(); return; }
    const cleanup = advance();
    return cleanup;
  }, [idx, started, isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardStyle: React.CSSProperties = (() => {
    if (!currentItem || phase === 'idle') {
      return { opacity: 0, transform: 'translateX(-80px) scale(1)', pointerEvents: 'none' };
    }
    if (phase === 'on-belt') {
      return {
        opacity: 1,
        transform: 'translateX(0) scale(1)',
        transition: `opacity 200ms ease, transform ${beltDuration}ms ease`,
      };
    }
    const dy = currentItem.label === 'YES' ? sortOffset.dyYes : sortOffset.dyNo;
    return {
      opacity: 1,
      transform: `translateX(${sortOffset.dx}px) translateY(${dy}px) scale(1)`,
      transition: `transform ${sortDuration}ms ease`,
    };
  })();

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      {/* Belt + label tag */}
      <p className="text-xs text-gray-400 text-center italic">
        These are the animals Pippy studied — each one already labeled by whoever collected the data.
      </p>

      <div className="flex gap-4 items-stretch">
        {/* Belt column */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div
            ref={cardAreaRef}
            className="relative w-full flex items-center justify-center"
            style={{ height: 130, overflow: 'visible' }}
          >
            {currentItem && (
              <div
                className="relative flex flex-col items-center gap-1"
                style={{ ...cardStyle, willChange: 'transform, opacity' }}
              >
                <AnimalThumbnail animal={currentItem.animal} size={72} />
                {/* Label pre-attached (given, not decided by Pippy) */}
                {phase === 'on-belt' && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full border"
                    style={
                      currentItem.label === 'YES'
                        ? { backgroundColor: '#DCFCE7', color: '#15803D', borderColor: '#86EFAC' }
                        : { backgroundColor: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }
                    }
                  >
                    {currentItem.label}
                  </span>
                )}
              </div>
            )}
          </div>
          <BeltSurface moving={started && !isDone} />
        </div>

        {/* Piles column */}
        <div className="flex flex-col gap-4" style={{ width: 280 }}>
          <Pile ref={yesPileRef} items={yesPile} label="YES" color="#15803D" bg="#DCFCE7" border="#86EFAC" />
          <Pile ref={noPileRef}  items={noPile}  label="NO"  color="#B91C1C" bg="#FEE2E2" border="#FCA5A5" />
        </div>
      </div>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="self-center px-8 py-2.5 rounded-xl bg-[#967FD8] text-white font-semibold hover:bg-[#7c68b8] transition-colors"
        >
          {startLabel}
        </button>
      ) : !isDone ? (
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#967FD8] rounded-full transition-all duration-300"
            style={{ width: `${(Math.min(idx, items.length) / items.length) * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ---------- Helper ----------

export function examplesToBeltItems(examples: TrainingExample[]): BeltItem[] {
  return examples.map(e => ({ id: e.id, animal: e.animal, label: e.label }));
}
