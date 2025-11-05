/**
 * Sentence Input Step Component
 * Figma: Desktop-12
 * User teaches Zhorai about the selected animal by speaking sentences
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StepComponentProps, AnimalType, MindmapNode, NodeColor, Sentence, ConceptData } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './audio-recorder';
import { MindmapVisualization, MindmapVisualizationMobile } from './mindmap-visualization';
import { cn } from '@/lib/utils';
import { validateSentence } from '@/lib/utils/validation';
import { extractConceptsFromSentenceEcosystemFormat } from '@/lib/ml/concept-extractor';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';
import Image from 'next/image';

export interface SentenceInputStepProps extends StepComponentProps {
  /** Selected animal to teach about */
  animal: AnimalType;
  /** Current sentences about the animal */
  sentences: Sentence[];
  /** Callback when sentences are updated */
  onSentencesUpdate: (sentences: Sentence[]) => void;
}

const animalNames: Record<AnimalType, string> = {
  bees: 'bees',
  dolphins: 'dolphins', 
  monkeys: 'monkeys',
  zebras: 'zebras',
};

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: string;
  onSave: (newSentence: string) => void;
  animal: AnimalType;
}

function EditModal({ isOpen, onClose, sentence, onSave, animal }: EditModalProps) {
  const [editedSentence, setEditedSentence] = useState(sentence);
  const [editError, setEditError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEditedSentence(sentence);
      setEditError(null);
    }
  }, [isOpen, sentence]);

  const handleSave = () => {
    if (!editedSentence.trim()) {
      setEditError('Sentence cannot be empty.');
      return;
    }
    const validation = validateSentence(editedSentence, animal);
    if (!validation.isValid) {
      setEditError(validation.errors[0] || 'Please provide a valid sentence about the animal.');
      return;
    }
    onSave(editedSentence.trim());
    onClose();
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg transform transition-transform duration-300 scale-95 relative"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold mb-4 pr-8">Edit Sentence</h3>
        <textarea
          value={editedSentence}
          onChange={(e) => {
            setEditedSentence(e.target.value);
            setEditError(null);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
        {editError && <p className="text-sm text-red-600 mb-4">{editError}</p>}

        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px]"
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SentenceInputStep({
  animal,
  sentences,
  onSentencesUpdate,
  onNext,
}: SentenceInputStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMindmap, setShowMindmap] = useState(false);
  const [hasHoveredNodes, setHasHoveredNodes] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const animalName = animalNames[animal];
  const canProceed = sentences.length >= 3;

  // TTS hook for Zhorai's speech - matching animal-selection-step implementation
  const { speak, isSpeaking } = useEnhancedTextToSpeech({
    rate: 0.9, // Slightly slower for child comprehension
    pitch: 1.1, // Slightly higher pitch for friendly tone
    useGoogleCloud: true, // Prefer Google Cloud TTS for better Chrome compatibility
  });

  // Auto-hide mindmap when there are fewer than 3 sentences
  useEffect(() => {
    if (sentences.length < 3) {
      setShowMindmap(false);
      setHasHoveredNodes(false); // Reset hover state when mindmap is hidden
      setShowContinueButton(false); // Reset continue button state
    }
  }, [sentences.length]);

  // Auto-scroll to mindmap when it's shown
  useEffect(() => {
    if (showMindmap) {
      // Add a small delay to ensure the mindmap is rendered
      setTimeout(() => {
        const mindmapElement = document.querySelector('[data-mindmap-section]');
        if (mindmapElement) {
          mindmapElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [showMindmap]);


  // Handle node hover events
  const handleNodeHover = useCallback((node: any) => {
    if (node && !hasHoveredNodes) {
      setHasHoveredNodes(true);
      
      // Add delay before showing continue button after hovering
      setTimeout(() => {
        setShowContinueButton(true);
      }, 2000); // 2 second delay
    }
  }, [hasHoveredNodes]);

  // Generate mindmap data from sentences using sentiment-based concept extraction
  const mindmapData = useMemo(() => {
    if (sentences.length === 0) return null;

    try {
      // Extract concepts from all sentences using sentiment-based extraction
      const allConcepts: ConceptData[] = [];
      const conceptCounts: Record<string, { count: number; sentences: string[] }> = {};
      
      sentences.forEach(sentenceObj => {
        // Use the sentiment-based concept extraction
        const concepts = extractConceptsFromSentenceEcosystemFormat(sentenceObj.sentence, animal);
        
        concepts.forEach(concept => {
          const key = concept.word.toLowerCase();
          if (!conceptCounts[key]) {
            conceptCounts[key] = { count: 0, sentences: [] };
          }
          conceptCounts[key].count++;
          if (!conceptCounts[key].sentences.includes(sentenceObj.sentence)) {
            conceptCounts[key].sentences.push(sentenceObj.sentence);
          }
        });
        
        allConcepts.push(...concepts);
      });

      // Create nodes from extracted concepts
      const nodes: MindmapNode[] = [];
      let nodeId = 0;
      
      // Add center node (animal) - this should be prominent and purple
           nodes.push({
             id: `center-${animal}`,
             label: animalName,
             type: 'concept',
             color: 'purple', // Only the center node (animal name) is purple
             size: 120, // Much larger center node
             sourceSentences: sentences.map(s => s.sentence),
             connections: [],
           });

      // Add concept nodes based on sentiment-based extraction
      Object.entries(conceptCounts)
        .filter(([word, data]) => data.count >= 1 && word !== animalName.toLowerCase())
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 8) // Limit to 8 nodes
        .forEach(([word, data]) => {
          // Get sentiment for this word by finding the FIRST occurrence in allConcepts
          // This will give us the correct abundance/color based on how the word was used
          const conceptData = allConcepts.find(c => c.word.toLowerCase() === word);
          const abundance = conceptData?.abundance || 'high';
          // Child nodes only get blue or orange - no purple
          // Blue for positive/neutral relationships, orange only for negative
          const color = abundance === 'low' ? 'orange' : 'blue';
          
          // Size based on frequency but color based on sentiment
          const size = Math.min(120, Math.max(100, data.count * 15));
          
          nodes.push({
            id: `node-${nodeId++}`,
            label: word,
            type: 'concept',
            color: color,
            size: size,
            sourceSentences: data.sentences, // This already contains all sentences that mention this concept
            connections: [`center-${animal}`],
          });
        });

      // Create edges (connections from center to other nodes)
      const edges = nodes
        .filter(node => node.id !== `center-${animal}`)
        .map(node => ({
          id: `edge-${node.id}`,
          source: `center-${animal}`,
          target: node.id,
        }));


      return {
        nodes,
        edges,
      };
    } catch (error) {
      console.error('Error generating mindmap:', error);
      return null;
    }
  }, [sentences, animal]);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTranscriptChange = async (transcript: string) => {
    setCurrentTranscript(transcript);
    setValidationError(null);
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    
    // When recording stops, finalize the transcript if it's valid
    if (currentTranscript.trim()) {
      // Check if we've reached the maximum number of sentences
      if (sentences.length >= 10) {
        setValidationError('You can only record up to 10 sentences. That\'s enough to teach Zhorai!');
        return;
      }

      // Validate the sentence
      const validation = validateSentence(currentTranscript, animal);
      
      if (!validation.isValid) {
        setValidationError(validation.errors[0] || 'Please provide a valid sentence about the animal.');
        return;
      }

      // Check for duplicates
      const isDuplicate = sentences.some(sentence => 
        sentence.sentence.toLowerCase().trim() === currentTranscript.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        setValidationError('You already taught Zhorai this! Try saying something different.');
        return;
      }

      // Extract concepts from the sentence
      const concepts = extractConceptsFromSentenceEcosystemFormat(currentTranscript.trim(), animal);

      // Create new sentence object
      const newSentence: Sentence = {
        id: `sentence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sentence: currentTranscript.trim(),
        timestamp: Date.now(),
        animalId: animal,
        concepts,
      };

      // Add the sentence to the list
      const newSentences = [...sentences, newSentence];
      onSentencesUpdate(newSentences);
      
      // Clear the current transcript
      setCurrentTranscript('');
      setValidationError(null);
    }
  };



  const handleEditSentence = (index: number, newSentence: string) => {
    const sentence = sentences[index];
    const concepts = extractConceptsFromSentenceEcosystemFormat(newSentence, animal);
    
    const updatedSentence: Sentence = {
      ...sentence,
      sentence: newSentence,
      timestamp: Date.now(),
      concepts,
    };
    
    const newSentences = [...sentences];
    newSentences[index] = updatedSentence;
    onSentencesUpdate(newSentences);
    setEditingIndex(null);
  };

  const handleDeleteSentence = (index: number) => {
    const newSentences = sentences.filter((_, i) => i !== index);
    onSentencesUpdate(newSentences);
    setShowDeleteConfirm(null);
  };

  return (
    <div id="add-sentences-step" className="flex flex-col gap-6 py-20 px-0 max-w-[682px] w-full mx-auto">
      {/* Heading - matches Figma exactly */}
      <h1 className="text-base font-normal leading-[32px] text-black text-left w-full">
        Tell Zhorai three things about {animalName}.
      </h1>

      {/* Main container with border - matches Figma exactly */}
      <div className="flex flex-col gap-4 p-6 border border-black rounded-xl w-full">
        {/* Section title */}
        <h2 className="text-base font-normal leading-[32px] text-black">
          What Zhorai learned from you about {animalName}:
        </h2>
        
        {/* Sentences container */}
        <div className="flex flex-col gap-3">
          {sentences.length === 0 && !currentTranscript ? (
            <div className="text-gray-500 italic text-base font-normal leading-[32px]">
              No sentences added yet.
            </div>
          ) : (
            <>
              {/* Existing sentences */}
              {sentences.map((sentence, index) => (
                <div
                  key={index}
                  className="group flex justify-between items-center gap-3 p-3 rounded-xl hover:bg-[#F4F0FF] transition-colors duration-200"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditingIndex(index)}
                    title="Click to edit sentence"
                  >
                    <p className="text-base font-semibold leading-[32px] text-black underline decoration-dotted decoration-gray-400 underline-offset-4">
                      {sentence.sentence}
                    </p>
                  </div>
                  
                  {/* Edit and Delete buttons - show on hover when sentences exist */}
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="flex items-center gap-1 text-black hover:text-[#967FD8] transition-colors"
                      title="Edit sentence"
                    >
                      {/* Edit icon */}
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-base font-normal leading-[32px]">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the row click
                        setShowDeleteConfirm(index);
                      }}
                      className="flex items-center gap-1 text-black hover:text-red-600 transition-colors"
                      title="Delete sentence"
                    >
                      {/* Delete icon */}
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-base font-normal leading-[32px]">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Live transcript while recording */}
              {currentTranscript && (
                <div className="flex justify-between items-center gap-3 p-3 rounded-xl bg-purple-50 border-2 border-purple-200">
                  <p className="text-base font-semibold leading-[32px] flex-1" style={{ color: '#967fd8' }}>
                    {currentTranscript}
                    <span className="animate-pulse">|</span>
                  </p>
                  <div className="text-sm font-medium" style={{ color: '#967fd8' }}>
                    {isRecording ? 'Speaking...' : 'Processing...'}
                  </div>
                </div>
              )}
              
              {/* Validation error */}
              {validationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{validationError}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action buttons row - matches Figma exactly */}
        <div className="flex flex-row items-center gap-3">
          <AudioRecorder
            showTranscript={false}
            buttonText="Press and speak to add"
            onTranscriptChange={handleTranscriptChange}
            onStart={() => {
              setIsRecording(true);
              setCurrentTranscript('');
            }}
            onStop={handleRecordingStop}
            variant="default"
            buttonClassName="px-6 py-3 h-12 rounded-xl"
            disabled={sentences.length >= 10}
          />

          <Button
            type="button"
            onClick={() => {
              const newShowMindmap = !showMindmap;
              setShowMindmap(newShowMindmap);
              
              // Trigger speech immediately when showing mindmap
              if (newShowMindmap && sentences.length >= 3) {
                const speechText = `Here's a visualization of my brain about ${animalName}!`;
                setTimeout(() => {
                  speak(speechText, {
                    onError: (error) => {
                      if (error !== 'canceled') {
                        console.warn('Speech synthesis error:', error);
                      }
                    }
                  });
                }, 300);
              }
            }}
            disabled={!canProceed}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] h-12",
              canProceed 
                ? "border border-black text-black bg-white hover:bg-gray-50 cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {canProceed 
              ? (showMindmap ? "Hide Zhorai's brain" : "See Zhorai's brain")
              : "Show Zhorai's brain"
            }
          </Button>
        </div>
      </div>

      {/* Mindmap section - shows below the main container when toggle is active */}
      {showMindmap && sentences.length > 0 && mindmapData && mindmapData.nodes.length > 0 && (
        <div className="mt-6" data-mindmap-section>
          <h3 className="text-base font-normal leading-[32px] text-black mb-4">
            Here&apos;s a visualization of my brain about {animalName}!
          </h3>
          
          {/* Mindmap and Zhorai character container */}
          <div className="relative flex items-start gap-6">
            {/* Mindmap visualization */}
            <div className="relative w-full h-96 bg-white rounded-lg border border-gray-200 p-4 flex-1">
              {isMobile ? (
                <MindmapVisualizationMobile
                  data={mindmapData}
                  onNodeClick={(node) => console.log('Clicked node:', node)}
                  onNodeHover={handleNodeHover}
                />
              ) : (
                <MindmapVisualization
                  data={mindmapData}
                  width={500}
                  height={300}
                  showTooltips={true}
                  animated={false}
                  interactive={true}
                  onNodeClick={(node) => console.log('Clicked node:', node)}
                  onNodeHover={handleNodeHover}
                />
              )}
            </div>

            {/* Zhorai character */}
            <div className="flex-shrink-0 w-[139px] h-[151px] relative">
              <Image
                src="/images/zhorai.png"
                alt="Zhorai"
                width={139}
                height={151}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        sentence={editingIndex !== null ? sentences[editingIndex].sentence : ''}
        onSave={(newSentence) => editingIndex !== null && handleEditSentence(editingIndex, newSentence)}
        animal={animal}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-6">Delete Sentence?</h3>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => handleDeleteSentence(showDeleteConfirm)}
                className="bg-red-600 text-white hover:bg-red-700 rounded-lg px-6 py-2 text-sm font-semibold"
              >
                Delete
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg px-6 py-2 text-sm font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation - only show continue button after delay following hover */}
      {showContinueButton && (
        <div className="flex justify-start items-center mt-8">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] h-12"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
