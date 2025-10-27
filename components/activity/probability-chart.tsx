/**
 * Probability Chart Component
 * Displays ecosystem prediction probabilities as an animated bar chart
 * Based on PRD: 0001-prd-ecosystem-learning-activity.md - Task 5.5
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PredictionResult, EcosystemPrediction, EcosystemType } from '@/types/activity';
import { cn } from '@/lib/utils';

export interface ProbabilityChartProps {
  /** Prediction results to display */
  data: PredictionResult;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Whether to show animations */
  animated?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback when hovering over a bar */
  onBarHover?: (ecosystem: EcosystemType, prediction: EcosystemPrediction) => void;
  /** Callback when mouse leaves a bar */
  onBarLeave?: () => void;
}

// Ecosystem display names and colors
const ECOSYSTEM_CONFIG: Record<EcosystemType, { name: string; color: string; bgColor: string }> = {
  desert: { name: 'Desert', color: '#D2691E', bgColor: '#FFF8DC' },
  ocean: { name: 'Ocean', color: '#4682B4', bgColor: '#E6F3FF' },
  rainforest: { name: 'Rainforest', color: '#228B22', bgColor: '#F0FFF0' },
  grassland: { name: 'Grassland', color: '#9ACD32', bgColor: '#F5FFFA' },
  tundra: { name: 'Tundra', color: '#87CEEB', bgColor: '#F0F8FF' },
};

export function ProbabilityChart({
  data,
  width = 600,
  height = 300,
  animated = true,
  className,
  onBarHover,
  onBarLeave,
}: ProbabilityChartProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredEcosystem, setHoveredEcosystem] = useState<EcosystemType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation effect
  useEffect(() => {
    if (!animated) {
      setAnimationPhase(1);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationPhase(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated, data]);

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barWidth = chartWidth / data.ecosystems.length;
  const maxHeight = chartHeight;

  // Sort ecosystems by probability for better visual hierarchy
  const sortedEcosystems = [...data.ecosystems].sort((a, b) => b.probability - a.probability);

  const handleBarHover = (ecosystem: EcosystemType, prediction: EcosystemPrediction, event: React.MouseEvent) => {
    setHoveredEcosystem(ecosystem);
    
    // Calculate tooltip position relative to the container
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10 // Offset above cursor
      });
    }
    
    onBarHover?.(ecosystem, prediction);
  };

  const handleBarLeave = () => {
    setHoveredEcosystem(null);
    onBarLeave?.();
  };

  return (
    <div className={cn('w-full relative', className)}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Chart background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={chartWidth}
          height={chartHeight}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        {/* Y-axis label */}
        <text
          x={margin.left - 50}
          y={margin.top + chartHeight / 2}
          textAnchor="middle"
          className="text-sm font-semibold fill-gray-600"
          transform={`rotate(-90, ${margin.left - 50}, ${margin.top + chartHeight / 2})`}
        >
          Confidence Level
        </text>

        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((value) => {
          const y = margin.top + chartHeight - (value * chartHeight);
          return (
            <g key={value}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + chartWidth}
                y2={y}
                stroke="#F3F4F6"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(value * 100)}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {sortedEcosystems.map((prediction, index) => {
          const ecosystem = prediction.ecosystem;
          const config = ECOSYSTEM_CONFIG[ecosystem];
          const barHeight = (prediction.probability * maxHeight) * animationPhase;
          const x = margin.left + (index * barWidth) + (barWidth * 0.1);
          const y = margin.top + chartHeight - barHeight;
          const actualBarWidth = barWidth * 0.8;

          const isHovered = hoveredEcosystem === ecosystem;
          const isTopPrediction = ecosystem === data.topPrediction;

          return (
            <g key={ecosystem}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={actualBarWidth}
                height={barHeight}
                fill={config.color}
                stroke={config.color}
                strokeWidth="1"
                rx="4"
                ry="4"
                className={cn(
                  'transition-all duration-200 cursor-pointer',
                  isHovered && 'opacity-80',
                  isTopPrediction && 'drop-shadow-lg'
                )}
                onMouseEnter={(e) => handleBarHover(ecosystem, prediction, e)}
                onMouseLeave={handleBarLeave}
                style={{
                  filter: isHovered ? 'brightness(1.1)' : 'none',
                }}
              />

              {/* Ecosystem label */}
              <text
                x={x + actualBarWidth / 2}
                y={margin.top + chartHeight + 20}
                textAnchor="middle"
                className={cn(
                  'text-sm font-semibold transition-colors duration-200',
                  isHovered ? 'fill-[#967fd8]' : 'fill-gray-700'
                )}
              >
                {config.name}
              </text>

              {/* Probability percentage */}
              <text
                x={x + actualBarWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-sm font-semibold fill-gray-800"
              >
                {Math.round(prediction.probability * 100)}%
              </text>
            </g>
          );
        })}

      </svg>

      {/* Hover tooltip */}
      {hoveredEcosystem && (
        <div 
          className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-sm font-semibold text-gray-800 mb-2">
            {ECOSYSTEM_CONFIG[hoveredEcosystem].name} Ecosystem
          </div>
          <div className="text-xs text-gray-600 mb-3">
            Probability: {Math.round((data.ecosystems.find(e => e.ecosystem === hoveredEcosystem)?.probability || 0) * 100)}%
          </div>
          
          {/* Influencing sentences */}
          <div className="text-xs text-gray-700 mb-2 font-medium">
            Influencing sentences:
          </div>
          <div className="space-y-1">
            {data.ecosystems
              .find(e => e.ecosystem === hoveredEcosystem)
              ?.influencingSentences.slice(0, 3)
              .map((sentence, index) => (
                <div key={index} className="text-xs text-gray-600 italic">
                  "{sentence}"
                </div>
              ))}
          </div>
          
          {/* Keywords */}
          <div className="text-xs text-gray-700 mt-2 font-medium">
            Key words: {data.ecosystems
              .find(e => e.ecosystem === hoveredEcosystem)
              ?.keywords.slice(0, 5)
              .join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProbabilityChart;
