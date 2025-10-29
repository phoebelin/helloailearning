/**
 * Word Embeddings using @xenova/transformers
 * 
 * Implementation for semantic similarity using actual word embeddings
 * instead of pre-computed word relationships.
 */

import { pipeline, Pipeline } from '@xenova/transformers';

class WordEmbeddingsXenova {
  private model: Pipeline | null = null;
  private initializing = false;

  /**
   * Initialize the sentence encoder model
   * Model: Xenova/all-MiniLM-L6-v2 (22MB, 384 dimensions)
   */
  async initialize(): Promise<void> {
    if (this.model || this.initializing) {
      if (this.initializing) {
        // Wait for initialization to complete
        while (!this.model) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      return;
    }

    this.initializing = true;
    try {
      console.log('🔄 Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
      this.model = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { quantized: true } // Use quantized model for smaller size
      );
      console.log('✅ Embedding model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load embedding model:', error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Get embedding vector for a text string
   * @param text Input text
   * @returns 384-dimensional embedding vector
   */
  async getEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const output = await this.model(text, { pooling: 'mean', normalize: true });
    
    // Extract the embedding array from the output tensor
    return Array.from(output.data as Float32Array);
  }

  /**
   * Calculate cosine similarity between two texts
   * @param text1 First text
   * @param text2 Second text
   * @returns Similarity score between 0 and 1
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const embedding1 = await this.getEmbedding(text1);
    const embedding2 = await this.getEmbedding(text2);
    
    return this.cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    
    return dotProduct / denominator;
  }

  /**
   * Get embedding for multiple texts at once (more efficient)
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    await this.initialize();
    
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const output = await this.model(texts, { pooling: 'mean', normalize: true });
    
    // Reshape output tensor to 2D array
    const embeddings: number[][] = [];
    const dim = output.dims[output.dims.length - 1];
    
    for (let i = 0; i < texts.length; i++) {
      const start = i * dim;
      const end = start + dim;
      embeddings.push(Array.from((output.data as Float32Array).slice(start, end)));
    }
    
    return embeddings;
  }
}

// Export singleton instance
export const wordEmbeddingsXenova = new WordEmbeddingsXenova();

