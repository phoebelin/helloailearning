/**
 * Tests for Ecosystem Predictor ML model
 * Task 5.7: Unit tests for ecosystem-predictor with known input/output pairs
 * 
 * NOTE: This file contains placeholder tests for the ecosystem-predictor
 * which will be implemented in task 5.4. These tests will be updated
 * once the ecosystem-predictor.ts file is created.
 */

import { PredictionResult, EcosystemType } from '@/types/activity';

// Mock ecosystem predictor function (to be replaced with actual implementation)
const mockPredictEcosystem = (sentences: string[], animal: string): PredictionResult => {
  // Simple mock implementation for testing
  const allText = sentences.join(' ').toLowerCase();
  
  const ecosystemScores: Record<EcosystemType, number> = {
    desert: 0,
    ocean: 0,
    rainforest: 0,
    grassland: 0,
    tundra: 0,
  };

  // Simple keyword matching
  if (allText.includes('trees') || allText.includes('forest')) {
    ecosystemScores.rainforest = 0.8;
  }
  if (allText.includes('water') || allText.includes('ocean')) {
    ecosystemScores.ocean = 0.7;
  }
  if (allText.includes('hot') || allText.includes('desert') || allText.includes('dry')) {
    ecosystemScores.desert = 0.6;
  }
  if (allText.includes('grass') || allText.includes('field')) {
    ecosystemScores.grassland = 0.5;
  }
  if (allText.includes('cold') || allText.includes('snow')) {
    ecosystemScores.tundra = 0.4;
  }

  // Normalize probabilities
  const totalScore = Object.values(ecosystemScores).reduce((sum, score) => sum + score, 0);
  const probabilities = Object.entries(ecosystemScores).map(([ecosystem, score]) => ({
    ecosystem: ecosystem as EcosystemType,
    probability: totalScore > 0 ? score / totalScore : 0.2,
    influencingSentences: sentences.filter(sentence => 
      sentence.toLowerCase().includes(ecosystem.toLowerCase()) ||
      sentence.toLowerCase().includes('trees') ||
      sentence.toLowerCase().includes('water')
    ),
    keywords: [ecosystem],
  }));

  const topPrediction = probabilities.reduce((max, current) => 
    current.probability > max.probability ? current : max
  );

  return {
    ecosystems: probabilities,
    topPrediction: topPrediction.ecosystem,
    confidence: topPrediction.probability,
    reasoning: [`Based on keywords found in sentences`],
  };
};

describe('Ecosystem Predictor', () => {
  describe('predictEcosystem', () => {
    it('predicts rainforest for tree-related sentences', () => {
      const sentences = [
        'Bees live in trees',
        'Bees collect nectar from flowers in the forest',
        'Bees build hives in tall trees'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('rainforest');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.ecosystems).toHaveLength(5);
    });

    it('predicts ocean for water-related sentences', () => {
      const sentences = [
        'Dolphins swim in the ocean',
        'Dolphins eat fish from the water',
        'Dolphins live in the sea'
      ];
      
      const result = mockPredictEcosystem(sentences, 'dolphins');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('ocean');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('predicts desert for hot/dry-related sentences', () => {
      const sentences = [
        'Camels live in hot deserts',
        'Deserts have very little moisture',
        'It is very dry in the desert'
      ];
      
      const result = mockPredictEcosystem(sentences, 'camels');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('desert');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('predicts grassland for grass/field-related sentences', () => {
      const sentences = [
        'Zebras graze on grass',
        'Grasslands have open fields',
        'Animals eat grass in the prairie'
      ];
      
      const result = mockPredictEcosystem(sentences, 'zebras');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('grassland');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('predicts tundra for cold/snow-related sentences', () => {
      const sentences = [
        'Polar bears live in cold places',
        'The tundra is covered in snow',
        'Arctic animals survive in freezing temperatures'
      ];
      
      const result = mockPredictEcosystem(sentences, 'polar bears');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('tundra');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('handles mixed ecosystem indicators', () => {
      const sentences = [
        'Bees live in trees near water',
        'Bees collect nectar from flowers',
        'Bees don\'t like cold weather'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
      
      // Should have multiple ecosystems with probabilities
      const ecosystemsWithProbability = result.ecosystems.filter(e => e.probability > 0);
      expect(ecosystemsWithProbability.length).toBeGreaterThan(1);
    });

    it('handles empty sentence arrays', () => {
      const result = mockPredictEcosystem([], 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('handles sentences with no ecosystem indicators', () => {
      const sentences = [
        'Bees are insects',
        'Bees have wings',
        'Bees can fly'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
      
      // All ecosystems should have equal probability
      const probabilities = result.ecosystems.map(e => e.probability);
      probabilities.forEach(prob => {
        expect(prob).toBeCloseTo(0.2, 1);
      });
    });

    it('returns probabilities that sum to 1', () => {
      const sentences = [
        'Bees live in trees and collect nectar from flowers',
        'Bees make honey in their hives',
        'Bees work together as a colony'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      const totalProbability = result.ecosystems.reduce((sum, ecosystem) => 
        sum + ecosystem.probability, 0
      );
      
      expect(totalProbability).toBeCloseTo(1, 2);
    });

    it('includes influencing sentences for each ecosystem', () => {
      const sentences = [
        'Bees live in trees',
        'Bees collect nectar from flowers',
        'Bees don\'t like water'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      result.ecosystems.forEach(ecosystem => {
        expect(ecosystem.influencingSentences).toBeInstanceOf(Array);
        ecosystem.influencingSentences.forEach(sentence => {
          expect(sentences).toContain(sentence);
        });
      });
    });

    it('includes keywords for each ecosystem', () => {
      const sentences = [
        'Bees live in trees',
        'Bees collect nectar from flowers'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      result.ecosystems.forEach(ecosystem => {
        expect(ecosystem.keywords).toBeInstanceOf(Array);
        expect(ecosystem.keywords.length).toBeGreaterThan(0);
      });
    });

    it('provides reasoning for predictions', () => {
      const sentences = [
        'Bees live in trees',
        'Bees collect nectar from flowers'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result.reasoning).toBeInstanceOf(Array);
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reasoning[0]).toContain('keywords');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles sentences with special characters', () => {
      const sentences = [
        'Bees don\'t like water!',
        'Bees love flowers & trees.',
        'Bees are amazing insects!'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
    });

    it('handles very long sentences', () => {
      const longSentence = 'Bees are amazing insects that live in trees and collect nectar from flowers and make honey and dance to communicate with each other and work together as a colony in the forest';
      const result = mockPredictEcosystem([longSentence], 'bees');
      
      expect(result).toBeDefined();
      expect(result.topPrediction).toBe('rainforest');
    });

    it('handles mixed case sentences', () => {
      const sentences = [
        'BEES Live In TREES',
        'Bees COLLECT nectar from FLOWERS',
        'Bees DON\'T like WATER'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
    });

    it('handles sentences with numbers', () => {
      const sentences = [
        'Bees have 6 legs and 2 wings',
        'Bees can fly at 15 miles per hour',
        'A bee colony has 50,000 bees'
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
    });
  });

  describe('Integration Tests', () => {
    it('works with different animal types', () => {
      const beeSentences = ['Bees live in trees', 'Bees collect nectar'];
      const dolphinSentences = ['Dolphins swim in the ocean', 'Dolphins eat fish'];
      const zebraSentences = ['Zebras graze on grass', 'Zebras live in fields'];
      
      const beeResult = mockPredictEcosystem(beeSentences, 'bees');
      const dolphinResult = mockPredictEcosystem(dolphinSentences, 'dolphins');
      const zebraResult = mockPredictEcosystem(zebraSentences, 'zebras');
      
      expect(beeResult.topPrediction).toBe('rainforest');
      expect(dolphinResult.topPrediction).toBe('ocean');
      expect(zebraResult.topPrediction).toBe('grassland');
    });

    it('handles conflicting ecosystem indicators', () => {
      const sentences = [
        'Bees live in trees', // rainforest
        'Bees swim in water', // ocean
        'Bees graze on grass', // grassland
        'Bees live in hot deserts', // desert
        'Bees survive in cold weather' // tundra
      ];
      
      const result = mockPredictEcosystem(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
      
      // Should have multiple ecosystems with probabilities
      const ecosystemsWithProbability = result.ecosystems.filter(e => e.probability > 0);
      expect(ecosystemsWithProbability.length).toBeGreaterThan(1);
    });
  });
});

// TODO: Update these tests when ecosystem-predictor.ts is implemented in task 5.4
// The actual implementation should replace the mockPredictEcosystem function
// and these tests should be updated to use the real predictEcosystem function
