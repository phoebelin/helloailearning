'use client';

import { useCodaActivity } from '@/lib/context/coda-activity-context';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function SliderRow({ label, value, min, max, step = 1, hint, onChange, disabled }: SliderRowProps) {
  const displayValue = value === 0 ? '0' : value > 0 ? `+${value}` : `${value}`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span
          className="text-sm font-bold min-w-[4ch] text-right tabular-nums"
          style={{ color: '#967FD8' }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ accentColor: '#967FD8' }}
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        {hint && <span className="italic text-center flex-1 px-2">{hint}</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}

interface RewardSlidersProps {
  disabled?: boolean;
}

export function RewardSliders({ disabled }: RewardSlidersProps) {
  const { state, setRewardTerm } = useCodaActivity();
  const { workingReward } = state;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-gray-200 bg-white">
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#967FD8' }}>
        Coda&apos;s reward settings
      </p>

      <SliderRow
        label="🌿 Scenic bonus"
        value={workingReward.scenicBonus ?? 0}
        min={0}
        max={10}
        step={1}
        hint="points per scenic tile"
        onChange={v => setRewardTerm('scenicBonus', v)}
        disabled={disabled}
      />

      <SliderRow
        label="👟 Step cost"
        value={workingReward.stepCost ?? 0}
        min={0}
        max={5}
        step={1}
        hint="points lost per move"
        onChange={v => setRewardTerm('stepCost', v)}
        disabled={disabled}
      />

      <SliderRow
        label="⚠️ Hazard penalty"
        value={workingReward.hazardPenalty ?? 0}
        min={0}
        max={20}
        step={5}
        hint="points lost for hazard"
        onChange={v => setRewardTerm('hazardPenalty', v)}
        disabled={disabled}
      />
    </div>
  );
}
