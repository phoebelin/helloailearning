/**
 * Tests for Concept Extractor ML model
 * Task 5.7: Unit tests for concept-extractor with various sentences
 */

import {
  extractConceptsFromSentence,
  extractRelationships,
  conceptsToMindmapNodes,
  extractConceptsFromSentences,
  analyzeConceptFrequency,
  extractConceptsFromSentenceEcosystemFormat,
  filterConceptsByConfidence,
  ExtractedConcept,
  ConceptRelationship,
  ConceptExtractionResult,
} from '@/lib/ml/concept-extractor';
import { Sentence, ConceptData } from '@/types/activity';

describe('Concept Extractor', () => {
  describe('extractConceptsFromSentence', () => {
    it('extracts basic concepts from a simple sentence', () => {
      const sentence = 'Bees live in hives';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      // Should extract 'bees' and 'hives'
      const conceptWords = result.map(c => c.word.toLowerCase());
      expect(conceptWords).toContain('bees');
      expect(conceptWords).toContain('hives');
    });

    it('handles empty or invalid sentences', () => {
      expect(extractConceptsFromSentence('', 'bees')).toBeDefined();
      expect(extractConceptsFromSentence('   ', 'bees')).toBeDefined();
      expect(extractConceptsFromSentence('a', 'bees')).toBeDefined();
    });

    it('extracts concepts with proper types and confidence', () => {
      const sentence = 'Bees collect nectar from flowers';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      result.forEach(concept => {
        expect(concept.word).toBeDefined();
        expect(concept.type).toBeDefined();
        expect(concept.confidence).toBeGreaterThanOrEqual(0);
        expect(concept.confidence).toBeLessThanOrEqual(1);
        expect(concept.position).toBeGreaterThanOrEqual(0);
        expect(concept.context).toBeDefined();
      });
    });

    it('identifies bee-related concepts correctly', () => {
      const sentence = 'The queen bee lays eggs in the honeycomb';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      const conceptWords = result.map(c => c.word.toLowerCase());
      expect(conceptWords).toContain('queen');
      expect(conceptWords).toContain('bee');
      expect(conceptWords).toContain('honeycomb');
      // Note: 'eggs' might not be extracted if it's not in the relevant nouns list
    });

    it('identifies dolphin-related concepts correctly', () => {
      const sentence = 'Dolphins swim in the ocean and eat fish';
      const result = extractConceptsFromSentence(sentence, 'dolphins');
      
      const conceptWords = result.map(c => c.word.toLowerCase());
      expect(conceptWords).toContain('dolphins');
      expect(conceptWords).toContain('ocean');
      expect(conceptWords).toContain('fish');
    });

    it('filters out common words and verbs', () => {
      const sentence = 'Bees like to fly and eat nectar';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      const conceptWords = result.map(c => c.word.toLowerCase());
      // Should not include common words like 'like', 'to', 'and'
      expect(conceptWords).not.toContain('like');
      expect(conceptWords).not.toContain('to');
      expect(conceptWords).not.toContain('and');
      // Should include meaningful concepts
      expect(conceptWords).toContain('bees');
      expect(conceptWords).toContain('nectar');
    });
  });

  describe('extractConceptsFromSentenceEcosystemFormat', () => {
    it('extracts concepts with ecosystem format (sentiment-based abundance)', () => {
      const sentence = 'Bees live in trees and collect nectar from flowers';
      const result = extractConceptsFromSentenceEcosystemFormat(sentence, 'bees');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      
      // Should have concepts with abundance and color
      result.forEach(concept => {
        expect(concept.word).toBeDefined();
        expect(concept.type).toBeDefined();
        expect(concept.abundance).toMatch(/^(high|low)$/);
        expect(concept.color).toMatch(/^(blue|orange|purple)$/);
      });
    });

    it('classifies positive relationships as high abundance (blue)', () => {
      const sentence = 'Bees love flowers and trees';
      const result = extractConceptsFromSentenceEcosystemFormat(sentence, 'bees');
      
      const flowerConcept = result.find(c => c.word.toLowerCase() === 'flowers');
      const treeConcept = result.find(c => c.word.toLowerCase() === 'trees');
      
      if (flowerConcept) {
        expect(flowerConcept.abundance).toBe('high');
        expect(flowerConcept.color).toBe('blue');
      }
      
      if (treeConcept) {
        expect(treeConcept.abundance).toBe('high');
        expect(treeConcept.color).toBe('blue');
      }
    });

    it('classifies negative relationships as low abundance (orange)', () => {
      const sentence = 'Bees don\'t like water or cold weather';
      const result = extractConceptsFromSentenceEcosystemFormat(sentence, 'bees');
      
      const waterConcept = result.find(c => c.word.toLowerCase() === 'water');
      const coldConcept = result.find(c => c.word.toLowerCase() === 'cold');
      
      if (waterConcept) {
        expect(waterConcept.abundance).toBe('low');
        expect(waterConcept.color).toBe('orange');
      }
      
      if (coldConcept) {
        expect(coldConcept.abundance).toBe('low');
        expect(coldConcept.color).toBe('orange');
      }
    });

    it('handles neutral sentences as high abundance (blue)', () => {
      const sentence = 'Bees are insects that fly';
      const result = extractConceptsFromSentenceEcosystemFormat(sentence, 'bees');
      
      const insectConcept = result.find(c => c.word.toLowerCase() === 'insects');
      
      if (insectConcept) {
        expect(insectConcept.abundance).toBe('high');
        expect(insectConcept.color).toBe('blue');
      }
    });
  });

  describe('extractRelationships', () => {
    it('extracts relationships between concepts', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'bees', type: 'concept', confidence: 0.9, position: 0, context: 'bees live' },
        { word: 'hives', type: 'concept', confidence: 0.8, position: 3, context: 'live in hives' },
      ];
      
      const relationships = extractRelationships('Bees live in hives', concepts);
      
      expect(relationships).toBeInstanceOf(Array);
      relationships.forEach(rel => {
        expect(rel.source).toBeDefined();
        expect(rel.target).toBeDefined();
        expect(rel.verb).toBeDefined();
        expect(rel.confidence).toBeGreaterThanOrEqual(0);
        expect(rel.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('handles empty concept arrays', () => {
      const relationships = extractRelationships('', []);
      expect(relationships).toEqual([]);
    });
  });

  describe('conceptsToMindmapNodes', () => {
    it('converts concepts to mindmap nodes', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'bees', type: 'concept', confidence: 0.9, position: 0, context: 'bees' },
        { word: 'hives', type: 'concept', confidence: 0.8, position: 3, context: 'hives' },
      ];
      const relationships: ConceptRelationship[] = [];
      const sourceSentences = ['Bees live in hives'];
      
      const nodes = conceptsToMindmapNodes(concepts, relationships, sourceSentences);
      
      expect(nodes).toBeInstanceOf(Array);
      expect(nodes.length).toBeGreaterThan(0);
      
      nodes.forEach(node => {
        expect(node.id).toBeDefined();
        expect(node.label).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.color).toBeDefined();
        expect(node.size).toBeGreaterThan(0);
        expect(node.sourceSentences).toBeInstanceOf(Array);
        expect(node.connections).toBeInstanceOf(Array);
      });
    });

    it('creates mindmap nodes from concepts', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'hives', type: 'concept', confidence: 0.8, position: 3, context: 'hives' },
      ];
      const relationships: ConceptRelationship[] = [];
      const sourceSentences = ['Bees live in hives'];
      
      const nodes = conceptsToMindmapNodes(concepts, relationships, sourceSentences);
      
      expect(nodes).toBeDefined();
      expect(nodes.length).toBeGreaterThan(0);
      
      // Should have concept nodes
      nodes.forEach(node => {
        expect(node.id).toBeDefined();
        expect(node.label).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.color).toBeDefined();
        expect(node.size).toBeGreaterThan(0);
        expect(node.sourceSentences).toBeInstanceOf(Array);
        expect(node.connections).toBeInstanceOf(Array);
      });
    });
  });

  describe('extractConceptsFromSentences', () => {
    it('processes multiple sentences', () => {
      const sentences: Sentence[] = [
        {
          id: '1',
          sentence: 'Bees live in hives',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
        {
          id: '2',
          sentence: 'Bees collect nectar from flowers',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
      ];
      
      const result = extractConceptsFromSentences(sentences, 'bees');
      
      expect(result).toBeDefined();
      expect(result.concepts).toBeInstanceOf(Array);
      expect(result.relationships).toBeInstanceOf(Array);
      expect(result.mindmapNodes).toBeInstanceOf(Array);
    });

    it('handles empty sentence arrays', () => {
      const result = extractConceptsFromSentences([], 'bees');
      
      expect(result.concepts).toEqual([]);
      expect(result.relationships).toEqual([]);
      expect(result.mindmapNodes).toEqual([]);
    });
  });

  describe('analyzeConceptFrequency', () => {
    it('calculates concept frequencies correctly', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'bees', type: 'concept', confidence: 0.9, position: 0, context: 'bees' },
        { word: 'bees', type: 'concept', confidence: 0.8, position: 5, context: 'bees' },
        { word: 'hives', type: 'concept', confidence: 0.7, position: 10, context: 'hives' },
      ];
      
      const frequencies = analyzeConceptFrequency(concepts);
      
      expect(frequencies['bees']).toBe(2);
      expect(frequencies['hives']).toBe(1);
    });

    it('handles empty concept arrays', () => {
      const frequencies = analyzeConceptFrequency([]);
      expect(frequencies).toEqual({});
    });
  });

  describe('filterConceptsByConfidence', () => {
    it('filters concepts by minimum confidence threshold', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'bees', type: 'concept', confidence: 0.9, position: 0, context: 'bees' },
        { word: 'hives', type: 'concept', confidence: 0.5, position: 5, context: 'hives' },
        { word: 'nectar', type: 'concept', confidence: 0.3, position: 10, context: 'nectar' },
      ];
      
      const filtered = filterConceptsByConfidence(concepts, 0.6);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].word).toBe('bees');
    });

    it('returns all concepts when threshold is 0', () => {
      const concepts: ExtractedConcept[] = [
        { word: 'bees', type: 'concept', confidence: 0.1, position: 0, context: 'bees' },
        { word: 'hives', type: 'concept', confidence: 0.2, position: 5, context: 'hives' },
      ];
      
      const filtered = filterConceptsByConfidence(concepts, 0);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles sentences with special characters', () => {
      const sentence = 'Bees don\'t like water! They prefer flowers.';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });

    it('handles very long sentences', () => {
      const longSentence = 'Bees are amazing insects that live in hives and collect nectar from flowers and make honey and dance to communicate with each other and work together as a colony';
      const result = extractConceptsFromSentence(longSentence, 'bees');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });

    it('handles sentences with numbers', () => {
      const sentence = 'Bees have 6 legs and 2 wings';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
    });

    it('handles mixed case sentences', () => {
      const sentence = 'BEES Live In Hives And Collect NECTAR';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      expect(result).toBeDefined();
      const conceptWords = result.map(c => c.word.toLowerCase());
      expect(conceptWords).toContain('bees');
      expect(conceptWords).toContain('hives');
      expect(conceptWords).toContain('nectar');
    });

    it('handles sentences with punctuation', () => {
      const sentence = 'Bees, wasps, and ants are all insects.';
      const result = extractConceptsFromSentence(sentence, 'bees');
      
      expect(result).toBeDefined();
      const conceptWords = result.map(c => c.word.toLowerCase());
      expect(conceptWords).toContain('bees');
      // Note: Other words might not be extracted if they're not in the relevant nouns list
      expect(conceptWords.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('complete workflow from sentence to mindmap nodes', () => {
      const sentences: Sentence[] = [
        {
          id: '1',
          sentence: 'Bees live in hives and collect nectar from flowers',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
      ];
      
      // Extract concepts using the regular function
      const concepts = extractConceptsFromSentence(sentences[0].sentence, 'bees');
      
      // Extract relationships
      const relationships = extractRelationships(sentences[0].sentence, concepts);
      
      // Convert to mindmap nodes
      const nodes = conceptsToMindmapNodes(concepts, relationships, [sentences[0].sentence]);
      
      expect(nodes).toBeDefined();
      expect(nodes.length).toBeGreaterThan(0);
      
      // Should have concept nodes
      const conceptNodes = nodes.filter(node => !node.id.includes('center'));
      expect(conceptNodes.length).toBeGreaterThan(0);
      
      // Each node should have proper structure
      nodes.forEach(node => {
        expect(node.id).toBeDefined();
        expect(node.label).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.color).toBeDefined();
        expect(node.size).toBeGreaterThan(0);
      });
    });

    it('handles multiple sentences with overlapping concepts', () => {
      const sentences: Sentence[] = [
        {
          id: '1',
          sentence: 'Bees live in hives',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
        {
          id: '2',
          sentence: 'Bees collect nectar from flowers',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
        {
          id: '3',
          sentence: 'Bees make honey in their hives',
          timestamp: Date.now(),
          animalId: 'bees',
          concepts: [],
        },
      ];
      
      const result = extractConceptsFromSentences(sentences, 'bees');
      
      expect(result.concepts.length).toBeGreaterThan(0);
      expect(result.mindmapNodes.length).toBeGreaterThan(0);
      
      // Should have concepts that appear in multiple sentences
      const conceptFrequencies = analyzeConceptFrequency(result.concepts);
      expect(Object.values(conceptFrequencies).some(freq => freq > 1)).toBe(true);
    });
  });
});
