'use client';

import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TileType, Coord, CoinPlacement } from '@/types/coda-activity';
import { CodaCharacter, CodaExpression } from './coda-character';

const TILE_STYLE: Record<TileType, { bg: string; border: string; text?: string; emoji?: string }> = {
  empty:  { bg: '#f0eef9', border: '#d4cef5' },
  wall:   { bg: '#2d2d2d', border: '#1a1a1a' },
  start:  { bg: '#4ade80', border: '#22c55e', text: 'Start' },
  exit:   { bg: '#967FD8', border: '#7c5fc4', text: 'Exit' },
  scenic: { bg: '#bbf7d0', border: '#86efac', emoji: '🌿' },
  hazard: { bg: '#fca5a5', border: '#f87171', emoji: '⚡' },
};

// Only mount this component inside a DndContext (when droppable=true on GridWorld).
function DroppableTile({
  x,
  y,
  children,
  style,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { x: number; y: number }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tile-${x}-${y}`,
    data: { coord: { x, y } },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        outline: isOver ? '2px solid rgba(245,158,11,0.8)' : undefined,
        outlineOffset: '-2px',
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}

// Only mount inside a DndContext — GridWorld only renders this when `droppable`
// is true (the pre-run play surface), so a placed coin can be dragged to another
// tile to reposition it, or dragged off the grid to remove it.
function DraggableCoinToken({ coin, tileSize }: { coin: CoinPlacement; tileSize: number }) {
  const { setNodeRef, listeners, transform, isDragging } = useDraggable({
    id: `placed-coin-${coin.id}`,
    data: { value: coin.value, coinId: coin.id, fromGrid: true },
  });

  return (
    <div
      ref={setNodeRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.35 : 1,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      {...listeners}
    >
      <div
        style={{
          width: Math.round(tileSize * 0.58),
          height: Math.round(tileSize * 0.58),
          borderRadius: '50%',
          backgroundColor: '#FCD34D',
          border: '2.5px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: tileSize < 56 ? '9px' : '11px',
          fontWeight: 800,
          color: '#78350F',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        {coin.value}
      </div>
    </div>
  );
}

export interface GridWorldProps {
  grid: TileType[][];
  coins?: CoinPlacement[];
  /** Dashed ghost path overlay (the intended destination route). */
  ghostPath?: Coord[];
  /** Solid actual-run trail (from a RunResult). */
  runPath?: Coord[];
  onTileClick?: (coord: Coord) => void;
  /** Size in px of each tile. Defaults to 64. */
  tileSize?: number;
  className?: string;
  /** When true, non-wall tiles become drop zones (requires DndContext ancestor). */
  droppable?: boolean;
  /** Current position of Coda character image on the grid. */
  codaPos?: Coord;
  /** Visual expression state for Coda character. */
  codaExpression?: CodaExpression;
}

export function GridWorld({
  grid,
  coins = [],
  ghostPath = [],
  runPath = [],
  onTileClick,
  tileSize = 64,
  className = '',
  droppable = false,
  codaPos,
  codaExpression = 'idle',
}: GridWorldProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const ghostSet = new Set(ghostPath.map(c => `${c.x},${c.y}`));
  const runSet = new Set(runPath.map(c => `${c.x},${c.y}`));
  const coinMap = new Map(coins.map(c => [`${c.at.x},${c.at.y}`, c]));

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
        gap: '4px',
      }}
    >
      {Array.from({ length: rows }).flatMap((_, y) =>
        Array.from({ length: cols }).map((_, x) => {
          const type = grid[y][x];
          const key = `${x},${y}`;
          const style = TILE_STYLE[type];
          const isGhost = ghostSet.has(key);
          const isRun = runSet.has(key);
          const coin = coinMap.get(key);
          const isClickable = !!onTileClick && type !== 'wall';
          const isDroppable = droppable && type !== 'wall';
          const isCoda = !!codaPos && codaPos.x === x && codaPos.y === y;

          const tileStyle: React.CSSProperties = {
            width: tileSize,
            height: tileSize,
            backgroundColor: style.bg,
            border: `2px solid ${isRun ? '#1d4ed8' : isGhost ? '#967FD8' : style.border}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: isClickable ? 'pointer' : 'default',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          };

          const tileClassName = isClickable
            ? 'hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-[#967FD8]'
            : '';

          const tileContent = (
            <>
              {/* Run trail fill */}
              {isRun && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(29, 78, 216, 0.12)',
                    borderRadius: '6px',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Ghost path fill (only if not also a run tile) */}
              {isGhost && !isRun && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(150, 127, 216, 0.12)',
                    borderRadius: '6px',
                    border: '2px dashed rgba(150, 127, 216, 0.5)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Tile label (Start / Exit / scenic emoji / hazard emoji) */}
              {style.text && (
                <span
                  style={{
                    fontSize: tileSize < 56 ? '9px' : '11px',
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    zIndex: 1,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  {style.text}
                </span>
              )}
              {style.emoji && !style.text && (
                <span style={{ fontSize: tileSize < 48 ? '12px' : '16px', zIndex: 1 }}>
                  {style.emoji}
                </span>
              )}

              {/* Coin token — draggable to reposition/remove on the live play surface */}
              {coin && droppable ? (
                <DraggableCoinToken coin={coin} tileSize={tileSize} />
              ) : coin ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: Math.round(tileSize * 0.58),
                      height: Math.round(tileSize * 0.58),
                      borderRadius: '50%',
                      backgroundColor: '#FCD34D',
                      border: '2.5px solid #F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: tileSize < 56 ? '9px' : '11px',
                      fontWeight: 800,
                      color: '#78350F',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {coin.value}
                  </div>
                </div>
              ) : null}

              {/* Coda character */}
              {isCoda && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                >
                  <CodaCharacter
                    expression={codaExpression}
                    size={Math.round(tileSize * 0.78)}
                  />
                </div>
              )}
            </>
          );

          if (isDroppable) {
            return (
              <DroppableTile
                key={key}
                x={x}
                y={y}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => onTileClick!({ x, y }) : undefined}
                onKeyDown={
                  isClickable
                    ? (e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') onTileClick!({ x, y });
                      }
                    : undefined
                }
                style={tileStyle}
                className={tileClassName}
              >
                {tileContent}
              </DroppableTile>
            );
          }

          return (
            <div
              key={key}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? () => onTileClick!({ x, y }) : undefined}
              onKeyDown={
                isClickable
                  ? e => { if (e.key === 'Enter' || e.key === ' ') onTileClick!({ x, y }); }
                  : undefined
              }
              style={tileStyle}
              className={tileClassName}
            >
              {tileContent}
            </div>
          );
        })
      )}
    </div>
  );
}
