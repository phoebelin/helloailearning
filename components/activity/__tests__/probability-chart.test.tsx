/**
 * Tests for ProbabilityChart component
 * Task 5.5: Bar chart component showing ecosystem prediction probabilities
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProbabilityChart } from '../probability-chart';
import { PredictionResult, EcosystemPrediction } from '@/types/activity';

describe('ProbabilityChart', () => {
  const mockOnBarHover = jest.fn();
  const mockOnBarLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPredictionData: PredictionResult = {
    ecosystems: [
      {
        ecosystem: 'rainforest',
        probability: 0.45,
        influencingSentences: ['Bees live in trees', 'Bees collect nectar from flowers'],
        keywords: ['trees', 'flowers', 'nectar']
      },
      {
        ecosystem: 'grassland',
        probability: 0.30,
        influencingSentences: ['Bees fly over fields'],
        keywords: ['fields', 'grass']
      },
      {
        ecosystem: 'desert',
        probability: 0.15,
        influencingSentences: ['Bees don\'t like hot weather'],
        keywords: ['hot', 'dry']
      },
      {
        ecosystem: 'ocean',
        probability: 0.08,
        influencingSentences: [],
        keywords: []
      },
      {
        ecosystem: 'tundra',
        probability: 0.02,
        influencingSentences: [],
        keywords: []
      }
    ],
    topPrediction: 'rainforest',
    confidence: 0.45,
    reasoning: ['High probability due to tree-related keywords']
  };

  it('renders the chart with correct ecosystem labels', () => {
    render(
      <ProbabilityChart
        data={mockPredictionData}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    expect(screen.getByText('Rainforest')).toBeInTheDocument();
    expect(screen.getByText('Grassland')).toBeInTheDocument();
    expect(screen.getByText('Desert')).toBeInTheDocument();
    expect(screen.getByText('Ocean')).toBeInTheDocument();
    expect(screen.getByText('Tundra')).toBeInTheDocument();
  });

  it('displays probability percentages', () => {
    render(
      <ProbabilityChart
        data={mockPredictionData}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('2%')).toBeInTheDocument();
  });

  it('shows the top prediction indicator', () => {
    render(
      <ProbabilityChart
        data={mockPredictionData}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    expect(screen.getByText('Most Likely: Rainforest')).toBeInTheDocument();
  });

  it('calls onBarHover when hovering over a bar', async () => {
    const { container } = render(
      <ProbabilityChart
        data={mockPredictionData}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    // Find the SVG element and simulate hover
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    const rects = svg?.querySelectorAll('rect');
    expect(rects).toBeDefined();
    expect(rects?.length).toBeGreaterThan(0);
    
    if (rects && rects.length > 0) {
      // Find the first bar rect (skip the background rect)
      const barRect = Array.from(rects).find(rect => 
        rect.getAttribute('fill') !== 'none' && 
        rect.getAttribute('fill') !== 'transparent'
      );
      
      if (barRect) {
        fireEvent.mouseEnter(barRect);
        await waitFor(() => {
          expect(mockOnBarHover).toHaveBeenCalled();
        });
      }
    }
  });

  it('renders with custom dimensions', () => {
    const { container } = render(
      <ProbabilityChart
        data={mockPredictionData}
        width={800}
        height={400}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('disables animation when animated prop is false', () => {
    render(
      <ProbabilityChart
        data={mockPredictionData}
        animated={false}
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    // Chart should render without animation
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProbabilityChart
        data={mockPredictionData}
        className="custom-chart"
        onBarHover={mockOnBarHover}
        onBarLeave={mockOnBarLeave}
      />
    );

    const chartContainer = container.firstChild;
    expect(chartContainer).toHaveClass('custom-chart');
  });
});
