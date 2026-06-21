'use client';

export type CodaExpression = 'idle' | 'moving' | 'happy' | 'frozen' | 'confused';

const EXPRESSION_BADGE: Partial<Record<CodaExpression, string>> = {
  happy: '⭐',
  frozen: '❄️',
  confused: '❓',
};

const EXPRESSION_FILTER: Record<CodaExpression, string> = {
  idle:     'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
  moving:   'drop-shadow(0 2px 8px rgba(150,127,216,0.6)) brightness(1.05)',
  happy:    'drop-shadow(0 2px 10px rgba(34,197,94,0.7)) brightness(1.1)',
  frozen:   'grayscale(70%) brightness(0.75) drop-shadow(0 2px 6px rgba(29,78,216,0.5))',
  confused: 'drop-shadow(0 2px 6px rgba(245,158,11,0.5)) brightness(1.0)',
};

const EXPRESSION_SCALE: Record<CodaExpression, string> = {
  idle:     'scale(1)',
  moving:   'scale(1.05)',
  happy:    'scale(1.12)',
  frozen:   'scale(0.88)',
  confused: 'scale(1)',
};

export interface CodaCharacterProps {
  expression?: CodaExpression;
  size?: number;
}

export function CodaCharacter({ expression = 'idle', size = 48 }: CodaCharacterProps) {
  const badge = EXPRESSION_BADGE[expression];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/coda.png"
        alt="Coda"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: EXPRESSION_FILTER[expression],
          transform: EXPRESSION_SCALE[expression],
          transition: 'filter 0.4s ease, transform 0.3s ease',
        }}
      />
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: -Math.round(size * 0.12),
            right: -Math.round(size * 0.12),
            fontSize: Math.round(size * 0.3),
            lineHeight: 1,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
