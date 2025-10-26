/**
 * Test Sentiment Analysis in BERT Ecosystem Predictor
 * Demonstrates how sentiment affects ecosystem predictions
 */

import { ecosystemPredictorDemo } from '@/lib/ml/ecosystem-predictor-demo';

async function testSentimentAnalysis() {
  console.log('🧪 Testing Sentiment Analysis in BERT Ecosystem Predictor\n');
  
  // Test cases with different sentiment
  const testCases = [
    {
      name: 'Positive Water Sentiment',
      sentences: ['Fish love water', 'Fish thrive in aquatic environments'],
      animal: 'fish',
      expected: 'Should predict ocean (water = positive)'
    },
    {
      name: 'Negative Water Sentiment',
      sentences: ['Bees don\'t like water', 'Bees avoid swimming'],
      animal: 'bees',
      expected: 'Should NOT predict ocean (water = negative)'
    },
    {
      name: 'Neutral Water Mention',
      sentences: ['Bees live near water sources', 'Bees collect water for hives'],
      animal: 'bees',
      expected: 'Should predict ocean moderately (water = neutral)'
    },
    {
      name: 'Mixed Sentiment',
      sentences: ['Bees don\'t like water but love flowers', 'Bees avoid swimming but thrive in trees'],
      animal: 'bees',
      expected: 'Should predict rainforest (trees/flowers positive, water negative)'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`Sentences: ${testCase.sentences.join('; ')}`);
    console.log(`Expected: ${testCase.expected}`);
    console.log('─'.repeat(60));
    
    try {
      const result = await ecosystemPredictorDemo.predictEcosystem(testCase.sentences, testCase.animal);
      
      console.log(`🎯 Top Prediction: ${result.topPrediction} (${Math.round(result.confidence * 100)}% confidence)`);
      console.log(`🔧 Method: ${result.method}`);
      
      // Show ecosystem probabilities
      console.log('📊 Ecosystem Probabilities:');
      result.ecosystems.forEach(eco => {
        const bar = '█'.repeat(Math.round(eco.probability * 20));
        console.log(`  ${eco.ecosystem.padEnd(12)} ${bar.padEnd(20)} ${(eco.probability * 100).toFixed(1)}%`);
      });
      
      // Show sentiment analysis details
      console.log('\n🎭 Sentiment Analysis Details:');
      console.log('Check the detailed logs above for 🚫 (negative), ✅ (positive), ⚪ (neutral) indicators');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
  
  console.log('\n✨ Sentiment analysis test completed!');
  console.log('💡 Key insight: Negative sentiment reduces ecosystem scores, preventing incorrect predictions');
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testSentimentAnalysis().catch(console.error);
}

export { testSentimentAnalysis };
