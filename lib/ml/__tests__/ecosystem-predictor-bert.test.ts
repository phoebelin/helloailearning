/**
 * Tests for BERT-based Ecosystem Predictor
 * Tests semantic similarity using word embeddings
 */

import { ecosystemPredictor, EmbeddingPredictionResult } from '@/lib/ml/ecosystem-predictor-bert';
import { EcosystemType } from '@/types/activity';

// Mock the @xenova/transformers library for testing
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn(),
}));

// Reset the singleton instance before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset the singleton instance
  (ecosystemPredictor as any).featureExtractor = null;
  (ecosystemPredictor as any).isInitialized = false;
});

describe('BERT-based Ecosystem Predictor', () => {
  describe('Model Initialization', () => {
    it('should initialize BERT model successfully', async () => {
      const mockPipeline = jest.fn().mockResolvedValue({
        data: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]),
      });

      const { pipeline } = require('@xenova/transformers');
      pipeline.mockResolvedValue(mockPipeline);

      await ecosystemPredictor.initialize();
      
      const status = ecosystemPredictor.getModelStatus();
      expect(status.initialized).toBe(true);
      expect(status.modelName).toBe('Xenova/all-MiniLM-L6-v2');
    });

    it('should handle model initialization failure gracefully', async () => {
      const { pipeline } = require('@xenova/transformers');
      pipeline.mockRejectedValue(new Error('Model loading failed'));

      await ecosystemPredictor.initialize();
      
      const status = ecosystemPredictor.getModelStatus();
      expect(status.initialized).toBe(false);
      expect(status.modelName).toBe('none');
    });
  });

  describe('Semantic Similarity Calculation', () => {
    beforeEach(async () => {
      // Mock successful model initialization
      const mockPipeline = jest.fn().mockImplementation((text) => {
        // Return different embeddings based on text content
        // Order: desert(0), ocean(1), rainforest(2), grassland(3), tundra(4)
        if (text.includes('trees') || text.includes('forest') || text.includes('jungle') || text.includes('tropical')) {
          return Promise.resolve({
            data: new Float32Array([0.1, 0.1, 0.6, 0.1, 0.1]), // High similarity to rainforest (index 2)
          });
        }
        if (text.includes('water') || text.includes('ocean') || text.includes('sea') || text.includes('marine')) {
          return Promise.resolve({
            data: new Float32Array([0.1, 0.6, 0.1, 0.1, 0.1]), // High similarity to ocean (index 1)
          });
        }
        if (text.includes('hot') || text.includes('desert') || text.includes('dry') || text.includes('arid')) {
          return Promise.resolve({
            data: new Float32Array([0.6, 0.1, 0.1, 0.1, 0.1]), // High similarity to desert (index 0)
          });
        }
        if (text.includes('grass') || text.includes('field') || text.includes('plains') || text.includes('prairie')) {
          return Promise.resolve({
            data: new Float32Array([0.1, 0.1, 0.1, 0.6, 0.1]), // High similarity to grassland (index 3)
          });
        }
        if (text.includes('cold') || text.includes('snow') || text.includes('ice') || text.includes('arctic')) {
          return Promise.resolve({
            data: new Float32Array([0.1, 0.1, 0.1, 0.1, 0.6]), // High similarity to tundra (index 4)
          });
        }
        // Default embedding
        return Promise.resolve({
          data: new Float32Array([0.2, 0.2, 0.2, 0.2, 0.2]),
        });
      });

      const { pipeline } = require('@xenova/transformers');
      pipeline.mockResolvedValue(mockPipeline);

      await ecosystemPredictor.initialize();
    });

    it('should predict rainforest for tree-related sentences using BERT', async () => {
      const sentences = [
        'Bees live in tall trees',
        'Bees collect nectar from flowers in the forest',
        'Bees build hives in dense vegetation'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBe('rainforest');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.embeddingSimilarities.rainforest).toBeGreaterThan(0.5);
    });

    it('should predict ocean for water-related sentences using BERT', async () => {
      const sentences = [
        'Dolphins swim in the deep ocean',
        'Dolphins eat fish from the water',
        'Dolphins live in the marine environment'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'dolphins');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBe('ocean');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.embeddingSimilarities.ocean).toBeGreaterThan(0.5);
    });

    it('should predict desert for hot/dry-related sentences using BERT', async () => {
      const sentences = [
        'Camels live in hot deserts',
        'Deserts have very little moisture',
        'It is extremely dry and arid'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'camels');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBe('desert');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.embeddingSimilarities.desert).toBeGreaterThan(0.5);
    });

    it('should predict grassland for grass/field-related sentences using BERT', async () => {
      const sentences = [
        'Zebras graze on grass',
        'Grasslands have open fields',
        'Animals eat grass in the prairie'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'zebras');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBe('grassland');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.embeddingSimilarities.grassland).toBeGreaterThan(0.5);
    });

    it('should predict tundra for cold/snow-related sentences using BERT', async () => {
      const sentences = [
        'Polar bears live in cold places',
        'The tundra is covered in snow',
        'Arctic animals survive in freezing temperatures'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'polar bears');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBe('tundra');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.embeddingSimilarities.tundra).toBeGreaterThan(0.5);
    });
  });

  describe('Fallback to Keyword Matching', () => {
    beforeEach(async () => {
      // Mock failed model initialization
      const { pipeline } = require('@xenova/transformers');
      pipeline.mockRejectedValue(new Error('Model loading failed'));

      await ecosystemPredictor.initialize();
    });

    it('should fallback to keyword matching when BERT fails', async () => {
      const sentences = [
        'Bees live in trees',
        'Bees collect nectar from flowers'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('fallback');
      expect(result.topPrediction).toBe('rainforest');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.keywordMatches.rainforest).toBeGreaterThan(0);
    });

    it('should handle empty sentences gracefully', async () => {
      const result = await ecosystemPredictor.predictEcosystem([], 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('fallback');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Hybrid Approach', () => {
    beforeEach(async () => {
      // Mock model that sometimes works, sometimes fails
      const mockPipeline = jest.fn().mockImplementation((text) => {
        if (Math.random() > 0.5) {
          throw new Error('Random BERT failure');
        }
        
        if (text.includes('trees')) {
          return Promise.resolve({
            data: new Float32Array([0.8, 0.1, 0.1, 0.0, 0.0]),
          });
        }
        return Promise.resolve({
          data: new Float32Array([0.2, 0.2, 0.2, 0.2, 0.2]),
        });
      });

      const { pipeline } = require('@xenova/transformers');
      pipeline.mockResolvedValue(mockPipeline);

      await ecosystemPredictor.initialize();
    });

    it('should combine BERT and keyword matching when both are available', async () => {
      const sentences = [
        'Bees live in trees and collect nectar',
        'Bees make honey in their hives'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(['bert', 'fallback']).toContain(result.method);
      expect(result.topPrediction).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      // Mock successful model initialization
      const mockPipeline = jest.fn().mockResolvedValue({
        data: new Float32Array([0.2, 0.2, 0.2, 0.2, 0.2]),
      });

      const { pipeline } = require('@xenova/transformers');
      pipeline.mockResolvedValue(mockPipeline);

      await ecosystemPredictor.initialize();
    });

    it('should handle sentences with special characters', async () => {
      const sentences = [
        'Bees don\'t like water!',
        'Bees love flowers & trees.',
        'Bees are amazing insects!'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.ecosystems).toHaveLength(5);
    });

    it('should handle very long sentences', async () => {
      const longSentence = 'Bees are amazing insects that live in trees and collect nectar from flowers and make honey and dance to communicate with each other and work together as a colony in the forest';
      const result = await ecosystemPredictor.predictEcosystem([longSentence], 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.topPrediction).toBeDefined();
    });

    it('should handle mixed case sentences', async () => {
      const sentences = [
        'BEES Live In TREES',
        'Bees COLLECT nectar from FLOWERS',
        'Bees DON\'T like WATER'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.ecosystems).toHaveLength(5);
    });

    it('should handle sentences with numbers', async () => {
      const sentences = [
        'Bees have 6 legs and 2 wings',
        'Bees can fly at 15 miles per hour',
        'A bee colony has 50,000 bees'
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.method).toBe('bert');
      expect(result.ecosystems).toHaveLength(5);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(async () => {
      // Mock successful model initialization
      const mockPipeline = jest.fn().mockImplementation((text) => {
        if (text.includes('trees')) {
          return Promise.resolve({
            data: new Float32Array([0.8, 0.1, 0.1, 0.0, 0.0]),
          });
        }
        if (text.includes('water')) {
          return Promise.resolve({
            data: new Float32Array([0.1, 0.8, 0.1, 0.0, 0.0]),
          });
        }
        return Promise.resolve({
          data: new Float32Array([0.2, 0.2, 0.2, 0.2, 0.2]),
        });
      });

      const { pipeline } = require('@xenova/transformers');
      pipeline.mockResolvedValue(mockPipeline);

      await ecosystemPredictor.initialize();
    });

    it('should work with different animal types', async () => {
      const beeSentences = ['Bees live in trees', 'Bees collect nectar'];
      const dolphinSentences = ['Dolphins swim in the ocean', 'Dolphins eat fish'];
      const zebraSentences = ['Zebras graze on grass', 'Zebras live in fields'];

      const beeResult = await ecosystemPredictor.predictEcosystem(beeSentences, 'bees');
      const dolphinResult = await ecosystemPredictor.predictEcosystem(dolphinSentences, 'dolphins');
      const zebraResult = await ecosystemPredictor.predictEcosystem(zebraSentences, 'zebras');

      expect(beeResult.topPrediction).toBe('rainforest');
      expect(dolphinResult.topPrediction).toBe('ocean');
      expect(zebraResult.topPrediction).toBeDefined();
    });

    it('should handle conflicting ecosystem indicators', async () => {
      const sentences = [
        'Bees live in trees', // rainforest
        'Bees swim in water', // ocean
        'Bees graze on grass', // grassland
        'Bees live in hot deserts', // desert
        'Bees survive in cold weather' // tundra
      ];

      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toBeDefined();
      expect(result.ecosystems).toHaveLength(5);
      
      // Should have multiple ecosystems with probabilities
      const ecosystemsWithProbability = result.ecosystems.filter(e => e.probability > 0);
      expect(ecosystemsWithProbability.length).toBeGreaterThan(1);
    });

    it('should provide detailed debugging information', async () => {
      const sentences = ['Bees live in trees'];
      const result = await ecosystemPredictor.predictEcosystem(sentences, 'bees');

      expect(result).toHaveProperty('method');
      expect(result).toHaveProperty('embeddingSimilarities');
      expect(result).toHaveProperty('keywordMatches');
      expect(result).toHaveProperty('reasoning');
      
      expect(typeof result.embeddingSimilarities).toBe('object');
      expect(typeof result.keywordMatches).toBe('object');
      expect(Array.isArray(result.reasoning)).toBe(true);
    });
  });
});
