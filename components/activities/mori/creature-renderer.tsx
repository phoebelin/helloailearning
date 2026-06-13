'use client';

import { Creature, CreatureFeature, Color, Shape, Pattern } from '@/types/mori-activity';

// ---------- Color palette ----------

const COLOR_MAP: Record<Color, { fill: string; dark: string; label: string }> = {
  red:    { fill: '#F87171', dark: '#DC2626', label: 'Red'    },
  blue:   { fill: '#60A5FA', dark: '#2563EB', label: 'Blue'   },
  green:  { fill: '#4ADE80', dark: '#16A34A', label: 'Green'  },
  yellow: { fill: '#FDE047', dark: '#CA8A04', label: 'Yellow' },
};

// ---------- Pattern paths (clipped to body shape) ----------

function SpotsPattern({ size, dark }: { size: number; dark: string }) {
  const cx = size / 2;
  return (
    <>
      <circle cx={cx - 14} cy={cx - 8}  r={5.5} fill={dark} opacity={0.35} />
      <circle cx={cx + 14} cy={cx - 8}  r={5.5} fill={dark} opacity={0.35} />
      <circle cx={cx}      cy={cx + 10} r={5.5} fill={dark} opacity={0.35} />
      <circle cx={cx - 22} cy={cx + 10} r={4}   fill={dark} opacity={0.25} />
      <circle cx={cx + 22} cy={cx + 10} r={4}   fill={dark} opacity={0.25} />
    </>
  );
}

function StripesPattern({ size, dark }: { size: number; dark: string }) {
  return (
    <>
      {[0, 14, 28, 42].map((y) => (
        <rect
          key={y}
          x={0} y={y + (size * 0.15)}
          width={size} height={6}
          fill={dark} opacity={0.2}
        />
      ))}
    </>
  );
}

// ---------- Shape clip paths ----------

function RoundClip({ id, size }: { id: string; size: number }) {
  const r = size * 0.44;
  return (
    <clipPath id={id}>
      <circle cx={size / 2} cy={size / 2} r={r} />
    </clipPath>
  );
}

function SquareClip({ id, size }: { id: string; size: number }) {
  const pad = size * 0.1;
  return (
    <clipPath id={id}>
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx={8} ry={8} />
    </clipPath>
  );
}

function TriangularClip({ id, size }: { id: string; size: number }) {
  const cx = size / 2;
  const top = size * 0.06;
  const bottom = size * 0.92;
  const left = size * 0.06;
  const right = size * 0.94;
  return (
    <clipPath id={id}>
      <polygon points={`${cx},${top} ${left},${bottom} ${right},${bottom}`} />
    </clipPath>
  );
}

// ---------- Shape body outlines ----------

function RoundBody({ fill, stroke, size }: { fill: string; stroke: string; size: number }) {
  const r = size * 0.44;
  return <circle cx={size / 2} cy={size / 2} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />;
}

function SquareBody({ fill, stroke, size }: { fill: string; stroke: string; size: number }) {
  const pad = size * 0.1;
  return (
    <rect
      x={pad} y={pad}
      width={size - pad * 2} height={size - pad * 2}
      rx={8} ry={8}
      fill={fill} stroke={stroke} strokeWidth={2.5}
    />
  );
}

function TriangularBody({ fill, stroke, size }: { fill: string; stroke: string; size: number }) {
  const cx = size / 2;
  const top = size * 0.06;
  const bottom = size * 0.92;
  const left = size * 0.06;
  const right = size * 0.94;
  return (
    <polygon
      points={`${cx},${top} ${left},${bottom} ${right},${bottom}`}
      fill={fill} stroke={stroke} strokeWidth={2.5}
    />
  );
}

// ---------- Spikes ----------

function Spikes({ size, color }: { size: number; color: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  const count = 8;
  const spikeLen = size * 0.12;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const x2 = cx + (r + spikeLen) * Math.cos(angle);
        const y2 = cy + (r + spikeLen) * Math.sin(angle);
        const leftAngle = angle - 0.25;
        const rightAngle = angle + 0.25;
        const lx = cx + (r - 2) * Math.cos(leftAngle);
        const ly = cy + (r - 2) * Math.sin(leftAngle);
        const rx2 = cx + (r - 2) * Math.cos(rightAngle);
        const ry2 = cy + (r - 2) * Math.sin(rightAngle);
        return (
          <polygon
            key={i}
            points={`${x2},${y2} ${lx},${ly} ${rx2},${ry2}`}
            fill={color}
            opacity={0.9}
          />
        );
      })}
    </>
  );
}

// ---------- Eyes ----------

function Eyes({ count, size, shape }: { count: 1 | 2 | 3; shape: Shape; size: number }) {
  const cx = size / 2;
  const eyeY = shape === 'triangular' ? size * 0.65 : size * 0.42;
  const eyeR = size * 0.066;
  const pupilR = eyeR * 0.48;

  const positions = count === 1
    ? [cx]
    : count === 2
    ? [cx - size * 0.12, cx + size * 0.12]
    : [cx - size * 0.16, cx, cx + size * 0.16];

  return (
    <>
      {positions.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={eyeY} r={eyeR} fill="white" stroke="#374151" strokeWidth={1} />
          <circle cx={x} cy={eyeY} r={pupilR} fill="#111827" />
        </g>
      ))}
    </>
  );
}

// ---------- Feature glow overlay ----------

function FeatureHighlight({
  feature,
  size,
  shape,
}: {
  feature: CreatureFeature;
  size: number;
  shape: Shape;
}) {
  const glowColor = '#FCD34D';
  const glowOpacity = 0.65;

  if (feature === 'spikes') {
    return (
      <circle
        cx={size / 2} cy={size / 2}
        r={size * 0.50}
        fill="none"
        stroke={glowColor}
        strokeWidth={4}
        opacity={glowOpacity}
        strokeDasharray="4 3"
      />
    );
  }

  if (feature === 'eyes') {
    const eyeY = shape === 'triangular' ? size * 0.65 : size * 0.42;
    return (
      <ellipse
        cx={size / 2} cy={eyeY}
        rx={size * 0.32} ry={size * 0.14}
        fill={glowColor}
        opacity={0.3}
      />
    );
  }

  // shape / color / pattern → highlight entire body
  return (
    <circle
      cx={size / 2} cy={size / 2}
      r={size * 0.48}
      fill={glowColor}
      opacity={0.22}
    />
  );
}

// ---------- Main CreatureRenderer ----------

interface CreatureRendererProps {
  creature: Creature;
  size?: number;
  highlightFeatures?: CreatureFeature[];
  className?: string;
}

export function CreatureRenderer({
  creature,
  size = 96,
  highlightFeatures = [],
  className = '',
}: CreatureRendererProps) {
  const uid = creature.id.replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `clip-${uid}`;
  const { fill, dark } = COLOR_MAP[creature.color];
  const stroke = dark;

  const BodyComponent =
    creature.shape === 'round'
      ? RoundBody
      : creature.shape === 'square'
      ? SquareBody
      : TriangularBody;

  const ClipComponent =
    creature.shape === 'round'
      ? RoundClip
      : creature.shape === 'square'
      ? SquareClip
      : TriangularClip;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={describeCreature(creature)}
    >
      <defs>
        <ClipComponent id={clipId} size={size} />
      </defs>

      {/* Body + pattern clipped to shape */}
      <BodyComponent fill={fill} stroke={stroke} size={size} />
      <g clipPath={`url(#${clipId})`}>
        {creature.pattern === 'spots'   && <SpotsPattern   size={size} dark={dark} />}
        {creature.pattern === 'stripes' && <StripesPattern size={size} dark={dark} />}
      </g>

      {/* Spikes (outside body, no clip) */}
      {creature.spikes && <Spikes size={size} color={dark} />}

      {/* Eyes (on top) */}
      <Eyes count={creature.eyes} size={size} shape={creature.shape} />

      {/* Feature highlights */}
      {highlightFeatures.map((f) => (
        <FeatureHighlight key={f} feature={f} size={size} shape={creature.shape} />
      ))}
    </svg>
  );
}

// ---------- Feature badge (used in Lab result area) ----------

const FEATURE_LABELS: Record<CreatureFeature, string> = {
  shape:   'Shape',
  color:   'Color',
  pattern: 'Pattern',
  spikes:  'Spikes',
  eyes:    'Eyes',
};

export function FeatureBadge({ feature }: { feature: CreatureFeature }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
      ✦ {FEATURE_LABELS[feature]}
    </span>
  );
}

// ---------- Color label helper ----------

export function getColorLabel(color: Color): string {
  return COLOR_MAP[color].label;
}

// ---------- Accessible description ----------

export function describeCreature(c: Creature): string {
  const eyeWord = c.eyes === 1 ? '1 eye' : `${c.eyes} eyes`;
  const spikeWord = c.spikes ? 'with spikes' : 'no spikes';
  return `${getColorLabel(c.color)} ${c.shape} creature, ${c.pattern}, ${spikeWord}, ${eyeWord}`;
}

// ---------- Feature detail strings (for builder labels) ----------

export function featureValueLabel(feature: CreatureFeature, value: unknown): string {
  if (feature === 'spikes') return value ? 'Yes' : 'No';
  if (feature === 'eyes')   return `${value}`;
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export { COLOR_MAP };
export type { Color, Shape, Pattern };
