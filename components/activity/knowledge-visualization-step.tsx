/**
 * Knowledge Visualization Step Component
 * Figma: Desktop-8
 * Shows Zhorai's existing knowledge about the selected ecosystem in a mindmap
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StepComponentProps, EcosystemType, MindmapNode, NodeColor } from '@/types/activity';
import { getEcosystemMindmap } from '@/lib/data/ecosystem-knowledge';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useActivity } from '@/lib/context/activity-context';
import { cn } from '@/lib/utils';

export interface KnowledgeVisualizationStepProps extends StepComponentProps {
  /** The selected ecosystem to show knowledge for */
  ecosystem: EcosystemType;
  /** Callback when user wants to select a different ecosystem */
  onChangeEcosystem?: () => void;
}

/**
 * Get color class for mindmap node based on NodeColor
 */
function getNodeColorClass(color: NodeColor): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-500 border-blue-600 text-white';
    case 'orange':
      return 'bg-orange-500 border-orange-600 text-white';
    case 'purple':
      return 'bg-purple-500 border-purple-600 text-white';
    case 'neutral':
      return 'bg-gray-400 border-gray-500 text-white';
    default:
      return 'bg-gray-400 border-gray-500 text-white';
  }
}

/**
 * Get size class for mindmap node based on size value
 */
function getNodeSizeClass(size: number): string {
  if (size >= 3) return 'w-20 h-20 text-sm';
  if (size >= 2) return 'w-16 h-16 text-xs';
  return 'w-12 h-12 text-[11px]';
}

/**
 * Interactive mindmap visualization component
 */
function InteractiveMindmap({ 
  nodes, 
  ecosystemName 
}: { 
  nodes: MindmapNode[];
  ecosystemName: string;
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Center node (ecosystem) - create one if it doesn't exist
  const centerNode = nodes.find(n => n.type === 'concept' && n.label.toLowerCase().includes(ecosystemName.toLowerCase())) || {
    id: 'center-ecosystem',
    label: ecosystemName.charAt(0).toUpperCase() + ecosystemName.slice(1),
    type: 'concept' as NodeType,
    color: 'purple' as NodeColor,
    size: 3,
    sourceSentences: [],
    connections: [],
  };
  
  const otherNodes = nodes.filter(n => n.id !== centerNode?.id).slice(0, 8);

  return (
    <div className="relative w-[700px] h-[440px]">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#967FD8" opacity="0.3" />
          </marker>
        </defs>
        {/* Draw lines from center to each surrounding node */}
        {otherNodes.map((node, index) => {
          const angle = (index / otherNodes.length) * 2 * Math.PI;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Center point
          const centerX = 350; // Half of 700px
          const centerY = 220; // Half of 440px
          
          // End point
          const endX = centerX + x;
          const endY = centerY + y;
          
          return (
            <line
              key={`line-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="#967FD8"
              strokeWidth="2"
              strokeOpacity="0.3"
              strokeDasharray="4,4"
            />
          );
        })}
      </svg>

      {/* Interactive nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>
        {/* Center Node (Ecosystem) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={cn(
              'w-28 h-28 rounded-full border-2 flex items-center justify-center',
              'font-bold shadow-lg transition-transform hover:scale-110 cursor-pointer',
              getNodeColorClass(centerNode.color)
            )}
            onMouseEnter={() => setHoveredNode(centerNode.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <span className="text-center px-2 text-sm">{centerNode.label}</span>
          </div>
        </div>

        {/* Surrounding Nodes */}
        {otherNodes.map((node, index) => {
          const angle = (index / otherNodes.length) * 2 * Math.PI;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={node.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className={cn(
                  'rounded-full border-2 flex items-center justify-center',
                  'font-medium shadow-sm transition-all duration-200',
                  'hover:scale-110 hover:shadow-md cursor-pointer',
                  getNodeSizeClass(node.size),
                  getNodeColorClass(node.color)
                )}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <span className="text-center px-1 leading-tight">{node.label}</span>
              </div>

              {/* Tooltip - positioned outside the node wrapper for higher stacking */}
            </div>
          );
        })}
        
        {/* Render tooltips separately with highest z-index */}
        {otherNodes.map((node, index) => {
          if (hoveredNode !== node.id || node.sourceSentences.length === 0) return null;
          
          const angle = (index / otherNodes.length) * 2 * Math.PI;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`tooltip-${node.id}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                zIndex: 1000,
              }}
            >
              <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 w-64 p-4 bg-white rounded-lg shadow-xl border-2 border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-bold text-center text-black">
                  "{node.sourceSentences[0]}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Knowledge Visualization Step Component
 */
export function KnowledgeVisualizationStep({
  ecosystem,
  onNext,
  onPrevious,
  onChangeEcosystem,
}: KnowledgeVisualizationStepProps) {
  const mindmap = getEcosystemMindmap(ecosystem);
  const { markKnowledgeVisualizationSpoken } = useActivity();
  
  const [isThinking, setIsThinking] = useState(false);
  const [showMindmap, setShowMindmap] = useState(false);

  const { speak, isSupported } = useTextToSpeech({
    rate: 0.9, // Slightly slower for child comprehension
    pitch: 1.1, // Slightly higher pitch for friendly tone
  });

  // Get ecosystem display name
  const ecosystemNames: Record<EcosystemType, string> = {
    desert: 'deserts',
    ocean: 'oceans',
    rainforest: 'rainforests',
    grassland: 'grasslands',
    tundra: 'tundras',
  };

  const ecosystemName = ecosystemNames[ecosystem];
  const ecosystemNameSingular = ecosystem === 'desert' ? 'desert' : ecosystemName.slice(0, -1);

  // Speak the message when the component first loads or when ecosystem changes
  useEffect(() => {
    // Reset mindmap visibility when ecosystem changes
    setShowMindmap(false);
    setIsThinking(false);

    const message = `I've heard so much about ${ecosystemName} before! Here's a visualization of my brain:`;
    
    console.log('Knowledge Visualization: Starting speech...', { 
      isSupported, 
      message, 
      ecosystem,
      speechSynthesis: typeof window !== 'undefined' ? window.speechSynthesis : null 
    });
    
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      if (isSupported) {
        console.log('Knowledge Visualization: Calling speak()...');
        speak(message, {
          onStart: () => {
            // Mark as spoken when speech actually starts
            console.log('Knowledge Visualization: Speech started');
            markKnowledgeVisualizationSpoken();
          },
          onEnd: () => {
            console.log('Knowledge Visualization: Speech ended, showing thinking state');
            // After speaking, show thinking state
            setIsThinking(true);
            // After thinking, show mindmap
            setTimeout(() => {
              console.log('Knowledge Visualization: Showing mindmap');
              setIsThinking(false);
              setShowMindmap(true);
            }, 1500); // 1.5 second thinking time
          },
          onError: (error) => {
            console.error('Knowledge Visualization: Speech error:', error);
            // Show mindmap anyway if speech fails
            setIsThinking(true);
            setTimeout(() => {
              setIsThinking(false);
              setShowMindmap(true);
            }, 1500);
          },
        });
      } else {
        console.warn('Knowledge Visualization: Speech not supported! Browser may not support Web Speech API');
        console.log('Knowledge Visualization: Going straight to mindmap without speech');
        // If speech not supported, go straight to thinking then mindmap
        // Mark as spoken immediately since no speech will happen
        markKnowledgeVisualizationSpoken();
        setIsThinking(true);
        setTimeout(() => {
          setIsThinking(false);
          setShowMindmap(true);
        }, 2000);
      }
    }, 500);

    return () => {
      console.log('Knowledge Visualization: Cleanup', { ecosystem });
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ecosystem, ecosystemName]);

  return (
    <div className="flex flex-col gap-6 py-20 px-4 max-w-[682px] mx-auto">
      {/* Main content area */}
      <div className="flex flex-col gap-6 w-full relative">
        {/* Message */}
        <p className="text-base font-normal leading-[32px] text-black w-full">
          I've heard so much about {ecosystemName} before! Here's a visualization of my brain:
        </p>
        
        {/* Mindmap Container - fixed width and height to match mindmap */}
        <div className="relative flex flex-col items-center gap-6 border border-black rounded-xl p-6 w-[700px] h-[580px] mx-auto">
          {isThinking ? (
            /* Loading/Thinking State - same structure as mindmap state */
            <>
              {/* Instruction text placeholder - same as mindmap state */}
              <p className="text-base font-normal leading-[32px] text-black w-full">
                Hover over the circles to see what sentences I learned that correspond with each word.
              </p>
              
              {/* Thinking animation in place of mindmap - same dimensions as mindmap */}
              <div className="relative w-[700px] h-[440px] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                  {/* Animated thinking indicator */}
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-[#967FD8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-[#967FD8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-[#967FD8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-base font-semibold text-[#967FD8]">
                    Zhorai is thinking...
                  </p>
                </div>
              </div>
            </>
          ) : showMindmap ? (
            /* Show mindmap after thinking */
            <>
              {/* Instruction text */}
              <p className="text-base font-normal leading-[32px] text-black w-full">
                Hover over the circles to see what sentences I learned that correspond with each word.
              </p>
              
              {/* Interactive Mindmap with fade-in animation */}
              <div className="animate-in fade-in duration-700">
                <InteractiveMindmap 
                  nodes={mindmap.nodes}
                  ecosystemName={ecosystemNameSingular}
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Zhorai character - positioned on top of the box at bottom right */}
        <div className="absolute bottom-[60px] right-0 w-[139px] h-[151px] z-10">
          <Image
            src="/images/zhorai.png"
            alt="Zhorai"
            width={139}
            height={151}
            className="object-contain"
          />
        </div>

        {/* Action Buttons - only show after mindmap appears */}
        {showMindmap && (
          <div className="flex flex-row items-center gap-3 animate-in fade-in duration-500">
            <button
              type="button"
              onClick={onNext}
              className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
            >
              Continue
            </button>
            
            <button
              type="button"
              onClick={() => {
                // Use the same scroll behavior as the existing step navigation
                const ecosystemStep = document.querySelector('[data-step="ecosystem-selection"]');
                if (ecosystemStep) {
                  // Same timing and behavior as the existing useEffect in test page
                  setTimeout(() => {
                    ecosystemStep.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 100); // Same 100ms delay as existing navigation
                } else {
                  // Fallback to top if step not found
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Call the ecosystem change handler
                if (onChangeEcosystem) {
                  onChangeEcosystem();
                } else if (onPrevious) {
                  onPrevious();
                }
              }}
              className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
            >
              Try another ecosystem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
