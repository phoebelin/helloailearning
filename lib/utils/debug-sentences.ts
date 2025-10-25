/**
 * Debug utility to inspect current stored sentences and concepts
 * This can be used in the browser console or in components
 */

import { Sentence, ConceptData } from '@/types/activity';
import { extractConceptsFromSentenceEcosystemFormat } from '@/lib/ml/concept-extractor';

/**
 * Log all sentences and their concepts to console
 */
export function logStoredSentences(sentences: Sentence[]): void {
  console.log('=== CURRENT STORED SENTENCES AND CONCEPTS ===');
  console.log('Total sentences:', sentences.length);
  
  if (sentences.length === 0) {
    console.log('No sentences stored yet.');
    return;
  }
  
  sentences.forEach((sentence, index) => {
    console.log(`\nSentence ${index + 1}:`, {
      id: sentence.id,
      sentence: sentence.sentence,
      animalId: sentence.animalId,
      timestamp: new Date(sentence.timestamp).toLocaleString(),
      concepts: sentence.concepts,
      conceptCount: sentence.concepts.length
    });
    
    if (sentence.concepts.length > 0) {
      console.log(`  Concepts for "${sentence.sentence}":`);
      sentence.concepts.forEach((concept, conceptIndex) => {
        console.log(`    ${conceptIndex + 1}. ${concept.word} (${concept.type}, ${concept.abundance}, ${concept.color})`);
      });
    } else {
      console.log(`  No concepts extracted for this sentence.`);
    }
  });
  
  console.log('=== END SENTENCES DATA ===');
}

/**
 * Get a summary of stored sentences
 */
export function getSentencesSummary(sentences: Sentence[]): {
  totalSentences: number;
  totalConcepts: number;
  animals: string[];
  conceptTypes: Record<string, number>;
  conceptWords: string[];
} {
  const animals = [...new Set(sentences.map(s => s.animalId))];
  const totalConcepts = sentences.reduce((sum, s) => sum + s.concepts.length, 0);
  const conceptWords = sentences.flatMap(s => s.concepts.map(c => c.word));
  const conceptTypes = sentences.flatMap(s => s.concepts).reduce((acc, concept) => {
    acc[concept.type] = (acc[concept.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalSentences: sentences.length,
    totalConcepts,
    animals,
    conceptTypes,
    conceptWords: [...new Set(conceptWords)]
  };
}

/**
 * Find sentences containing a specific word
 */
export function findSentencesWithWord(sentences: Sentence[], word: string): Sentence[] {
  const lowerWord = word.toLowerCase();
  return sentences.filter(sentence => 
    sentence.sentence.toLowerCase().includes(lowerWord) ||
    sentence.concepts.some(concept => concept.word.toLowerCase() === lowerWord)
  );
}

/**
 * Get all unique concepts across all sentences
 */
export function getAllConcepts(sentences: Sentence[]): ConceptData[] {
  const conceptMap = new Map<string, ConceptData>();
  
  sentences.forEach(sentence => {
    sentence.concepts.forEach(concept => {
      const key = concept.word.toLowerCase();
      if (!conceptMap.has(key)) {
        conceptMap.set(key, concept);
      }
    });
  });
  
  return Array.from(conceptMap.values());
}

/**
 * Test concept extraction on a sample sentence
 */
export function testConceptExtraction(sentence: string, animalType: string = 'bees'): void {
  console.log(`=== TESTING SENTIMENT-BASED CONCEPT EXTRACTION ===`);
  console.log(`Sentence: "${sentence}"`);
  console.log(`Animal: ${animalType}`);
  
  // Clear previous debug logs
  console.clear();
  
  const concepts = extractConceptsFromSentenceEcosystemFormat(sentence, animalType);
  
  console.log(`\nExtracted concepts (${concepts.length}):`);
  if (concepts.length === 0) {
    console.log('No concepts extracted');
  } else {
    concepts.forEach((concept, index) => {
      const abundanceEmoji = concept.abundance === 'high' ? '🟦' : '🟧';
      const typeEmoji = concept.type === 'habitat' ? '🏠' : 
                       concept.type === 'concept' ? '💡' : '❓';
      console.log(`${index + 1}. ${abundanceEmoji}${typeEmoji} "${concept.word}" (${concept.type}, ${concept.abundance}, ${concept.color})`);
    });
  }
  
         console.log(`\nLegend:`);
         console.log(`🟦 High abundance = Positive relationship (blue)`);
         console.log(`🟧 Low abundance = Negative/neutral relationship (orange)`);
         console.log(`🏠 Habitat type`);
         console.log(`💡 Concept type`);
  console.log(`=== END TEST ===`);
}

/**
 * Test multiple sentences to demonstrate sentiment-based abundance
 */
export function testSentimentExamples(): void {
  console.log(`=== TESTING SENTIMENT EXAMPLES ===`);
  
  const examples = [
    { sentence: "Bees live in trees and make honey", animal: "bees", expected: "Positive relationships" },
    { sentence: "Bees don't like water and avoid rain", animal: "bees", expected: "Negative relationships" },
    { sentence: "Ocean has lots of water and fish", animal: "dolphins", expected: "Positive relationships" },
    { sentence: "Deserts have little water and are dry", animal: "zebras", expected: "Negative relationships" },
    { sentence: "Monkeys eat bananas and climb trees", animal: "monkeys", expected: "Positive relationships" }
  ];
  
  examples.forEach((example, index) => {
    console.log(`\n--- Example ${index + 1}: ${example.expected} ---`);
    testConceptExtraction(example.sentence, example.animal);
  });
  
  console.log(`\n🎯 MINDMAP STRUCTURE:`);
  console.log(`- Center node: Animal name (purple, large)`);
  console.log(`- Connected nodes: Concepts with sentiment-based colors`);
  console.log(`  🟦 Blue = Positive relationships (high abundance)`);
  console.log(`  🟪 Purple = Neutral relationships (medium abundance)`);
  console.log(`  🟧 Orange = Negative relationships (low abundance)`);
  console.log(`=== END SENTIMENT EXAMPLES ===`);
}

/**
 * Test mindmap generation with multiple sentences about an animal
 */
export function testMindmapGeneration(): void {
  console.log(`=== TESTING MINDMAP GENERATION ===`);
  
  const testSentences = [
    "Bees live in trees and make honey",
    "Bees don't like water and avoid rain", 
    "Bees eat nectar from flowers",
    "Bees build hives in gardens"
  ];
  
  console.log(`Testing with ${testSentences.length} sentences about bees:`);
  testSentences.forEach((sentence, index) => {
    console.log(`${index + 1}. "${sentence}"`);
  });
  
  console.log(`\nExtracted concepts for mindmap:`);
  testSentences.forEach((sentence, index) => {
    console.log(`\n--- Sentence ${index + 1} ---`);
    testConceptExtraction(sentence, "bees");
  });
  
  console.log(`\nExpected mindmap structure:`);
  console.log(`🐝 bees (center, purple, large)`);
  console.log(`├── trees (blue - positive: "live in")`);
  console.log(`├── honey (blue - positive: "make")`);
  console.log(`├── water (orange - negative: "don't like")`);
  console.log(`├── rain (orange - negative: "avoid")`);
  console.log(`├── nectar (blue - positive: "eat")`);
  console.log(`├── flowers (blue - positive: "from")`);
  console.log(`├── hives (blue - positive: "build")`);
  console.log(`└── gardens (blue - positive: "in")`);
  
  console.log(`=== END MINDMAP TEST ===`);
}

/**
 * Export functions to window for browser console access
 */
export function exposeDebugFunctions(): void {
  if (typeof window !== 'undefined') {
    (window as any).debugSentences = {
      logStoredSentences,
      getSentencesSummary,
      findSentencesWithWord,
      getAllConcepts,
      testConceptExtraction,
      testSentimentExamples,
      testMindmapGeneration
    };
    console.log('Debug functions exposed to window.debugSentences');
    console.log('Available functions:', Object.keys((window as any).debugSentences));
    console.log('\nTry: window.debugSentences.testMindmapGeneration()');
    console.log('Or: window.debugSentences.testSentimentExamples()');
  }
}
