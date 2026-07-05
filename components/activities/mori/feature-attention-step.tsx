'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoriStepProps, CreatureFeature, Creature } from '@/types/mori-activity';
import { CreatureRenderer } from './creature-renderer';

// A single demo creature used to illustrate all features
const DEMO_CREATURE: Creature = {
  id: 'demo',
  shape: 'round',
  color: 'blue',
  pattern: 'spots',
  spikes: true,
  eyes: 2,
};

interface FeatureInfo {
  key: CreatureFeature;
  label: string;
  description: string;
  emoji: string;
}

const FEATURES: FeatureInfo[] = [
  { key: 'shape',   label: 'Shape',   emoji: '🔷', description: 'Is it round, square, or triangular?' },
  { key: 'color',   label: 'Color',   emoji: '🎨', description: 'What color is the creature? Red, blue, green, or yellow?' },
  { key: 'pattern', label: 'Pattern', emoji: '✦',  description: 'Does it have spots, stripes, or a solid color?' },
  { key: 'spikes',  label: 'Spikes',  emoji: '⚡', description: 'Does it have spikes sticking out?' },
  { key: 'eyes',    label: 'Eyes',    emoji: '👁️', description: 'How many eyes does it have — 1, 2, or 3?' },
];

export function FeatureAttentionStep({ onNext }: MoriStepProps) {
  const [active, setActive] = useState<CreatureFeature | null>(null);

  const activeInfo = FEATURES.find(f => f.key === active) ?? null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-3">How Mori Looks at Creatures</h1>
      <p className="text-gray-600 max-w-md mb-8 text-base">
        Mori doesn&apos;t know what a creature <em>is</em>. It only looks at <strong>features</strong> — shape,
        color, pattern, spikes, eyes — and tries to find which ones matter for its rule.
        Tap a feature to see Mori notice it!
      </p>

      {/* Demo creature + feature highlight */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <CreatureRenderer
          creature={DEMO_CREATURE}
          size={140}
          highlightFeatures={active ? [active] : []}
        />
        {/* Mori gaze indicator */}
        <div className="h-12 flex items-center justify-center">
          {activeInfo ? (
            <div
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#5b21b6] animate-in fade-in duration-150"
              style={{ backgroundColor: '#ede9fe', maxWidth: 340 }}
            >
              <span className="mr-2">{activeInfo.emoji}</span>
              <strong>{activeInfo.label}:</strong> {activeInfo.description}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Tap a feature below</p>
          )}
        </div>
      </div>

      {/* Feature buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-10 max-w-sm">
        {FEATURES.map(f => (
          <button
            key={f.key}
            onClick={() => setActive(prev => (prev === f.key ? null : f.key))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              active === f.key
                ? 'bg-[#967FD8] text-white border-[#967FD8] shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#967FD8] hover:text-[#967FD8]'
            }`}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-[#967FD8] font-medium max-w-sm mb-8 text-base italic">
        &ldquo;I look for patterns in features. Test me and watch what I pay attention to!&rdquo;
      </p>

      <Button
        onClick={onNext}
        className="text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Start testing!
      </Button>
    </div>
  );
}
