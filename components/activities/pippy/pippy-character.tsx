'use client';

import Image from 'next/image';
import React from 'react';

export type PippyExpression = 'happy' | 'thinking' | 'confused' | 'excited';

interface PippyCharacterProps {
  expression?: PippyExpression;
  speech?: string;
  size?: number;
  className?: string;
}

// Expression-specific speech bubble tail colors and Pippy scale
const EXPRESSION_STYLES: Record<PippyExpression, { scale: number; bubbleColor: string }> = {
  happy:    { scale: 1.0,  bubbleColor: '#EDE9F8' },
  thinking: { scale: 0.95, bubbleColor: '#F3F4F6' },
  confused: { scale: 0.95, bubbleColor: '#FEF9C3' },
  excited:  { scale: 1.05, bubbleColor: '#DCFCE7' },
};

export function PippyCharacter({
  expression = 'happy',
  speech,
  size = 180,
  className = '',
}: PippyCharacterProps) {
  const { scale, bubbleColor } = EXPRESSION_STYLES[expression];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {speech && (
        <div
          className="relative max-w-[260px] text-sm text-center font-medium px-4 py-3 rounded-2xl shadow-sm"
          style={{ backgroundColor: bubbleColor, lineHeight: '1.6' }}
        >
          <span>&ldquo;{speech}&rdquo;</span>
          {/* Speech bubble tail pointing down toward Pippy */}
          <span
            className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `10px solid ${bubbleColor}`,
            }}
          />
        </div>
      )}
      <div
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.3s ease',
        }}
      >
        <Image
          src="/images/pippy.png"
          alt="Pippy"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
