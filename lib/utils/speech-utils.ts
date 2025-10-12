/**
 * Speech Utilities
 * Helper functions for audio processing, transcript cleaning, and speech-to-text operations
 */

/**
 * Clean and normalize transcript text
 * Removes extra whitespace, fixes punctuation, and normalizes capitalization
 * 
 * @param transcript - Raw transcript text
 * @returns Cleaned transcript
 */
export function cleanTranscript(transcript: string): string {
  if (!transcript) return '';

  let cleaned = transcript;

  // Trim whitespace
  cleaned = cleaned.trim();

  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove leading/trailing punctuation spaces
  cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1');

  // Ensure proper spacing after punctuation
  cleaned = cleaned.replace(/([.,!?;:])([a-zA-Z])/g, '$1 $2');

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Capitalize after sentence-ending punctuation
  cleaned = cleaned.replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => {
    return p1 + p2.toUpperCase();
  });

  return cleaned;
}

/**
 * Remove filler words and hesitations from transcript
 * 
 * @param transcript - Transcript text
 * @returns Transcript with filler words removed
 */
export function removeFillerWords(transcript: string): string {
  if (!transcript) return '';

  const fillerWords = [
    'um', 'uh', 'umm', 'uhh', 'hmm', 'hm',
    'like', 'you know', 'sort of', 'kind of',
    'basically', 'actually', 'literally',
    'er', 'ah', 'oh'
  ];

  let cleaned = transcript;

  // Create regex pattern for filler words (case insensitive, word boundaries)
  fillerWords.forEach(filler => {
    const pattern = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(pattern, '');
  });

  // Clean up extra spaces created by removal
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Calculate confidence score for a transcript
 * Based on length, completeness, and clarity indicators
 * 
 * @param transcript - Transcript text
 * @param recognitionConfidence - Confidence from speech recognition API (0-1)
 * @returns Confidence score (0-1)
 */
export function calculateConfidenceScore(
  transcript: string,
  recognitionConfidence: number = 1.0
): number {
  if (!transcript || transcript.trim().length === 0) {
    return 0;
  }

  let score = recognitionConfidence;

  // Penalize very short transcripts
  const wordCount = transcript.split(/\s+/).length;
  if (wordCount < 3) {
    score *= 0.7;
  } else if (wordCount < 5) {
    score *= 0.85;
  }

  // Penalize incomplete sentences (no ending punctuation)
  if (!/[.!?]$/.test(transcript.trim())) {
    score *= 0.9;
  }

  // Penalize excessive filler words
  const fillerCount = countFillerWords(transcript);
  if (fillerCount > 2) {
    score *= Math.max(0.5, 1 - (fillerCount * 0.1));
  }

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Count filler words in transcript
 * 
 * @param transcript - Transcript text
 * @returns Number of filler words found
 */
function countFillerWords(transcript: string): number {
  const fillerWords = ['um', 'uh', 'umm', 'uhh', 'hmm', 'like', 'you know'];
  let count = 0;

  fillerWords.forEach(filler => {
    const pattern = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = transcript.match(pattern);
    if (matches) {
      count += matches.length;
    }
  });

  return count;
}

/**
 * Normalize text for comparison (remove case, punctuation, extra spaces)
 * Useful for matching spoken input to expected answers
 * 
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeTextForComparison(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Check if transcript contains specific keywords
 * Case-insensitive, accounts for variations
 * 
 * @param transcript - Transcript to search
 * @param keywords - Keywords to find
 * @returns True if any keyword is found
 */
export function containsKeywords(
  transcript: string,
  keywords: string[]
): boolean {
  const normalized = normalizeTextForComparison(transcript);
  
  return keywords.some(keyword => {
    const normalizedKeyword = normalizeTextForComparison(keyword);
    return normalized.includes(normalizedKeyword);
  });
}

/**
 * Extract mentioned ecosystem from transcript
 * Looks for ecosystem names in the text
 * 
 * @param transcript - Transcript to analyze
 * @returns Detected ecosystem type or null
 */
export function extractEcosystemFromTranscript(
  transcript: string
): 'desert' | 'ocean' | 'rainforest' | 'grassland' | 'tundra' | null {
  const normalized = normalizeTextForComparison(transcript);

  const ecosystemKeywords = {
    desert: ['desert', 'deserts', 'sandy', 'sahara', 'arid', 'dry', 'cactus', 'cacti'],
    ocean: ['ocean', 'oceans', 'sea', 'seas', 'marine', 'underwater', 'water', 'aquatic'],
    rainforest: ['rainforest', 'rain forest', 'jungle', 'tropical', 'amazon', 'forest'],
    grassland: ['grassland', 'grasslands', 'savanna', 'savannah', 'prairie', 'plains', 'grass'],
    tundra: ['tundra', 'arctic', 'polar', 'frozen', 'ice', 'cold', 'snow'],
  };

  // Count matches for each ecosystem
  const scores: Record<string, number> = {};
  
  for (const [ecosystem, keywords] of Object.entries(ecosystemKeywords)) {
    scores[ecosystem] = keywords.filter(keyword => 
      normalized.includes(keyword)
    ).length;
  }

  // Find ecosystem with highest score
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return null;
  }

  const detectedEcosystem = Object.entries(scores).find(
    ([_, score]) => score === maxScore
  )?.[0];

  return detectedEcosystem as 'desert' | 'ocean' | 'rainforest' | 'grassland' | 'tundra' | null;
}

/**
 * Format time duration for display
 * 
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted time string (e.g., "1:23")
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Check if browser supports speech recognition
 * 
 * @returns True if supported
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Check if browser supports speech synthesis
 * 
 * @returns True if supported
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

/**
 * Get browser information for debugging
 * 
 * @returns Browser name and version
 */
export function getBrowserInfo(): { name: string; version: string } {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: 'unknown' };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  let name = 'unknown';
  let version = 'unknown';

  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    name = 'Chrome';
    const match = userAgent.match(/chrome\/([\d.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    name = 'Safari';
    const match = userAgent.match(/version\/([\d.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (userAgent.includes('firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/firefox\/([\d.]+)/);
    version = match ? match[1] : 'unknown';
  } else if (userAgent.includes('edg')) {
    name = 'Edge';
    const match = userAgent.match(/edg\/([\d.]+)/);
    version = match ? match[1] : 'unknown';
  }

  return { name, version };
}

/**
 * Split long transcript into sentences
 * 
 * @param transcript - Full transcript
 * @returns Array of sentences
 */
export function splitIntoSentences(transcript: string): string[] {
  if (!transcript) return [];

  // Split on sentence-ending punctuation followed by space and capital letter
  const sentences = transcript
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences;
}

/**
 * Truncate transcript to a maximum length
 * 
 * @param transcript - Transcript to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated
 * @returns Truncated transcript
 */
export function truncateTranscript(
  transcript: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!transcript || transcript.length <= maxLength) {
    return transcript;
  }

  return transcript.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Calculate speech rate (words per minute)
 * 
 * @param transcript - Transcript text
 * @param durationMs - Duration in milliseconds
 * @returns Words per minute
 */
export function calculateSpeechRate(
  transcript: string,
  durationMs: number
): number {
  if (!transcript || durationMs <= 0) return 0;

  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = durationMs / 60000;

  return Math.round(wordCount / minutes);
}

/**
 * Detect if transcript is a question
 * 
 * @param transcript - Transcript to check
 * @returns True if it appears to be a question
 */
export function isQuestion(transcript: string): boolean {
  if (!transcript) return false;

  const normalized = transcript.trim().toLowerCase();

  // Check for question mark
  if (normalized.endsWith('?')) return true;

  // Check for question words at the start
  const questionWords = ['what', 'where', 'when', 'why', 'how', 'who', 'which', 'whose', 'whom'];
  const firstWord = normalized.split(/\s+/)[0];

  return questionWords.includes(firstWord);
}

/**
 * Generate a readable summary of speech recognition result
 * 
 * @param transcript - Transcript text
 * @param confidence - Confidence score
 * @param durationMs - Duration in milliseconds
 * @returns Summary object
 */
export function getSpeechSummary(
  transcript: string,
  confidence: number,
  durationMs: number
) {
  return {
    transcript: cleanTranscript(transcript),
    wordCount: transcript.split(/\s+/).filter(w => w.length > 0).length,
    confidence: confidence,
    confidenceLevel: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
    duration: formatDuration(durationMs),
    durationMs: durationMs,
    speechRate: calculateSpeechRate(transcript, durationMs),
    isQuestion: isQuestion(transcript),
    hasFillerWords: countFillerWords(transcript) > 0,
  };
}

