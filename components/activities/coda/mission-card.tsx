'use client';

interface MissionCardProps {
  missionText: string;
  levelTitle?: string;
}

/**
 * The mission brief — shown on the child's side only.
 * Deliberately separate from anything Coda sees (coins/reward).
 * PRD principle a: target ≠ reward, distinct styled spaces.
 */
export function MissionCard({ missionText, levelTitle }: MissionCardProps) {
  return (
    <div
      className="rounded-2xl w-full max-w-sm"
      style={{
        background: 'linear-gradient(135deg, #967FD8 0%, #7c5fc4 100%)',
        padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(150,127,216,0.3)',
      }}
    >
      {levelTitle && (
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
          {levelTitle}
        </p>
      )}
      <p className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-1">
        Your mission
      </p>
      <p className="text-xl font-bold text-white leading-snug">{missionText}</p>
      <p className="text-xs text-white/60 mt-3 leading-relaxed">
        Coda can&rsquo;t read this. It only sees coins.
      </p>
    </div>
  );
}
