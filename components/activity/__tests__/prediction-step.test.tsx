/**
 * Tests for PredictionStep component
 * Task 5.6: Final step where users ask Zhorai to predict animal habitat
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PredictionStep } from '../prediction-step';
import { ActivityProvider } from '@/lib/context/activity-context';

// Mock the hooks
jest.mock('@/hooks/use-enhanced-text-to-speech', () => ({
  useEnhancedTextToSpeech: () => ({
    speak: jest.fn(),
    isSpeaking: false,
  }),
}));

jest.mock('@/hooks/use-speech-recognition', () => ({
  useSpeechRecognition: () => ({
    transcript: '',
    isListening: false,
    startListening: jest.fn(),
    stopListening: jest.fn(),
    error: null,
  }),
}));

describe('PredictionStep', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnPredictionMade = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <ActivityProvider initialStep="prediction">
        {component}
      </ActivityProvider>
    );
  };

  const defaultProps = {
    selectedAnimal: 'bees' as const,
    userSentences: [
      'Bees live in trees',
      'Bees collect nectar from flowers',
      'Bees don\'t like water'
    ],
    onNext: mockOnNext,
    onPrevious: mockOnPrevious,
    onPredictionMade: mockOnPredictionMade,
  };

  it('renders the main heading with animal name', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    expect(screen.getByText(/Based on what you've taught Zhorai, do you think Zhorai can guess where a bees lives/)).toBeInTheDocument();
  });

  it('renders the speech input button', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    expect(screen.getByText('Press and speak')).toBeInTheDocument();
  });

  it('shows example question with animal name', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    expect(screen.getByText('Example: "Where do bees live?"')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('renders Zhorai character image', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    const zhoraiImage = screen.getByAltText('Zhorai');
    expect(zhoraiImage).toBeInTheDocument();
  });

  it('calls onPredictionMade when component mounts with sentences', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    expect(mockOnPredictionMade).toHaveBeenCalledWith(
      expect.objectContaining({
        ecosystems: expect.any(Array),
        topPrediction: expect.any(String),
        confidence: expect.any(Number),
        reasoning: expect.any(Array),
      })
    );
  });

  it('generates prediction based on sentence keywords', () => {
    const sentencesWithTrees = [
      'Bees live in trees',
      'Bees love forests',
      'Bees collect from flowers'
    ];
    
    renderWithContext(
      <PredictionStep 
        {...defaultProps} 
        userSentences={sentencesWithTrees}
      />
    );
    
    expect(mockOnPredictionMade).toHaveBeenCalledWith(
      expect.objectContaining({
        topPrediction: 'rainforest', // Should be rainforest due to 'trees' and 'forests'
      })
    );
  });

  it('handles different animal types', () => {
    renderWithContext(
      <PredictionStep 
        {...defaultProps} 
        selectedAnimal="dolphins"
      />
    );
    
    expect(screen.getByText(/Based on what you've taught Zhorai, do you think Zhorai can guess where a dolphins lives/)).toBeInTheDocument();
    expect(screen.getByText('Example: "Where do dolphins live?"')).toBeInTheDocument();
  });

  it('calls onNext when Continue button is clicked', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('calls onPrevious when Previous button is clicked', () => {
    renderWithContext(<PredictionStep {...defaultProps} />);
    
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('handles empty sentences gracefully', () => {
    renderWithContext(
      <PredictionStep 
        {...defaultProps} 
        userSentences={[]}
      />
    );
    
    // Should still render without crashing
    expect(screen.getByText('Press and speak')).toBeInTheDocument();
  });
});
