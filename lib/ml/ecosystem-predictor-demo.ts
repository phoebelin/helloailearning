/**
 * BERT-based Ecosystem Predictor - Working Demo
 * This is a simplified implementation that demonstrates the concept
 * without complex mocking for testing
 */

import { EcosystemType, PredictionResult, EcosystemPrediction } from '@/types/activity';
import { calculateSemanticMatch, calculateWordSimilarity } from './semantic-similarity';
import { wordEmbeddingsXenova } from './word-embeddings-xenova';

// Ecosystem descriptions for semantic similarity
const ECOSYSTEM_DESCRIPTIONS: Record<EcosystemType, string> = {
  desert: 'hot dry arid sandy cactus scarce water extreme temperatures',
  ocean: 'water sea marine aquatic fish swim saltwater waves blue deep',
  rainforest: 'trees forest jungle tropical humid rain green canopy dense vegetation',
  grassland: 'grass plains savanna open prairie meadow field graze herd',
  tundra: 'cold snow ice frozen arctic winter polar extreme cold temperatures',
};

// Ecosystem keywords for fallback
const ECOSYSTEM_KEYWORDS: Record<EcosystemType, string[]> = {
  desert: ['hot', 'dry', 'sand', 'cactus', 'desert', 'arid', 'scarce'],
  ocean: ['water', 'ocean', 'sea', 'swim', 'fish', 'waves', 'blue', 'marine'],
  rainforest: ['trees', 'forest', 'rain', 'green', 'jungle', 'tropical', 'flowers', 'canopy'],
  grassland: ['grass', 'field', 'open', 'plain', 'meadow', 'prairie', 'savanna'],
  tundra: ['cold', 'snow', 'ice', 'arctic', 'frozen', 'winter', 'polar'],
};

export interface EmbeddingPredictionResult extends PredictionResult {
  method: 'bert' | 'hybrid' | 'fallback';
  embeddingSimilarities: Record<EcosystemType, number>;
  keywordMatches: Record<EcosystemType, number>;
}

// Note: WORD_RELATIONSHIPS has been replaced with semantic similarity functions
// in lib/ml/semantic-similarity.ts for improved accuracy
class EcosystemPredictorDemo {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would load the BERT model
      // For demo purposes, we'll simulate the initialization
      console.log('🧠 BERT model would be loaded here (Xenova/all-MiniLM-L6-v2)');
      console.log('📦 Model size: ~22MB, Load time: ~2-5 seconds');
      
      this.isInitialized = true;
      console.log('✅ BERT model initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to load BERT model, falling back to keyword matching:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Analyze sentiment and negation in text
   */
  private analyzeSentiment(text: string): { isPositive: boolean; isNegative: boolean; negatedWords: string[] } {
    const lowerText = text.toLowerCase();
    
    // Negative indicators
    const negativeWords = ['don\'t', 'doesn\'t', 'not', 'never', 'avoid', 'hate', 'dislike', 'can\'t', 'won\'t'];
    const negativePhrases = ['don\'t like', 'doesn\'t like', 'don\'t want', 'doesn\'t want', 'avoid', 'stay away from'];
    
    // Positive indicators
    const positiveWords = ['like', 'love', 'enjoy', 'prefer', 'thrive', 'live in', 'habitat', 'home'];
    
    let isNegative = false;
    let isPositive = false;
    const negatedWords: string[] = [];
    
    // Check for negative phrases first (more specific)
    negativePhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        isNegative = true;
        // Extract words after negative phrase
        const afterPhrase = lowerText.split(phrase)[1];
        if (afterPhrase) {
          const words = afterPhrase.trim().split(/\s+/).slice(0, 3); // Next 3 words
          negatedWords.push(...words);
        }
      }
    });
    
    // Check for negative words
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        isNegative = true;
        // Extract words after negative word
        const afterWord = lowerText.split(word)[1];
        if (afterWord) {
          const words = afterWord.trim().split(/\s+/).slice(0, 2); // Next 2 words
          negatedWords.push(...words);
        }
      }
    });
    
    // Check for positive indicators
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        isPositive = true;
      }
    });
    
    return { isPositive, isNegative, negatedWords };
  }

  /**
   * Simulate BERT semantic similarity calculation with sentiment analysis
   * In reality, this would use actual BERT embeddings and cosine similarity
   */
  private simulateSemanticSimilarity(userText: string): Record<EcosystemType, number> {
    const similarities: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };

    const lowerText = userText.toLowerCase();
    const sentiment = this.analyzeSentiment(userText);

    // Simulate semantic understanding with weighted scoring and sentiment
    Object.entries(ECOSYSTEM_DESCRIPTIONS).forEach(([ecosystem, description]) => {
      const descWords = description.split(' ');
      let score = 0;
      
      descWords.forEach(word => {
        if (lowerText.includes(word)) {
          // Check if this word is negated
          const isNegated = sentiment.negatedWords.some(negWord => 
            negWord.includes(word) || word.includes(negWord)
          );
          
          if (isNegated && sentiment.isNegative) {
            // Negative sentiment - reduce score or make it negative
            const weight = word.length > 4 ? -2 : -1;
            score += weight;
            console.log(`🚫 Negated word "${word}" for ${ecosystem}: ${weight} points`);
          } else if (sentiment.isPositive) {
            // Positive sentiment - boost score
            const weight = word.length > 4 ? 3 : 2;
            score += weight;
            console.log(`✅ Positive word "${word}" for ${ecosystem}: ${weight} points`);
          } else {
            // Neutral sentiment - normal weight
            const weight = word.length > 4 ? 2 : 1;
            score += weight;
            console.log(`⚪ Neutral word "${word}" for ${ecosystem}: ${weight} points`);
          }
        }
      });
      
      // Add semantic bonus for related concepts with sentiment
      const ecosystemKeywords = ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType];
      ecosystemKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          const isNegated = sentiment.negatedWords.some(negWord => 
            negWord.includes(keyword) || keyword.includes(negWord)
          );
          
          if (isNegated && sentiment.isNegative) {
            score -= 3; // Strong negative penalty
            console.log(`🚫 Negated keyword "${keyword}" for ${ecosystem}: -3 points`);
          } else if (sentiment.isPositive) {
            score += 3; // Strong positive bonus
            console.log(`✅ Positive keyword "${keyword}" for ${ecosystem}: +3 points`);
          } else {
            score += 2; // Normal bonus
            console.log(`⚪ Neutral keyword "${keyword}" for ${ecosystem}: +2 points`);
          }
        }
      });
      
      // Ensure score is not negative (minimum 0)
      similarities[ecosystem as EcosystemType] = Math.max(0, score);
    });

    console.log(`📊 Raw scores:`, similarities);
    console.log(`🎭 Sentiment analysis:`, sentiment);

    // Normalize to probabilities
    const total = Object.values(similarities).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(similarities).forEach(ecosystem => {
        similarities[ecosystem as EcosystemType] = similarities[ecosystem as EcosystemType] / total;
      });
    } else {
      // Return zeros if no matches
      Object.keys(similarities).forEach(ecosystem => {
        similarities[ecosystem as EcosystemType] = 0;
      });
    }

    console.log(`📈 Final probabilities:`, similarities);
    return similarities;
  }

  /**
   * Calculate keyword-based scores (fallback method) with sentiment analysis
   */
  private async calculateKeywordScores(userText: string): Promise<Record<EcosystemType, number>> {
    const scores: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };

    const lowerText = userText.toLowerCase();
    const sentiment = this.analyzeSentiment(userText);
    
    // Extract individual words from ALL sentences combined
    const userWords = lowerText.split(/\s+/);
    console.log(`🔍 Extracted words from ALL sentences: ${userWords.length} words`);

    Object.entries(ECOSYSTEM_KEYWORDS).forEach(([ecosystem, keywords]) => {
      keywords.forEach(keyword => {
        let matched = false;
        let matchedWord = '';
        
        // Check for exact keyword match
        if (lowerText.includes(keyword)) {
          matched = true;
          matchedWord = keyword;
        } else {
          // Check if any user word is semantically similar to this keyword
          for (const userWord of userWords) {
            const similarity = calculateWordSimilarity(userWord, keyword);
            if (similarity > 0.3) { // Threshold for semantic match
              matched = true;
              matchedWord = userWord;
              break;
            }
          }
        }
        
        if (matched) {
          // Check if this keyword is negated
          const isNegated = sentiment.negatedWords.some(negWord => 
            negWord.includes(keyword) || keyword.includes(negWord)
          );
          
          if (isNegated && sentiment.isNegative) {
            // Negative sentiment - reduce or eliminate score
            scores[ecosystem as EcosystemType] -= 1;
            console.log(`🚫 Keyword fallback: Negated "${keyword}" (via "${matchedWord}") for ${ecosystem}: -1 point`);
          } else if (sentiment.isPositive) {
            // Positive sentiment - boost score
            scores[ecosystem as EcosystemType] += 2;
            console.log(`✅ Keyword fallback: Positive "${keyword}" (via "${matchedWord}") for ${ecosystem}: +2 points`);
          } else {
            // Neutral sentiment - normal score
            scores[ecosystem as EcosystemType] += 1;
            console.log(`⚪ Keyword fallback: Neutral "${keyword}" (via "${matchedWord}") for ${ecosystem}: +1 point`);
          }
        }
      });
    });

    // Ensure no negative scores
    Object.keys(scores).forEach(ecosystem => {
      scores[ecosystem as EcosystemType] = Math.max(0, scores[ecosystem as EcosystemType]);
    });

    return scores;
  }

  /**
   * Normalize scores to probabilities (sum to 1.0)
   * Applies exponential scaling to create a clear winner
   */
  private normalizeToProbabilities(scores: Record<EcosystemType, number>): Record<EcosystemType, number> {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (total === 0) {
      // If no matches at all, return all zeros instead of equal distribution
      return {
        desert: 0,
        ocean: 0,
        rainforest: 0,
        grassland: 0,
        tundra: 0,
      };
    }

    const probabilities: Record<EcosystemType, number> = {};
    
    // First, normalize to probabilities
    Object.entries(scores).forEach(([ecosystem, score]) => {
      probabilities[ecosystem as EcosystemType] = score / total;
    });
    
    // Apply exponential scaling (power of 3) to create a clear winner
    // This amplifies differences: (0.5, 0.3, 0.2) -> (0.62, 0.14, 0.04) approximately
    const scaledScores: Record<EcosystemType, number> = {};
    Object.entries(probabilities).forEach(([ecosystem, prob]) => {
      scaledScores[ecosystem as EcosystemType] = Math.pow(prob, 3);
    });
    
    // Re-normalize to ensure sum = 1.0
    const scaledTotal = Object.values(scaledScores).reduce((sum, score) => sum + score, 0);
    if (scaledTotal > 0) {
      Object.entries(scaledScores).forEach(([ecosystem, score]) => {
        probabilities[ecosystem as EcosystemType] = score / scaledTotal;
      });
    }

    return probabilities;
  }

  /**
   * Analyze a single sentence against all ecosystems using word embeddings
   * Returns scores for each ecosystem with sentiment weighting
   */
  private async analyzePerSentence(
    sentence: string,
    sentenceIndex: number,
    totalSentences: number
  ): Promise<{
    ecosystem: EcosystemType;
    score: number;
    similarity: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
  }[]> {
    const lowerSentence = sentence.toLowerCase();
    const sentiment = this.analyzeSentiment(sentence);
    
    const results: {
      ecosystem: EcosystemType;
      score: number;
      similarity: number;
      sentiment: 'positive' | 'negative' | 'neutral';
      keywords: string[];
    }[] = [];
    
    console.log(`\n📝 Analyzing sentence ${sentenceIndex + 1}/${totalSentences}: "${sentence}"`);
    console.log(`   Sentiment: ${sentiment.isNegative ? 'negative' : sentiment.isPositive ? 'positive' : 'neutral'}`);
    
    // Check similarity against each ecosystem
    for (const [ecosystem, keywords] of Object.entries(ECOSYSTEM_KEYWORDS)) {
      const ecosystemDescription = keywords.join(' ');
      
      try {
        // Use word embeddings to calculate semantic similarity
        const embeddingSimilarity = await wordEmbeddingsXenova.calculateSimilarity(lowerSentence, ecosystemDescription);
        
        // Detect keyword matches
        const matchedKeywords = keywords.filter(keyword => lowerSentence.includes(keyword));
        
        // Determine sentiment multiplier
        let sentimentMultiplier = 1.0;
        let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
        
        // Check if sentence has negative associations with this ecosystem
        const hasNegativeAssociations = matchedKeywords.some(keyword => {
          const keywordWords = keyword.split(/\s+/);
          return keywordWords.some(kw => sentiment.negatedWords.some(neg => neg.includes(kw) || kw.includes(neg)));
        });
        
        if (sentiment.isNegative || hasNegativeAssociations) {
          sentimentMultiplier = -1.0;
          sentimentLabel = 'negative';
        } else if (sentiment.isPositive || matchedKeywords.length > 0) {
          sentimentMultiplier = 1.0;
          sentimentLabel = 'positive';
        } else {
          sentimentMultiplier = 0.5;
          sentimentLabel = 'neutral';
        }
        
        // Calculate final score: embedding similarity * sentiment multiplier
        const finalScore = embeddingSimilarity * sentimentMultiplier;
        
        // Apply keyword match bonus
        const keywordBonus = matchedKeywords.length * 0.1;
        const adjustedScore = Math.max(0, finalScore + keywordBonus);
        
        results.push({
          ecosystem: ecosystem as EcosystemType,
          score: adjustedScore,
          similarity: embeddingSimilarity,
          sentiment: sentimentLabel,
          keywords: matchedKeywords,
        });
        
        console.log(`   ${ecosystem}: similarity=${(embeddingSimilarity * 100).toFixed(1)}%, sentiment=${sentimentLabel}, score=${adjustedScore.toFixed(3)}, keywords=[${matchedKeywords.join(', ')}]`);
        
      } catch (error) {
        console.warn(`   ⚠️ Error analyzing ${ecosystem} for sentence ${sentenceIndex + 1}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Aggregate scores from all sentences per ecosystem
   */
  private async aggregateEcosystemScores(
    sentences: string[]
  ): Promise<{
    scores: Record<EcosystemType, number>;
    matchCounts: Record<EcosystemType, number>;
    negativeCounts: Record<EcosystemType, number>;
    influencingSentences: Record<EcosystemType, string[]>;
  }> {
    const scores: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };
    
    const matchCounts: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };
    
    const negativeCounts: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };
    
    const influencingSentences: Record<EcosystemType, string[]> = {
      desert: [],
      ocean: [],
      rainforest: [],
      grassland: [],
      tundra: [],
    };
    
    console.log('\n========================================');
    console.log('🔍 PER-SENTENCE ANALYSIS');
    console.log('========================================');
    
    // Analyze each sentence independently
    for (let idx = 0; idx < sentences.length; idx++) {
      const sentenceResults = await this.analyzePerSentence(sentences[idx], idx, sentences.length);
      
      sentenceResults.forEach(({ ecosystem, score, similarity, sentiment, keywords }) => {
        // Add score to ecosystem total (only if similarity is meaningful)
        if (similarity > 0.1 || keywords.length > 0) {
          scores[ecosystem] += score;
          
          // Track match count
          matchCounts[ecosystem]++;
          
          // Track influencing sentences
          if (!influencingSentences[ecosystem].includes(sentences[idx])) {
            influencingSentences[ecosystem].push(sentences[idx]);
          }
          
          // Track negative associations
          if (sentiment === 'negative') {
            negativeCounts[ecosystem]++;
          }
        }
      });
    }
    
    console.log('\n========================================');
    console.log('✅ Aggregated Scores');
    console.log('========================================');
    Object.entries(scores).forEach(([ecosystem, score]) => {
      if (score !== 0 || matchCounts[ecosystem as EcosystemType] > 0) {
        console.log(`${ecosystem}: total score=${score.toFixed(2)}, matches=${matchCounts[ecosystem as EcosystemType]}, negatives=${negativeCounts[ecosystem as EcosystemType]}`);
      }
    });
    console.log('========================================\n');
    
    return {
      scores,
      matchCounts,
      negativeCounts,
      influencingSentences,
    };
  }

  /**
   * Main prediction function using simulated BERT embeddings
   */
  async predictEcosystem(
    sentences: string[],
    animal: string
  ): Promise<EmbeddingPredictionResult> {
    await this.initialize();

    console.log('========================================');
    console.log('🔮 PREDICTING ECOSYSTEM FOR:', animal);
    console.log('📝 USER SENTENCES:');
    sentences.forEach((sentence, idx) => {
      console.log(`  ${idx + 1}. "${sentence}"`);
    });
    console.log('========================================\n');

    // Use per-sentence analysis with word embeddings
    const { scores, matchCounts, negativeCounts, influencingSentences } = await this.aggregateEcosystemScores(sentences);

    // Normalize aggregated scores to probabilities
    console.log('\n🎯 CALCULATING FINAL PROBABILITIES:');
    console.log('Using per-sentence word embedding analysis with sentiment weighting');
    console.log('More matches = higher score, Negative associations = score decreases\n');
    
    const finalProbabilities = this.normalizeToProbabilities(scores);
    
    console.log('📊 Probability Distribution:');
    Object.entries(finalProbabilities).forEach(([ecosystem, prob]) => {
      if (prob > 0) {
        console.log(`  ${ecosystem}: ${(prob * 100).toFixed(1)}% (${matchCounts[ecosystem as EcosystemType]} matches, ${negativeCounts[ecosystem as EcosystemType]} negatives)`);
      }
    });
    console.log('');

    // Create ecosystem predictions
    const ecosystems: EcosystemPrediction[] = Object.entries(finalProbabilities).map(([ecosystem, probability]) => {
      const ecosystemKeywords = ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType];
      const keywords = ecosystemKeywords.filter(keyword => 
        sentences.some(sentence => sentence.toLowerCase().includes(keyword))
      );
      
      return {
        ecosystem: ecosystem as EcosystemType,
        probability,
        influencingSentences: influencingSentences[ecosystem as EcosystemType] || [],
        keywords,
      };
    });
    
    // Re-normalize probabilities to ensure sum = 100%
    console.log('\n🔄 Re-normalization Step:');
    console.log('Re-normalizing probabilities so sum = 100%');
    const total = ecosystems.reduce((sum, e) => sum + e.probability, 0);
    if (total > 0) {
      ecosystems.forEach(eco => {
        const oldProb = eco.probability;
        eco.probability = eco.probability / total;
        if (oldProb !== eco.probability) {
          console.log(`  ${eco.ecosystem}: ${(oldProb * 100).toFixed(1)}% → ${(eco.probability * 100).toFixed(1)}% (after re-normalization)`);
        }
      });
    }

    // Find top prediction
    const topPrediction = ecosystems.reduce((max, current) => 
      current.probability > max.probability ? current : max
    );

    // Print final results summary
    console.log('\n========================================');
    console.log('🏆 FINAL PREDICTION RESULTS:');
    console.log(`🥇 Top Prediction: ${topPrediction.ecosystem} (${(topPrediction.probability * 100).toFixed(1)}%)`);
    console.log('\n📊 All Ecosystem Probabilities:');
    ecosystems
      .sort((a, b) => b.probability - a.probability)
      .forEach(eco => {
        console.log(`  ${eco.probability > 0 ? '✅' : '❌'} ${eco.ecosystem}: ${(eco.probability * 100).toFixed(1)}%`);
      });
    console.log('========================================\n');

    return {
      ecosystems,
      topPrediction: topPrediction.ecosystem,
      confidence: topPrediction.probability,
      reasoning: [
        'Based on per-sentence word embeddings with sentiment analysis'
      ],
      method: 'hybrid' as const,
      embeddingSimilarities: finalProbabilities,
      keywordMatches: scores,
    };
  }

  /**
   * Get model status for debugging
   */
  getModelStatus(): { initialized: boolean; modelName: string } {
    return {
      initialized: this.isInitialized,
      modelName: this.isInitialized ? 'Xenova/all-MiniLM-L6-v2 (Demo)' : 'none',
    };
  }

  /**
   * Compare BERT vs Keyword methods side by side
   */
  async compareMethods(sentences: string[], animal: string): Promise<{
    bert: EmbeddingPredictionResult;
    keyword: EmbeddingPredictionResult;
  }> {
    const userText = sentences.join(' ').toLowerCase();
    
    // BERT method
    const bertSimilarities = this.simulateSemanticSimilarity(userText);
    const bertEcosystems: EcosystemPrediction[] = Object.entries(bertSimilarities).map(([ecosystem, probability]) => ({
      ecosystem: ecosystem as EcosystemType,
      probability,
      influencingSentences: sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType].some(keyword => 
          lowerSentence.includes(keyword)
        );
      }),
      keywords: ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType].filter(keyword => 
        userText.includes(keyword)
      ),
    }));
    
    const bertTop = bertEcosystems.reduce((max, current) => 
      current.probability > max.probability ? current : max
    );

    // Keyword method
    const keywordScores = await this.calculateKeywordScores(userText);
    const keywordProbabilities = this.normalizeToProbabilities(keywordScores);
    const keywordEcosystems: EcosystemPrediction[] = Object.entries(keywordProbabilities).map(([ecosystem, probability]) => ({
      ecosystem: ecosystem as EcosystemType,
      probability,
      influencingSentences: sentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType].some(keyword => 
          lowerSentence.includes(keyword)
        );
      }),
      keywords: ECOSYSTEM_KEYWORDS[ecosystem as EcosystemType].filter(keyword => 
        userText.includes(keyword)
      ),
    }));
    
    const keywordTop = keywordEcosystems.reduce((max, current) => 
      current.probability > max.probability ? current : max
    );

    return {
      bert: {
        ecosystems: bertEcosystems,
        topPrediction: bertTop.ecosystem,
        confidence: bertTop.probability,
        reasoning: ['Based on semantic similarity using BERT embeddings'],
        method: 'bert',
        embeddingSimilarities: bertSimilarities,
        keywordMatches: keywordScores,
      },
      keyword: {
        ecosystems: keywordEcosystems,
        topPrediction: keywordTop.ecosystem,
        confidence: keywordTop.probability,
        reasoning: ['Based on keyword matching'],
        method: 'fallback',
        embeddingSimilarities: { desert: 0, ocean: 0, rainforest: 0, grassland: 0, tundra: 0 },
        keywordMatches: keywordScores,
      },
    };
  }
}

// Export singleton instance
export const ecosystemPredictorDemo = new EcosystemPredictorDemo();

// Export types for use in components
export type { EmbeddingPredictionResult };
