/**
 * Tests for UnderstandingCheckStep component
 * Step 3: Multiple choice comprehension check about mindmap visualization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnderstandingCheckStep } from '../understanding-check-step';
import { ActivityProvider } from '@/lib/context/activity-context';

describe('UnderstandingCheckStep', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <ActivityProvider initialStep="understanding-check">
        {component}
      </ActivityProvider>
    );
  };

  it('renders the main question', () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/What do you notice about the words and colors of each circle?/i)).toBeInTheDocument();
  });

  it('renders the instruction text', () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Take a look at each circle/i)).toBeInTheDocument();
  });

  it('displays both answer options', () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Zhorai pulled out key words from the sentences/i)).toBeInTheDocument();
    expect(screen.getByText(/Zhorai used blue for "lots of" and orange for "little of"/i)).toBeInTheDocument();
  });

  it('displays the condensed mindmap visualization', () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Check for mindmap nodes - these will be dynamic based on ecosystem
    const mindmapNodes = screen.getAllByText(/sand|plants|cactus|water|heat|cold/i);
    expect(mindmapNodes.length).toBeGreaterThan(0);
  });

  it('allows selecting first answer option', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    await waitFor(() => {
      expect(firstCheckbox).toBeChecked();
    });
  });

  it('allows selecting second answer option', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(secondCheckbox);
    
    await waitFor(() => {
      expect(secondCheckbox).toBeChecked();
    });
  });

  it('allows selecting multiple answers', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    await waitFor(() => {
      expect(firstCheckbox).toBeChecked();
      expect(secondCheckbox).toBeChecked();
    });
  });

  it('applies selected styling to checked options', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstOption = screen.getByText(/Zhorai pulled out key words/i).closest('button');
    const checkbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(firstOption).toHaveClass('bg-[#F4F0FF]');
      expect(firstOption).toHaveClass('border-[#967FD8]');
    });
  });

  it('disables check button when no answers selected', () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const submitButton = screen.getByRole('button', { name: /check/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables check button when one answer selected', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /check/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('enables check button when both answers are selected', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /check/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows success feedback when both correct answers are submitted', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/That's right!/i)).toBeInTheDocument();
    });
  });

  it('shows error feedback when incorrect answers are submitted', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Select only one answer (incorrect)
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    // Submit with only one answer selected
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/💪 Hey, that's okay!/i)).toBeInTheDocument();
    });
  });

  it('shows Show answer button after incorrect submission', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
    });
  });

  it('shows inline explanation when Why? button is clicked', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const whyButton = screen.getByRole('button', { name: /why/i });
      fireEvent.click(whyButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Zhorai learned about each ecosystem through many sentences/i)).toBeInTheDocument();
    });
  });

  it('shows correct answers and explanation when Show answer is clicked', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Select only one incorrect answer
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words from the sentences/i 
    });
    fireEvent.click(firstCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);
    });
    
    await waitFor(() => {
      // Both checkboxes should be selected
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
      expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');
      
      // Explanation should be visible
      expect(screen.getByText(/Zhorai learned about each ecosystem through many sentences/i)).toBeInTheDocument();
      
      // Should show Continue and Why? buttons
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /why/i })).toBeInTheDocument();
    });
  });

  it('allows retry after incorrect submission', async () => {
    renderWithContext(
      <UnderstandingCheckStep ecosystem="desert" onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Select only one answer (incorrect)
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    // Submit with only one answer selected
    const submitButton = screen.getByRole('button', { name: /check/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);
    });
    
    await waitFor(() => {
      // Should be back to initial state
      expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
      expect(screen.queryByText(/Not quite right/i)).not.toBeInTheDocument();
    });
  });
});


