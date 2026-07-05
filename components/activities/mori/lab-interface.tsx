'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MoriStepProps, Creature, CreatureFeature, Shape, Color, Pattern, BuilderCreature } from '@/types/mori-activity';
import { useMoriActivity } from '@/lib/context/mori-activity-context';
import { CreatureRenderer, FeatureBadge } from './creature-renderer';
import Image from 'next/image';

// ---------- Feature selector UI ----------

const SHAPES:   Shape[]   = ['round', 'square', 'triangular'];
const COLORS:   Color[]   = ['red', 'blue', 'green', 'yellow'];
const PATTERNS: Pattern[] = ['spots', 'stripes', 'solid'];

const COLOR_SWATCHES: Record<Color, string> = {
  red:    '#F87171',
  blue:   '#60A5FA',
  green:  '#4ADE80',
  yellow: '#FDE047',
};

const SHAPE_ICONS: Record<Shape, string> = {
  round:      '●',
  square:     '■',
  triangular: '▲',
};

function OptionButton({
  label,
  selected,
  onClick,
  color,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all min-w-[60px] ${
        selected
          ? 'border-[#967FD8] text-[#5b21b6] shadow-xs'
          : 'border-hairline text-fg-muted hover:border-[#967FD8] hover:text-[#967FD8]'
      }`}
      style={selected && color ? { backgroundColor: color + '33' } : undefined}
    >
      {label}
    </button>
  );
}

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: Color;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full border-2 transition-all ${
        selected ? 'border-hairline-strong scale-110 shadow-md' : 'border-transparent hover:border-hairline-strong'
      }`}
      style={{ backgroundColor: COLOR_SWATCHES[color] }}
      aria-label={color}
    />
  );
}

// ---------- Lab result card ----------

interface LabResultCardProps {
  creature: Creature;
  verdict: boolean;
  attendedFeatures: CreatureFeature[];
  isNew?: boolean;
}

function LabResultCard({ creature, verdict, attendedFeatures, isNew }: LabResultCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
        verdict
          ? 'border-positive bg-positive-muted'
          : 'border-critical bg-critical-muted'
      } ${isNew ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
    >
      <CreatureRenderer creature={creature} size={60} />
      <span
        className={`text-xs font-bold ${
          verdict ? 'text-positive' : 'text-critical'
        }`}
      >
        {verdict ? 'YES' : 'NO'}
      </span>
      <div className="flex flex-wrap gap-1 justify-center">
        {attendedFeatures.map(f => (
          <FeatureBadge key={f} feature={f} />
        ))}
      </div>
    </div>
  );
}

// ---------- Mori reaction ----------

function MoriReaction({ verdict }: { verdict: boolean | null }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Image
          src="/images/mori-course.png"
          alt="Mori"
          width={120}
          height={120}
          className="object-contain"
        />
        {verdict !== null && (
          <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
            {verdict ? '😄' : '🤔'}
          </span>
        )}
      </div>
      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        verdict === null
          ? 'bg-fill text-fg-muted'
          : verdict
          ? 'bg-positive-muted text-positive'
          : 'bg-critical-muted text-critical'
      }`}>
        {verdict === null
          ? 'Ready to test!'
          : verdict
          ? '✓ YES — matches!'
          : '✗ NO — not this one.'}
      </div>
    </div>
  );
}

// ---------- Progressive hints ----------

const HINTS = [
  'Look closely at the creatures where you and Mori disagreed.',
  'Try testing two creatures that are the same except for one feature.',
  'Watch which feature Mori highlights when it changes its answer.',
];

// ---------- Main Lab component ----------

export function LabInterface({ onNext }: MoriStepProps) {
  const { testCreature, state, currentLevel, failedSortAttempts } = useMoriActivity();

  const [builder, setBuilder] = useState<BuilderCreature>({});
  const [lastVerdict, setLastVerdict] = useState<boolean | null>(null);
  const [lastTested, setLastTested] = useState<Creature | null>(null);
  const [counter, setCounter] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  const isComplete =
    builder.shape !== undefined &&
    builder.color !== undefined &&
    builder.pattern !== undefined &&
    builder.spikes !== undefined &&
    builder.eyes !== undefined;

  const previewCreature: Creature | null = useMemo(
    () =>
      isComplete
        ? {
            id: `preview-${counter}`,
            shape: builder.shape!,
            color: builder.color!,
            pattern: builder.pattern!,
            spikes: builder.spikes!,
            eyes: builder.eyes!,
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isComplete, counter, builder.shape, builder.color, builder.pattern, builder.spikes, builder.eyes]
  );

  const handleTest = useCallback(() => {
    if (!previewCreature || isTesting) return;
    setIsTesting(true);
    const result = testCreature(previewCreature);
    setLastVerdict(result.verdict);
    setLastTested(previewCreature);
    setCounter(c => c + 1);
    setIsTesting(false);
  }, [previewCreature, testCreature, isTesting]);

  const yesResults = state.testedCreatures.filter(t => t.verdict);
  const noResults  = state.testedCreatures.filter(t => !t.verdict);

  const hasTested = state.testedCreatures.length >= 2;
  const showHint = failedSortAttempts >= 2 && failedSortAttempts <= 4;
  const hintText = showHint ? HINTS[Math.min(failedSortAttempts - 2, HINTS.length - 1)] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 pb-20 px-4">
      {/* Header */}
      <div className="mb-1">
        <span className="text-xs font-semibold text-[#967FD8] uppercase tracking-widest">
          {currentLevel?.title ?? 'Lab'}
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-1 text-center">Test creatures to crack the rule!</h1>
      <p className="text-fg-muted text-sm mb-6 text-center">
        Build a creature, test it with Mori, and watch which feature matters.
      </p>

      {/* Hint (after failed sorts) */}
      {hintText && (
        <div className="mb-6 px-5 py-3 rounded-xl bg-caution-muted border border-caution text-sm text-caution max-w-md text-center">
          💡 <strong>Hint:</strong> {hintText}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">

        {/* ---- Left: Builder ---- */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-fill rounded-2xl p-5 border border-hairline">
            <p className="text-xs font-bold text-fg-muted uppercase tracking-wide mb-4">
              Build a creature
            </p>

            {/* Shape */}
            <div className="mb-3">
              <p className="text-xs text-fg-muted mb-2 font-medium">Shape</p>
              <div className="flex gap-2 flex-wrap">
                {SHAPES.map(s => (
                  <OptionButton
                    key={s}
                    label={`${SHAPE_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                    selected={builder.shape === s}
                    onClick={() => setBuilder(b => ({ ...b, shape: s }))}
                  />
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-3">
              <p className="text-xs text-fg-muted mb-2 font-medium">Color</p>
              <div className="flex gap-3">
                {COLORS.map(c => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={builder.color === c}
                    onClick={() => setBuilder(b => ({ ...b, color: c }))}
                  />
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div className="mb-3">
              <p className="text-xs text-fg-muted mb-2 font-medium">Pattern</p>
              <div className="flex gap-2 flex-wrap">
                {PATTERNS.map(p => (
                  <OptionButton
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    selected={builder.pattern === p}
                    onClick={() => setBuilder(b => ({ ...b, pattern: p }))}
                  />
                ))}
              </div>
            </div>

            {/* Spikes */}
            <div className="mb-3">
              <p className="text-xs text-fg-muted mb-2 font-medium">Spikes</p>
              <div className="flex gap-2">
                <OptionButton label="Yes ⚡"  selected={builder.spikes === true}  onClick={() => setBuilder(b => ({ ...b, spikes: true  }))} />
                <OptionButton label="No"      selected={builder.spikes === false} onClick={() => setBuilder(b => ({ ...b, spikes: false }))} />
              </div>
            </div>

            {/* Eyes */}
            <div className="mb-5">
              <p className="text-xs text-fg-muted mb-2 font-medium">Eyes</p>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map(n => (
                  <OptionButton
                    key={n}
                    label={`${n} 👁️`}
                    selected={builder.eyes === n}
                    onClick={() => setBuilder(b => ({ ...b, eyes: n }))}
                  />
                ))}
              </div>
            </div>

            {/* Preview + test */}
            <div className="flex flex-col items-center gap-3">
              {previewCreature ? (
                <CreatureRenderer creature={previewCreature} size={80} />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-fill flex items-center justify-center text-fg-subtle text-xs">
                  Preview
                </div>
              )}
              <Button
                onClick={handleTest}
                disabled={!isComplete || isTesting}
                className="text-sm px-6 py-2 disabled:opacity-40"
                style={{ borderRadius: '10px' }}
              >
                Test with Mori!
              </Button>
            </div>
          </div>
        </div>

        {/* ---- Center: Mori ---- */}
        <div className="flex flex-col items-center gap-4 min-w-[160px]">
          <MoriReaction verdict={lastVerdict} />
          {lastTested && lastVerdict !== null && (
            <div className="text-center">
              <p className="text-xs text-fg-muted mb-1">Mori noticed:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {(state.testedCreatures[state.testedCreatures.length - 1]?.attendedFeatures ?? [])
                  .map(f => <FeatureBadge key={f} feature={f} />)}
              </div>
            </div>
          )}
        </div>

        {/* ---- Right: Results ---- */}
        <div className="flex-1 flex gap-4">
          {/* YES column */}
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-xs font-bold text-positive uppercase tracking-wide text-center">
              YES ({yesResults.length})
            </p>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {yesResults.map((t, i) => (
                <LabResultCard
                  key={t.creature.id + i}
                  creature={t.creature}
                  verdict={t.verdict}
                  attendedFeatures={t.attendedFeatures}
                  isNew={i === yesResults.length - 1 && lastVerdict === true}
                />
              ))}
              {yesResults.length === 0 && (
                <p className="text-xs text-fg-subtle italic text-center py-4">None yet</p>
              )}
            </div>
          </div>

          {/* NO column */}
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-xs font-bold text-critical uppercase tracking-wide text-center">
              NO ({noResults.length})
            </p>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {noResults.map((t, i) => (
                <LabResultCard
                  key={t.creature.id + i}
                  creature={t.creature}
                  verdict={t.verdict}
                  attendedFeatures={t.attendedFeatures}
                  isNew={i === noResults.length - 1 && lastVerdict === false}
                />
              ))}
              {noResults.length === 0 && (
                <p className="text-xs text-fg-subtle italic text-center py-4">None yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-2">
        {hasTested ? (
          <Button
            onClick={onNext}
            className="text-base px-10 py-3 animate-in fade-in slide-in-from-bottom-2"
            style={{ borderRadius: '12px' }}
          >
            I&apos;m ready to sort! 🕵️
          </Button>
        ) : (
          <p className="text-sm text-fg-subtle italic">
            Test {2 - state.testedCreatures.length} more creature{2 - state.testedCreatures.length !== 1 ? 's' : ''} before sorting
          </p>
        )}
      </div>
    </div>
  );
}
