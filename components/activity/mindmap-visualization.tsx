/**
 * Interactive Mindmap Visualization Component
 * Displays concepts as nodes with connections, supporting hover interactions and animations
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MindmapData, MindmapNode, MindmapEdge, NodeColor } from '@/types/activity';
import { cn } from '@/lib/utils';

interface MindmapVisualizationProps {
  data: MindmapData;
  width?: number;
  height?: number;
  showTooltips?: boolean;
  animated?: boolean;
  interactive?: boolean;
  className?: string;
  onNodeClick?: (node: MindmapNode) => void;
  onNodeHover?: (node: MindmapNode | null) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

/**
 * Calculate node positions using a radial layout with center node
 */
function calculateNodePositions(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
  width: number,
  height: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  
  if (nodes.length === 0) return positions;
  
  // Find the center node (usually the largest or first node)
  const centerNode = nodes.find(node => 
    node.id.includes('center') || 
    node.size >= 100 || 
    node.label.toLowerCase().includes('bees') ||
    node.label.toLowerCase().includes('dolphins') ||
    node.label.toLowerCase().includes('monkeys') ||
    node.label.toLowerCase().includes('zebras')
  ) || nodes[0];
  
  const otherNodes = nodes.filter(node => node.id !== centerNode.id);
  
  // Position center node in the center
  const centerX = width / 2;
  const centerY = height / 2;
  positions.set(centerNode.id, { x: centerX, y: centerY });
  
  // Position other nodes in a circle around the center
  const radius = Math.min(width, height) * 0.45; // Increased from 0.3 to 0.45 for more spacing
  const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);
  
  // Position nodes with collision detection
  const nodeRadius = 60; // Half of the largest node size (120px)
  const minDistance = nodeRadius * 2.2; // Minimum distance between node centers
  
  otherNodes.forEach((node, index) => {
    let attempts = 0;
    let finalX, finalY;
    
    do {
      const angle = index * angleStep + (attempts * 0.1); // Slight angle adjustment for retries
      const baseRadius = radius + (attempts * 20); // Increase radius for retries
      const x = centerX + Math.cos(angle) * baseRadius;
      const y = centerY + Math.sin(angle) * baseRadius;
      
      // Check collision with center node
      const centerDistance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const centerNodeRadius = 60; // Half of center node size (120px)
      
      if (centerDistance < centerNodeRadius + nodeRadius + 10) {
        attempts++;
        continue;
      }
      
      // Check collision with other positioned nodes
      let hasCollision = false;
      for (const [otherNodeId, otherPos] of positions) {
        if (otherNodeId === centerNode.id) continue;
        
        const distance = Math.sqrt((x - otherPos.x) ** 2 + (y - otherPos.y) ** 2);
        if (distance < minDistance) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) {
        finalX = x;
        finalY = y;
        break;
      }
      
      attempts++;
    } while (attempts < 10); // Max 10 attempts
    
    // Fallback to original position if all attempts fail
    if (finalX === undefined || finalY === undefined) {
      const angle = index * angleStep;
      finalX = centerX + Math.cos(angle) * radius;
      finalY = centerY + Math.sin(angle) * radius;
    }
    
    // Ensure nodes stay within bounds
    const boundedX = Math.max(nodeRadius + 10, Math.min(width - nodeRadius - 10, finalX));
    const boundedY = Math.max(nodeRadius + 10, Math.min(height - nodeRadius - 10, finalY));
    
    positions.set(node.id, { x: boundedX, y: boundedY });
  });
  
  return positions;
}


/**
 * Get text color for different node types
 */
function getNodeTextColor(color: NodeColor): string {
  return '#ffffff'; // white text for all colors
}

/**
 * Get color classes for different node types (for mobile component)
 */
function getNodeColorClasses(color: NodeColor): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-500 text-white shadow-blue-200';
    case 'orange':
      return 'bg-orange-500 text-white shadow-orange-200';
    case 'purple':
      return 'bg-purple-500 text-white shadow-purple-200';
    case 'neutral':
    default:
      return 'bg-gray-500 text-white shadow-gray-200';
  }
}

/**
 * Get size classes for different node sizes
 */
function getNodeSizeClasses(size: number): string {
  if (size >= 80) return 'w-20 h-20 text-sm';
  if (size >= 60) return 'w-16 h-16 text-xs';
  if (size >= 40) return 'w-12 h-12 text-xs';
  return 'w-10 h-10 text-xs';
}

export function MindmapVisualization({
  data,
  width = 600,
  height = 400,
  showTooltips = true,
  animated = true,
  interactive = true,
  className,
  onNodeClick,
  onNodeHover,
}: MindmapVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map());
  const [hoveredNode, setHoveredNode] = useState<MindmapNode | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });
  const [animationPhase, setAnimationPhase] = useState(0);

  // Calculate positions when data changes
  useEffect(() => {
    const newPositions = calculateNodePositions(data.nodes, data.edges, width, height);
    setPositions(newPositions);
    setAnimationPhase(0);
  }, [data, width, height]);

  // Animation effect
  useEffect(() => {
    if (!animated) {
      setAnimationPhase(1);
      return;
    }

    const timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 200); // Slightly longer delay for smoother transition

    return () => clearTimeout(timer);
  }, [animated, data]); // Add data dependency to restart animation when data changes

  // Handle mouse events
  const handleNodeMouseEnter = useCallback((node: MindmapNode, event: React.MouseEvent) => {
    if (!interactive) return;
    
    setHoveredNode(node);
    onNodeHover?.(node);

    if (showTooltips) {
      // Don't show tooltip for center/parent node only
      const isCenterNode = node.id.includes('center');
      
      if (isCenterNode) return;
      
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        // Generate meaningful tooltip content based on the node
        let tooltipContent = '';
        if (node.sourceSentences.length > 0) {
          // Use the first sentence that contains this concept
          tooltipContent = node.sourceSentences[0];
        } else {
          // Fallback to node label
          tooltipContent = node.label;
        }
        
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: tooltipContent,
        });
      }
    }
  }, [interactive, showTooltips, onNodeHover]);

  const handleNodeMouseLeave = useCallback(() => {
    if (!interactive) return;
    
    setHoveredNode(null);
    onNodeHover?.(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, [interactive, onNodeHover]);

  const handleNodeClick = useCallback((node: MindmapNode) => {
    if (!interactive) return;
    onNodeClick?.(node);
  }, [interactive, onNodeClick]);

  // Render SVG line for edge
  const renderEdge = (edge: MindmapEdge) => {
    const sourcePos = positions.get(edge.source);
    const targetPos = positions.get(edge.target);
    
    if (!sourcePos || !targetPos) return null;

    return (
      <line
        key={edge.id}
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke="#9333ea"
        strokeWidth="4"
        strokeDasharray="10,5"
        strokeOpacity="1"
        className="transition-opacity duration-500"
      />
    );
  };

  // Render HTML div for node (matches knowledge-visualization-step approach)
  const renderHTMLNode = (node: MindmapNode) => {
    const position = positions.get(node.id);
    if (!position) return null;

    const isHovered = hoveredNode?.id === node.id;
    const scale = animated ? animationPhase : 1;
    const opacity = animated ? animationPhase : 1;

    return (
      <div
        key={node.id}
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: opacity,
        }}
      >
        <div
          className={cn(
            'rounded-full border-2 flex items-center justify-center',
            'font-medium shadow-sm transition-all duration-200',
            'hover:scale-110 hover:shadow-md cursor-pointer',
            getNodeSizeClasses(node.size),
            getNodeColorClasses(node.color)
          )}
          onMouseEnter={(e) => handleNodeMouseEnter(node, e)}
          onMouseLeave={handleNodeMouseLeave}
          onClick={() => handleNodeClick(node)}
        >
          <span className="text-center px-1 leading-tight text-white font-medium">
            {node.label}
          </span>
        </div>
      </div>
    );
  };

  if (data.nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🧠</div>
          <p>No concepts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* SVG for connection lines */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full"
        style={{ 
          zIndex: 1, 
          pointerEvents: 'none',
          overflow: 'visible'
        }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Render edges */}
        {data.edges.map(renderEdge)}
      </svg>

      {/* Interactive HTML nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {data.nodes.map(renderHTMLNode)}
      </div>

      {/* Tooltip */}
      {showTooltips && tooltip.visible && (
        <div
          className="absolute z-10 px-4 py-3 text-sm text-black bg-white rounded-lg shadow-lg pointer-events-none whitespace-pre-line border border-gray-200 font-bold"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 'bold',
          }}
        >
          &quot;{tooltip.content}&quot;
        </div>
      )}
    </div>
  );
}

/**
 * Simplified mindmap for mobile/touch devices
 */
export function MindmapVisualizationMobile({
  data,
  className,
  onNodeClick,
  onNodeHover,
}: Pick<MindmapVisualizationProps, 'data' | 'className' | 'onNodeClick' | 'onNodeHover'>) {
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);

  const handleNodeClick = (node: MindmapNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    onNodeClick?.(node);
  };

  if (data.nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🧠</div>
          <p>No concepts to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Node grid */}
      <div className="grid grid-cols-2 gap-4">
        {data.nodes.map(node => (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node)}
            onMouseEnter={() => onNodeHover?.(node)}
            onMouseLeave={() => onNodeHover?.(null)}
            className={cn(
              'p-4 rounded-lg text-center transition-all duration-200',
              'hover:scale-105 active:scale-95',
              getNodeColorClasses(node.color),
              selectedNode?.id === node.id && 'ring-2 ring-purple-300 ring-offset-2'
            )}
          >
            <div className="font-medium text-sm">{node.label}</div>
            {node.sourceSentences.length > 0 && (
              <div className="text-xs opacity-75 mt-1">
                {node.sourceSentences.length} sentence{node.sourceSentences.length !== 1 ? 's' : ''}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">{selectedNode.label}</h3>
          {selectedNode.sourceSentences.length > 0 && (
            <div className="text-sm text-purple-700">
              <p className="font-medium mb-1">From these sentences:</p>
              <ul className="list-disc list-inside space-y-1">
                {selectedNode.sourceSentences.map((sentence, index) => (
                  <li key={index}>{sentence}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

