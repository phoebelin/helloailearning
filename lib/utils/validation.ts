/**
 * Validation utilities for sentence quality checking
 * Used in Steps 5-6 to ensure user sentences are informative and relevant
 */

import { SentenceValidation, AnimalType } from '@/types/activity';
import { getAnimalHabitatKeywords } from '@/lib/data/animal-data';

/**
 * Minimum word count for a valid sentence
 */
const MIN_WORD_COUNT = 3;

/**
 * Maximum word count for a sentence (to prevent overly long inputs)
 */
const MAX_WORD_COUNT = 30;

/**
 * Common words to ignore when checking for content
 */
const FILLER_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'should', 'could', 'may', 'might', 'can',
  'i', 'you', 'we', 'they', 'it', 'this', 'that', 'these', 'those',
];

/**
 * Simple subject words/pronouns
 */
const SUBJECT_INDICATORS = [
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'this', 'that', 'these', 'those',
];

/**
 * Common verbs and action words
 */
const COMMON_VERBS = [
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'live', 'lives', 'eat', 'eats', 'drink', 'drinks',
  'make', 'makes', 'build', 'builds', 'grow', 'grows',
  'fly', 'flies', 'swim', 'swims', 'run', 'runs',
  'like', 'likes', 'need', 'needs', 'want', 'wants',
  'can', 'could', 'will', 'would', 'should',
];

/**
 * Validate sentence quality
 */
export function validateSentence(
  text: string,
  animalType?: AnimalType
): SentenceValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Trim and clean the text
  const cleanText = text.trim();
  
  // Check if empty
  if (!cleanText) {
    errors.push('Sentence cannot be empty');
    return {
      isValid: false,
      errors,
      warnings,
      hasSubject: false,
      hasPredicate: false,
      isRelevant: false,
      wordCount: 0,
      minWordCount: MIN_WORD_COUNT,
    };
  }
  
  // Get word count
  const words = cleanText.split(/\s+/);
  const wordCount = words.length;
  
  // Check word count
  if (wordCount < MIN_WORD_COUNT) {
    errors.push(`Sentence must have at least ${MIN_WORD_COUNT} words`);
  }
  
  if (wordCount > MAX_WORD_COUNT) {
    warnings.push(`Sentence is quite long (${wordCount} words). Consider making it shorter.`);
  }
  
  // Check for subject
  const hasSubject = checkForSubject(cleanText, animalType);
  if (!hasSubject) {
    errors.push('Sentence should mention what or who you are talking about');
  }
  
  // Check for predicate (verb/action)
  const hasPredicate = checkForPredicate(cleanText);
  if (!hasPredicate) {
    errors.push('Sentence should describe an action or state (e.g., "lives in", "eats", "is")');
  }
  
  // Check relevance to animal
  let isRelevant = true;
  if (animalType) {
    isRelevant = checkRelevance(cleanText, animalType);
    if (!isRelevant) {
      warnings.push(`Sentence doesn't seem related to ${animalType}. Make sure you're teaching about the selected animal.`);
    }
  }
  
  // Check for gibberish or too simple
  if (isTooSimple(cleanText)) {
    errors.push('Sentence is too simple. Try to share a fact or description.');
  }
  
  // Check for inappropriate content (basic filter)
  if (containsInappropriateContent(cleanText)) {
    errors.push('Please use appropriate language');
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    warnings,
    hasSubject,
    hasPredicate,
    isRelevant,
    wordCount,
    minWordCount: MIN_WORD_COUNT,
  };
}

/**
 * Check if sentence has a subject
 */
function checkForSubject(text: string, animalType?: AnimalType): boolean {
  const lowerText = text.toLowerCase();
  
  // Check if animal type is mentioned
  if (animalType && lowerText.includes(animalType)) {
    return true;
  }
  
  // Check for subject indicators
  const hasSubjectWord = SUBJECT_INDICATORS.some(word => 
    lowerText.includes(` ${word} `) || 
    lowerText.startsWith(`${word} `)
  );
  
  if (hasSubjectWord) {
    return true;
  }
  
  // Check if sentence starts with a noun (capitalized word that's not a filler)
  const words = text.split(/\s+/);
  const firstWord = words[0]?.toLowerCase();
  
  if (firstWord && !FILLER_WORDS.includes(firstWord) && words[0][0] === words[0][0].toUpperCase()) {
    return true;
  }
  
  // Check for common animal-related nouns
  const nounPatterns = /\b(animal|creature|bird|fish|insect|mammal|species)\b/i;
  if (nounPatterns.test(text)) {
    return true;
  }
  
  return false;
}

/**
 * Check if sentence has a predicate (verb)
 */
function checkForPredicate(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for common verbs
  const hasVerb = COMMON_VERBS.some(verb => {
    const verbPattern = new RegExp(`\\b${verb}\\b`, 'i');
    return verbPattern.test(lowerText);
  });
  
  if (hasVerb) {
    return true;
  }
  
  // Check for -ing verbs
  if (/\b\w+ing\b/.test(lowerText)) {
    return true;
  }
  
  // Check for -ed verbs
  if (/\b\w+ed\b/.test(lowerText)) {
    return true;
  }
  
  // Check for -s verbs (third person singular)
  if (/\b\w+s\b/.test(lowerText)) {
    return true;
  }
  
  return false;
}

/**
 * Check if sentence is relevant to the selected animal
 */
function checkRelevance(text: string, animalType: AnimalType): boolean {
  const lowerText = text.toLowerCase();
  
  // Check if animal name is mentioned
  if (lowerText.includes(animalType)) {
    return true;
  }
  
  // Check if any habitat keywords are mentioned
  const habitatKeywords = getAnimalHabitatKeywords(animalType);
  const hasHabitatKeyword = habitatKeywords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  if (hasHabitatKeyword) {
    return true;
  }
  
  // If it has "they", "these", "it" - assume referring to the animal
  const referenceWords = ['they', 'these', 'them', 'their', 'it', 'its'];
  const hasReference = referenceWords.some(word => lowerText.includes(word));
  
  return hasReference;
}

/**
 * Check if sentence is too simple
 */
function isTooSimple(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  
  // Check for single word or very generic statements
  const tooSimplePatterns = [
    /^(yes|no|ok|okay)$/i,
    /^i (like|love|hate) (it|them|this|that)$/i,
    /^(cool|nice|good|bad|wow)$/i,
    /^they are (good|bad|nice|cool)$/i,
  ];
  
  return tooSimplePatterns.some(pattern => pattern.test(lowerText));
}

/**
 * Basic inappropriate content filter
 */
function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Very basic filter - can be expanded as needed
  const inappropriateWords = ['stupid', 'dumb', 'hate', 'kill', 'die', 'dead'];
  
  return inappropriateWords.some(word => lowerText.includes(word));
}

/**
 * Validate multiple sentences at once
 */
export function validateSentences(
  sentences: string[],
  animalType?: AnimalType
): { allValid: boolean; results: SentenceValidation[] } {
  const results = sentences.map(sentence => validateSentence(sentence, animalType));
  const allValid = results.every(result => result.isValid);
  
  return { allValid, results };
}

/**
 * Check for duplicate sentences
 */
export function isDuplicate(newSentence: string, existingSentences: string[]): boolean {
  const cleanNew = newSentence.toLowerCase().trim();
  
  return existingSentences.some(existing => {
    const cleanExisting = existing.toLowerCase().trim();
    
    // Exact match
    if (cleanNew === cleanExisting) {
      return true;
    }
    
    // Very similar (>80% match)
    const similarity = calculateSimilarity(cleanNew, cleanExisting);
    return similarity > 0.8;
  });
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Get helpful suggestions for improving a sentence
 */
export function getSentenceImprovementSuggestions(
  validation: SentenceValidation,
  animalType?: AnimalType
): string[] {
  const suggestions: string[] = [];
  
  if (!validation.hasSubject && animalType) {
    suggestions.push(`Try mentioning "${animalType}" in your sentence`);
  }
  
  if (!validation.hasPredicate) {
    suggestions.push('Add an action word like "live", "eat", "make", or "are"');
  }
  
  if (validation.wordCount < validation.minWordCount) {
    suggestions.push('Add more details to make your sentence longer');
  }
  
  if (!validation.isRelevant && animalType) {
    suggestions.push(`Make sure your sentence is about ${animalType}`);
  }
  
  return suggestions;
}

/**
 * Clean and normalize user input
 */
export function cleanSentence(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^[^\w]+/, '') // Remove leading non-word characters
    .replace(/[^\w\s.,!?'-]/g, ''); // Remove special characters except basic punctuation
}

