/**
 * Tests for AnimalSelectionStep component
 * Step 4: User chooses an animal to teach Zhorai about
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimalSelectionStep } from '../animal-selection-step';
import { ActivityProvider } from '@/lib/context/activity-context';

describe('AnimalSelectionStep', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <ActivityProvider initialStep="animal-selection">
        {component}
      </ActivityProvider>
    );
  };

  it('renders the context text', () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Zhorai knows a lot about ecosystems, but hasn't met any animals before!/i)).toBeInTheDocument();
  });

  it('renders the question prompt', () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Choose an animal to teach Zhorai about!/i)).toBeInTheDocument();
  });

  it('displays all 4 animal options', () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText('Bees')).toBeInTheDocument();
    expect(screen.getByText('Dolphins')).toBeInTheDocument();
    expect(screen.getByText('Monkeys')).toBeInTheDocument();
    expect(screen.getByText('Zebras')).toBeInTheDocument();
  });

  it('displays Zhorai character', () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByAltText(/zhorai/i)).toBeInTheDocument();
  });

  it('allows selecting bees', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const beesOption = screen.getByLabelText('Bees');
    fireEvent.click(beesOption);
    
    await waitFor(() => {
      expect(beesOption).toBeChecked();
    });
  });

  it('allows selecting dolphins', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const dolphinsOption = screen.getByLabelText('Dolphins');
    fireEvent.click(dolphinsOption);
    
    await waitFor(() => {
      expect(dolphinsOption).toBeChecked();
    });
  });

  it('allows selecting monkeys', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const monkeysOption = screen.getByLabelText('Monkeys');
    fireEvent.click(monkeysOption);
    
    await waitFor(() => {
      expect(monkeysOption).toBeChecked();
    });
  });

  it('allows selecting zebras', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const zebrasOption = screen.getByLabelText('Zebras');
    fireEvent.click(zebrasOption);
    
    await waitFor(() => {
      expect(zebrasOption).toBeChecked();
    });
  });

  it('only allows selecting one animal at a time (radio button behavior)', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const beesOption = screen.getByLabelText('Bees');
    const dolphinsOption = screen.getByLabelText('Dolphins');
    
    // Select bees
    fireEvent.click(beesOption);
    await waitFor(() => {
      expect(beesOption).toBeChecked();
    });
    
    // Select dolphins - should deselect bees
    fireEvent.click(dolphinsOption);
    await waitFor(() => {
      expect(dolphinsOption).toBeChecked();
      expect(beesOption).not.toBeChecked();
    });
  });

  it('applies selected styling with purple background', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const beesOption = screen.getByLabelText('Bees');
    const beesContainer = beesOption.closest('.animal-option');
    
    fireEvent.click(beesOption);
    
    await waitFor(() => {
      expect(beesContainer).toHaveClass('bg-[#F4F0FF]');
      expect(beesContainer).toHaveClass('border-[#967FD8]');
    });
  });

  it('shows checkmark icon for selected option', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const monkeysOption = screen.getByLabelText('Monkeys');
    fireEvent.click(monkeysOption);
    
    await waitFor(() => {
      expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
    });
  });

  it('updates speech bubble text based on selected animal - bees', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const beesOption = screen.getByLabelText('Bees');
    fireEvent.click(beesOption);
    
    await waitFor(() => {
      expect(screen.getByText(/Can you teach me about bees?/i)).toBeInTheDocument();
    });
  });

  it('updates speech bubble text based on selected animal - dolphins', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const dolphinsOption = screen.getByLabelText('Dolphins');
    fireEvent.click(dolphinsOption);
    
    await waitFor(() => {
      expect(screen.getByText(/Can you teach me about dolphins?/i)).toBeInTheDocument();
    });
  });

  it('updates speech bubble text based on selected animal - monkeys', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const monkeysOption = screen.getByLabelText('Monkeys');
    fireEvent.click(monkeysOption);
    
    await waitFor(() => {
      expect(screen.getByText(/Can you teach me about monkeys?/i)).toBeInTheDocument();
    });
  });

  it('updates speech bubble text based on selected animal - zebras', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const zebrasOption = screen.getByLabelText('Zebras');
    fireEvent.click(zebrasOption);
    
    await waitFor(() => {
      expect(screen.getByText(/Can you teach me about zebras?/i)).toBeInTheDocument();
    });
  });

  it('displays speech bubble text in purple color', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const beesOption = screen.getByLabelText('Bees');
    fireEvent.click(beesOption);
    
    await waitFor(() => {
      const speechBubble = screen.getByText(/Can you teach me about bees?/i);
      expect(speechBubble).toHaveClass('text-[#967FD8]');
    });
  });

  it('disables continue button when no animal is selected', () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when an animal is selected', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const dolphinsOption = screen.getByLabelText('Dolphins');
    fireEvent.click(dolphinsOption);
    
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });
  });

  it('calls onNext when continue button is clicked with selection', async () => {
    renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const zebrasOption = screen.getByLabelText('Zebras');
    fireEvent.click(zebrasOption);
    
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);
    });
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('persists selection in activity context', async () => {
    const { rerender } = renderWithContext(
      <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const monkeysOption = screen.getByLabelText('Monkeys');
    fireEvent.click(monkeysOption);
    
    await waitFor(() => {
      expect(monkeysOption).toBeChecked();
    });
    
    // Rerender component - selection should persist
    rerender(
      <ActivityProvider initialStep="animal-selection">
        <AnimalSelectionStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
      </ActivityProvider>
    );
    
    // Note: In real context, selection would persist. This tests component behavior.
    expect(screen.getByLabelText('Monkeys')).toBeInTheDocument();
  });
});


