/**
 * Enhanced Ecosystem Predictor using BERT Word Embeddings
 * Replaces simple keyword matching with semantic similarity using BERT
 */

import { pipeline, Pipeline } from '@xenova/transformers';
import { EcosystemType, PredictionResult, EcosystemPrediction } from '@/types/activity';

// Ecosystem descriptions for semantic similarity
const ECOSYSTEM_DESCRIPTIONS: Record<EcosystemType, string> = {
  desert: 'hot dry arid sandy cactus scarce water extreme temperatures',
  ocean: 'water sea marine aquatic fish swim saltwater waves blue deep',
  rainforest: 'trees forest jungle tropical humid rain green canopy dense vegetation',
  grassland: 'grass plains savanna open prairie meadow field graze herd',
  tundra: 'cold snow ice frozen arctic winter polar extreme cold temperatures',
};

// Ecosystem keywords for fallback and hybrid approach
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

class EcosystemPredictor {
  private featureExtractor: Pipeline | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load BERT feature extractor for semantic similarity
      this.featureExtractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2', // Lightweight BERT model optimized for browser
        { quantized: true } // Use quantized model for better performance
      );
      this.isInitialized = true;
      console.log('BERT model loaded successfully');
    } catch (error) {
      console.warn('Failed to load BERT model, falling back to keyword matching:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate semantic similarity using BERT embeddings
   */
  private async calculateSemanticSimilarity(
    userText: string,
    ecosystemDescriptions: Record<EcosystemType, string>
  ): Promise<Record<EcosystemType, number>> {
    if (!this.featureExtractor) {
      throw new Error('BERT model not initialized');
    }

    try {
      // Get embeddings for user text
      const userEmbedding = await this.featureExtractor(userText, { pooling: 'mean' });
      const userVector = Array.from(userEmbedding.data);

      const similarities: Record<EcosystemType, number> = {
        desert: 0,
        ocean: 0,
        rainforest: 0,
        grassland: 0,
        tundra: 0,
      };

      // Calculate similarity with each ecosystem description
      for (const [ecosystem, description] of Object.entries(ecosystemDescriptions)) {
        const descEmbedding = await this.featureExtractor(description, { pooling: 'mean' });
        const descVector = Array.from(descEmbedding.data);
        
        similarities[ecosystem as EcosystemType] = this.cosineSimilarity(userVector, descVector);
      }

      // Normalize similarities to sum to 1.0 (probabilities)
      const totalSimilarity = Object.values(similarities).reduce((sum, sim) => sum + sim, 0);
      if (totalSimilarity > 0) {
        Object.keys(similarities).forEach(ecosystem => {
          similarities[ecosystem as EcosystemType] = similarities[ecosystem as EcosystemType] / totalSimilarity;
        });
      } else {
        // If no similarity, distribute equally
        Object.keys(similarities).forEach(ecosystem => {
          similarities[ecosystem as EcosystemType] = 0.2;
        });
      }

      return similarities;
    } catch (error) {
      console.error('Error calculating semantic similarity:', error);
      throw error;
    }
  }

  /**
   * Calculate keyword-based scores (fallback method)
   */
  private calculateKeywordScores(userText: string): Record<EcosystemType, number> {
    const scores: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };

    const lowerText = userText.toLowerCase();

    Object.entries(ECOSYSTEM_KEYWORDS).forEach(([ecosystem, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          scores[ecosystem as EcosystemType] += 1;
        }
      });
    });

    return scores;
  }

  /**
   * Normalize scores to probabilities (sum to 1.0)
   */
  private normalizeToProbabilities(scores: Record<EcosystemType, number>): Record<EcosystemType, number> {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (total === 0) {
      // Equal distribution if no matches
      return {
        desert: 0.2,
        ocean: 0.2,
        rainforest: 0.2,
        grassland: 0.2,
        tundra: 0.2,
      };
    }

    const probabilities: Record<EcosystemType, number> = {};
    Object.entries(scores).forEach(([ecosystem, score]) => {
      probabilities[ecosystem as EcosystemType] = score / total;
    });

    return probabilities;
  }

  /**
   * Main prediction function using BERT embeddings
   */
  async predictEcosystem(
    sentences: string[],
    animal: string
  ): Promise<EmbeddingPredictionResult> {
    await this.initialize();

    const userText = sentences.join(' ').toLowerCase();
    let method: 'bert' | 'hybrid' | 'fallback' = 'fallback';
    let embeddingSimilarities: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };

    // Try BERT-based prediction first
    if (this.isInitialized && this.featureExtractor) {
      try {
        embeddingSimilarities = await this.calculateSemanticSimilarity(userText, ECOSYSTEM_DESCRIPTIONS);
        method = 'bert';
      } catch (error) {
        console.warn('BERT prediction failed, falling back to keyword matching:', error);
        method = 'fallback';
        // Reset embedding similarities to zeros
        embeddingSimilarities = {
          desert: 0,
          ocean: 0,
          rainforest: 0,
          grassland: 0,
          tundra: 0,
        };
      }
    }

    // Calculate keyword scores as backup/hybrid
    const keywordMatches = this.calculateKeywordScores(userText);

    // Determine final probabilities
    let finalProbabilities: Record<EcosystemType, number>;

    if (method === 'bert') {
      // Use BERT similarities directly (they're already normalized)
      finalProbabilities = embeddingSimilarities;
    } else if (method === 'hybrid') {
      // Combine BERT and keyword scores (weighted average)
      const bertWeight = 0.7;
      const keywordWeight = 0.3;
      
      const hybridScores: Record<EcosystemType, number> = {
        desert: 0,
        ocean: 0,
        rainforest: 0,
        grassland: 0,
        tundra: 0,
      };

      Object.keys(hybridScores).forEach(ecosystem => {
        hybridScores[ecosystem as EcosystemType] = 
          (embeddingSimilarities[ecosystem as EcosystemType] * bertWeight) +
          (keywordMatches[ecosystem as EcosystemType] * keywordWeight);
      });

      finalProbabilities = this.normalizeToProbabilities(hybridScores);
    } else {
      // Fallback to keyword matching
      finalProbabilities = this.normalizeToProbabilities(keywordMatches);
    }

    // Create ecosystem predictions
    const ecosystems: EcosystemPrediction[] = Object.entries(finalProbabilities).map(([ecosystem, probability]) => ({
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

    // Find top prediction
    const topPrediction = ecosystems.reduce((max, current) => 
      current.probability > max.probability ? current : max
    );

    return {
      ecosystems,
      topPrediction: topPrediction.ecosystem,
      confidence: topPrediction.probability,
      reasoning: [
        method === 'bert' ? 'Based on semantic similarity using BERT embeddings' :
        method === 'hybrid' ? 'Based on combined BERT embeddings and keyword matching' :
        'Based on keyword matching (BERT unavailable)'
      ],
      method,
      embeddingSimilarities,
      keywordMatches,
    };
  }

  /**
   * Get model status for debugging
   */
  getModelStatus(): { initialized: boolean; modelName: string } {
    return {
      initialized: this.isInitialized,
      modelName: this.isInitialized ? 'Xenova/all-MiniLM-L6-v2' : 'none',
    };
  }
}

// Export singleton instance
export const ecosystemPredictor = new EcosystemPredictor();

// Export types for use in components
export type { EmbeddingPredictionResult };
