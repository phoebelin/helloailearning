'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, RefreshCw } from 'lucide-react';
import { Animal } from '@/lib/data/animals';
import { TrainingExample } from '@/types/pippy-activity';
import { Button } from '@/components/ui/button';

// ---------- Stamp colors ----------

const YES_STYLE = { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
const NO_STYLE  = { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };

function LabelStamp({ label }: { label: 'YES' | 'NO' }) {
  const s = label === 'YES' ? YES_STYLE : NO_STYLE;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {label}
    </span>
  );
}

// ---------- Animal image with fallback ----------

function AnimalImage({ animal, size }: { animal: Animal; size: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="rounded-lg bg-gray-100 flex items-center justify-center text-center text-xs text-gray-500 font-medium p-1"
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
      className="object-contain"
      onError={() => setFailed(true)}
    />
  );
}

// ---------- Compact card (tap-to-expand) ----------

interface AnimalCardProps {
  example: TrainingExample;
  onRelabel: (id: string) => void;
  onRemove: (id: string) => void;
  highlighted?: boolean;
  compact?: boolean;
}

export function AnimalCard({
  example,
  onRelabel,
  onRemove,
  highlighted = false,
  compact = false,
}: AnimalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { animal, label } = example;
  const cardSize = compact ? 64 : 80;
  const isYes = label === 'YES';

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className={[
          'relative flex flex-col items-center gap-2 rounded-xl border-2 bg-white transition-all cursor-pointer',
          'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#967FD8]',
          highlighted ? 'border-orange-400 shadow-orange-200 shadow-md' : 'border-gray-200',
        ].join(' ')}
        style={{ padding: compact ? '10px' : '14px', minWidth: compact ? 88 : 108 }}
        aria-label={`${label} example: ${animal.name}`}
      >
        <AnimalImage animal={animal} size={cardSize} />
        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
          {animal.name}
        </span>
        <LabelStamp label={label} />
        {highlighted && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-400" />
        )}
      </button>

      {expanded && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="font-semibold text-lg">{animal.name}</h3>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <AnimalImage animal={animal} size={120} />

            <div
              className="text-lg font-bold px-4 py-1.5 rounded-full border-2"
              style={{
                backgroundColor: isYes ? YES_STYLE.bg : NO_STYLE.bg,
                color: isYes ? YES_STYLE.text : NO_STYLE.text,
                borderColor: isYes ? YES_STYLE.border : NO_STYLE.border,
              }}
            >
              Labeled: {label}
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => { onRelabel(example.id); setExpanded(false); }}
              >
                <RefreshCw className="w-4 h-4" />
                Change to {isYes ? 'NO' : 'YES'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => { onRemove(example.id); setExpanded(false); }}
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Display-only version (no relabel/remove; for before-after, timeline, etc.) ----------

interface AnimalDisplayProps {
  animal: Animal;
  label?: 'YES' | 'NO';
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function AnimalDisplay({ animal, label, size = 64, showLabel = true, className = '' }: AnimalDisplayProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <AnimalImage animal={animal} size={size} />
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {animal.name}
      </span>
      {showLabel && label && <LabelStamp label={label} />}
    </div>
  );
}
