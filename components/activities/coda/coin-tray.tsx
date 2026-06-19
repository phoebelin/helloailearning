'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_VALUES = [5, 10, 20];

function DraggableCoin({
  value,
  isSelected,
  onSelect,
  disabled,
}: {
  value: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `coin-value-${value}`,
    data: { value },
    disabled,
  });

  const translateStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={{
        ...translateStyle,
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: isSelected ? '#FCD34D' : '#f9f5e3',
        border: `3px solid ${isSelected ? '#F59E0B' : '#e5d78a'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(245,158,11,0.3), 0 2px 8px rgba(0,0,0,0.12)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: isDragging ? 'none' : 'all 0.15s',
        opacity: isDragging ? 0.4 : disabled ? 0.5 : 1,
        touchAction: 'none',
        position: 'relative',
      }}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      aria-label={`Coin worth ${value} points${isSelected ? ' (selected)' : ''}`}
      aria-pressed={isSelected}
    >
      <span
        style={{
          fontSize: '18px',
          fontWeight: 800,
          color: isSelected ? '#78350F' : '#a16207',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '9px',
          fontWeight: 600,
          color: isSelected ? '#92400E' : '#a16207',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        pts
      </span>
    </button>
  );
}

export interface CoinTrayProps {
  availableValues?: number[];
  selectedValue: number | null;
  onSelectValue: (value: number | null) => void;
  disabled?: boolean;
}

export function CoinTray({
  availableValues = DEFAULT_VALUES,
  selectedValue,
  onSelectValue,
  disabled = false,
}: CoinTrayProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Drag a coin onto the grid
      </p>
      <div className="flex gap-3 flex-wrap">
        {availableValues.map(value => (
          <DraggableCoin
            key={value}
            value={value}
            isSelected={selectedValue === value}
            onSelect={() => onSelectValue(selectedValue === value ? null : value)}
            disabled={disabled}
          />
        ))}
      </div>
      {selectedValue !== null && (
        <p className="text-xs text-[#967FD8] font-medium">
          {selectedValue}-point coin selected — tap a tile to place it
        </p>
      )}
    </div>
  );
}
