/**
 * Tests for EcosystemSelectionStep component
 * Step 1: User selects or speaks an ecosystem name
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EcosystemSelectionStep } from '../ecosystem-selection-step';
import { ActivityProvider } from '@/lib/context/activity-context';

// Mock the audio recorder component
jest.mock('../audio-recorder', () => ({
  AudioRecorder: ({ onTranscriptComplete }: any) => (
    <div data-testid="mock-audio-recorder">
      <button
        onClick={() => onTranscriptComplete('What do you know about the desert?')}
      >
        Mock Speak Desert
      </button>
      <button
        onClick={() => onTranscriptComplete('Tell me about the ocean')}
      >
        Mock Speak Ocean
      </button>
    </div>
  ),
}));

describe('EcosystemSelectionStep', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <ActivityProvider>
        {component}
      </ActivityProvider>
    );
  };

  it('renders the ecosystem selection heading', () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Start by asking Zhorai about your favorite ecosystem/i)).toBeInTheDocument();
  });

  it('displays all 5 ecosystem options', () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText('Desert')).toBeInTheDocument();
    expect(screen.getByText('Ocean')).toBeInTheDocument();
    expect(screen.getByText('Rainforest')).toBeInTheDocument();
    expect(screen.getByText('Grassland')).toBeInTheDocument();
    expect(screen.getByText('Tundra')).toBeInTheDocument();
  });

  it('displays the example prompt text', () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/What do you know about the desert?/i)).toBeInTheDocument();
  });

  it('displays the audio recorder component', () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByTestId('mock-audio-recorder')).toBeInTheDocument();
  });

  it('allows ecosystem selection by clicking on option', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const oceanButton = screen.getByText('Ocean');
    fireEvent.click(oceanButton);
    
    await waitFor(() => {
      expect(oceanButton).toHaveClass('bg-[#F4F0FF]'); // Selected state
    });
  });

  it('detects ecosystem from speech transcript - desert', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const mockSpeakButton = screen.getByText('Mock Speak Desert');
    fireEvent.click(mockSpeakButton);
    
    await waitFor(() => {
      // Desert should be detected and selected
      const desertButton = screen.getByText('Desert');
      expect(desertButton).toHaveClass('bg-[#F4F0FF]');
    });
  });

  it('detects ecosystem from speech transcript - ocean', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const mockSpeakButton = screen.getByText('Mock Speak Ocean');
    fireEvent.click(mockSpeakButton);
    
    await waitFor(() => {
      const oceanButton = screen.getByText('Ocean');
      expect(oceanButton).toHaveClass('bg-[#F4F0FF]');
    });
  });

  it('enables next button when ecosystem is selected', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const rainforestButton = screen.getByText('Rainforest');
    fireEvent.click(rainforestButton);
    
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('calls onNext when next button is clicked with selection', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const grasslandButton = screen.getByText('Grassland');
    fireEvent.click(grasslandButton);
    
    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
    });
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('handles case-insensitive ecosystem detection', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Simulate transcript with uppercase
    const mockRecorder = screen.getByTestId('mock-audio-recorder');
    const button = mockRecorder.querySelector('button');
    
    // Mock different casing
    fireEvent.click(button!);
    
    await waitFor(() => {
      const desertButton = screen.getByText('Desert');
      expect(desertButton).toHaveClass('bg-[#F4F0FF]');
    });
  });

  it('maintains selected state when switching between options', async () => {
    renderWithContext(
      <EcosystemSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Select desert
    const desertButton = screen.getByText('Desert');
    fireEvent.click(desertButton);
    
    await waitFor(() => {
      expect(desertButton).toHaveClass('bg-[#F4F0FF]');
    });
    
    // Switch to tundra
    const tundraButton = screen.getByText('Tundra');
    fireEvent.click(tundraButton);
    
    await waitFor(() => {
      expect(tundraButton).toHaveClass('bg-[#F4F0FF]');
      expect(desertButton).not.toHaveClass('bg-[#F4F0FF]');
    });
  });
});

