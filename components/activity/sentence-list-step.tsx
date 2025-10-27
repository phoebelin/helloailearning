/**
 * Sentence List Step Component
 * Figma: Desktop-13
 * User can view, edit, and delete sentences they've taught Zhorai
 */

'use client';

import React, { useState } from 'react';
import { StepComponentProps, AnimalType } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './audio-recorder';
import { cn } from '@/lib/utils';
import { validateSentence } from '@/lib/utils/validation';
import Image from 'next/image';

export interface SentenceListStepProps extends StepComponentProps {
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
  const [editText, setEditText] = useState(sentence);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = () => {
    if (!editText.trim()) {
      setValidationError('Please provide a sentence about the animal.');
      return;
    }

    const validation = validateSentence(editText, animal);
    if (!validation.isValid) {
      setValidationError(validation.errors[0] || 'Please provide a valid sentence about the animal.');
      return;
    }

    onSave(editText.trim());
    onClose();
  };

  const handleTranscriptChange = (transcript: string) => {
    setCurrentTranscript(transcript);
    setValidationError(null);
  };

  const handleUseTranscript = () => {
    if (currentTranscript.trim()) {
      setEditText(currentTranscript.trim());
      setCurrentTranscript('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Sentence</h3>
        
        {/* Text input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sentence about {animalNames[animal]}:
          </label>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
            placeholder="Type or record a sentence about the animal..."
          />
        </div>

        {/* Audio recorder for re-recording */}
        <div className="mb-4">
          <AudioRecorder
            onTranscriptChange={handleTranscriptChange}
            onRecordingStart={() => setIsRecording(true)}
            onRecordingStop={() => setIsRecording(false)}
            placeholder="Or record a new sentence..."
            disabled={false}
          />
          
          {currentTranscript && (
            <Button
              onClick={handleUseTranscript}
              className="mt-2 bg-[#967fd8] text-white hover:bg-[#967fd8]/80 rounded-lg px-4 py-2 text-sm"
            >
              Use this recording
            </Button>
          )}
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-black/90 rounded-lg px-6 py-2 text-sm font-semibold"
          >
            Save Changes
          </Button>
          <Button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg px-6 py-2 text-sm font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SentenceListStep({
  animal,
  sentences,
  onSentencesUpdate,
  onNext,
  onPrevious,
}: SentenceListStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const animalName = animalNames[animal];
  const canProceed = sentences.length >= 3;

  const handleTranscriptChange = (transcript: string) => {
    setCurrentTranscript(transcript);
    setValidationError(null);
  };

  const handleAddSentence = async () => {
    if (!currentTranscript.trim()) {
      setValidationError('Please say something about the animal first.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Validate the sentence
      const validation = validateSentence(currentTranscript, animal);
      
      if (!validation.isValid) {
        setValidationError(validation.errors[0] || 'Please provide a valid sentence about the animal.');
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

      // Add the sentence
      const newSentences = [...sentences, currentTranscript.trim()];
      onSentencesUpdate(newSentences);
      
      // Clear the current transcript
      setCurrentTranscript('');
      setValidationError(null);
      
    } catch (error) {
      console.error('Error adding sentence:', error);
      setValidationError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
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

  const handleRecordingStart = () => {
    setIsRecording(true);
    setValidationError(null);
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Main content area - matches Figma exactly */}
      <div className="flex flex-col gap-6 py-20 px-0 max-w-[682px] w-full">
        {/* Heading */}
        <h1 className="text-base font-normal leading-[32px] text-black text-left w-full">
          Tell Zhorai three things about {animalName}.
        </h1>

        {/* Main container with border */}
        <div className="flex flex-col gap-4 p-6 border border-black rounded-xl w-full">
          {/* Section title */}
          <h2 className="text-base font-normal leading-[32px] text-black">
            What Zhorai learned from you about {animalName}:
          </h2>
          
          {/* Sentences container */}
          <div className="flex flex-col gap-3">
            {sentences.length === 0 ? (
              <div className="text-gray-500 italic text-base font-normal leading-[32px]">
                No sentences added yet. Press and speak to add your first sentence!
              </div>
            ) : (
              sentences.map((sentence, index) => (
                <div
                  key={index}
                  className={cn(
                    "group flex justify-between items-center gap-3 p-3 rounded-xl",
                    index === 0 ? "bg-[#F4F0FF]" : "bg-white"
                  )}
                >
                  <p className="text-base font-semibold leading-[32px] text-black flex-1">
                    {sentence}
                  </p>
                  
                  {/* Edit and Delete buttons - show on hover */}
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="flex items-center gap-1 text-black hover:text-blue-600 transition-colors"
                      title="Edit sentence"
                    >
                      {/* Edit icon */}
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-base font-normal leading-[32px]">Edit</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(index)}
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
              ))
            )}
          </div>
          
        </div>

        {/* Current transcript display */}
        {currentTranscript && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">You said:</p>
            <p className="text-base text-black">{currentTranscript}</p>
            {validationError && (
              <p className="text-sm text-red-600 mt-2">{validationError}</p>
            )}
          </div>
        )}

        {/* Audio recorder */}
        <div className="flex flex-col gap-4">
          <AudioRecorder
            onTranscriptChange={handleTranscriptChange}
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
            placeholder="Press and speak to add more sentences..."
            disabled={isProcessing}
          />
          
          {/* Add sentence button */}
          {currentTranscript && (
            <Button
              onClick={handleAddSentence}
              disabled={isProcessing || !!validationError}
              className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Adding...' : 'Add this sentence'}
            </Button>
          )}
        </div>

        {/* Action buttons - matches Figma exactly */}
        <div className="flex flex-row items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "rounded-xl px-6 py-3 text-sm font-semibold leading-[17px]",
              canProceed 
                ? "bg-black text-white hover:bg-black/90 cursor-pointer" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            See Zhorai's brain
          </Button>

          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
            >
              Previous
            </Button>
          )}
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
            <h3 className="text-lg font-semibold mb-4">Delete Sentence?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this sentence? This action cannot be undone.
            </p>
            <div className="flex gap-3">
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
