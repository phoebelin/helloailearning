/**
 * Sentence Input Step Component
 * Figma: Desktop-12
 * User teaches Zhorai about the selected animal by speaking sentences
 */

'use client';

import React, { useState, useEffect } from 'react';
import { StepComponentProps, AnimalType } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './audio-recorder';
import { cn } from '@/lib/utils';
import { validateSentence } from '@/lib/utils/validation';

export interface SentenceInputStepProps extends StepComponentProps {
  /** Selected animal to teach about */
  animal: AnimalType;
  /** Current sentences about the animal */
  sentences: string[];
  /** Callback when sentences are updated */
  onSentencesUpdate: (sentences: string[]) => void;
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
      setEditError(validation.error || 'Please provide a valid sentence about the animal.');
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
  onPrevious,
}: SentenceInputStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const animalName = animalNames[animal];
  const canProceed = sentences.length >= 3;

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
        setValidationError(validation.error || 'Please provide a valid sentence about the animal.');
        return;
      }

      // Check for duplicates
      const isDuplicate = sentences.some(sentence => 
        sentence.toLowerCase().trim() === currentTranscript.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        setValidationError('You already taught Zhorai this! Try saying something different.');
        return;
      }

      // Add the sentence to the list
      const newSentences = [...sentences, currentTranscript.trim()];
      onSentencesUpdate(newSentences);
      
      // Clear the current transcript
      setCurrentTranscript('');
      setValidationError(null);
    }
  };



  const handleEditSentence = (index: number, newSentence: string) => {
    const newSentences = [...sentences];
    newSentences[index] = newSentence;
    onSentencesUpdate(newSentences);
    setEditingIndex(null);
  };

  const handleDeleteSentence = (index: number) => {
    const newSentences = sentences.filter((_, i) => i !== index);
    onSentencesUpdate(newSentences);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col gap-6 py-20 px-0 max-w-[682px] w-full mx-auto">
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
                      {sentence}
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
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] h-12",
              canProceed 
                ? "border border-black text-black bg-white hover:bg-gray-50 cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            See Zhorai's brain
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        sentence={editingIndex !== null ? sentences[editingIndex] : ''}
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
    </div>
  );
}
