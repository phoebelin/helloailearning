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
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/What do you notice about the words and colors of each circle?/i)).toBeInTheDocument();
  });

  it('renders the instruction text', () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Take a look at each circle/i)).toBeInTheDocument();
  });

  it('displays both answer options', () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    expect(screen.getByText(/Zhorai pulled out key words from the sentences/i)).toBeInTheDocument();
    expect(screen.getByText(/Zhorai used blue for "lots of" and orange for "little of"/i)).toBeInTheDocument();
  });

  it('displays the condensed mindmap visualization', () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    // Check for mindmap nodes
    expect(screen.getByText('sand')).toBeInTheDocument();
    expect(screen.getByText('plants')).toBeInTheDocument();
  });

  it('allows selecting first answer option', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
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
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
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
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
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
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstOption = screen.getByText(/Zhorai pulled out key words/i).closest('div');
    const checkbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(firstOption).toHaveClass('bg-[#F4F0FF]');
      expect(firstOption).toHaveClass('border-[#967FD8]');
    });
  });

  it('disables submit button when no answers selected', () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when only one answer selected', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    fireEvent.click(firstCheckbox);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('enables submit button when both answers are selected', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
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
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows success feedback when both correct answers are submitted', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });
  });

  it('calls onNext after successful submission', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    const secondCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai used blue for "lots of"/i 
    });
    
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  it('allows deselecting answers', async () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', { 
      name: /Zhorai pulled out key words/i 
    });
    
    // Select
    fireEvent.click(firstCheckbox);
    await waitFor(() => {
      expect(firstCheckbox).toBeChecked();
    });
    
    // Deselect
    fireEvent.click(firstCheckbox);
    await waitFor(() => {
      expect(firstCheckbox).not.toBeChecked();
    });
  });

  it('shows node colors correctly in mindmap preview', () => {
    renderWithContext(
      <UnderstandingCheckStep onNext={mockOnNext} onPrevious={mockOnPrevious} />
    );
    
    const sandNode = screen.getByText('sand').closest('.mindmap-node');
    const plantsNode = screen.getByText('plants').closest('.mindmap-node');
    
    // Sand should be blue (lots of)
    expect(sandNode).toHaveClass('bg-blue-500');
    // Plants should be orange (little of)
    expect(plantsNode).toHaveClass('bg-orange-500');
  });
});

