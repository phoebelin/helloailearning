/**
 * Prediction Step Component
 * Figma: Desktop-15
 * Final step where users ask Zhorai to predict where the animal lives
 * Based on PRD: 0001-prd-ecosystem-learning-activity.md - Task 5.6
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StepComponentProps, PredictionResult, EcosystemType, AnimalType } from '@/types/activity';
import { cn } from '@/lib/utils';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { ProbabilityChart } from './probability-chart';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ecosystemPredictorDemo, EmbeddingPredictionResult } from '@/lib/ml/ecosystem-predictor-demo';

export interface PredictionStepProps extends StepComponentProps {
  /** Selected animal for prediction */
  selectedAnimal: AnimalType;
  /** User sentences that will be used for prediction */
  userSentences: string[];
  /** Callback when prediction is made */
  onPredictionMade?: (result: PredictionResult) => void;
}

// Enhanced prediction using BERT with sentiment analysis
const createEnhancedPrediction = async (animal: AnimalType, sentences: string[]): Promise<PredictionResult> => {
  try {
    // Use the BERT-based predictor with sentiment analysis
    const result = await ecosystemPredictorDemo.predictEcosystem(sentences, animal);
    
    // Convert EmbeddingPredictionResult to PredictionResult
    return {
      ecosystems: result.ecosystems,
      topPrediction: result.topPrediction,
      confidence: result.confidence,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Error with BERT prediction, falling back to keyword matching:', error);
    
    // Fallback to simple keyword matching if BERT fails
    const allText = sentences.join(' ').toLowerCase();
    
    const ecosystemScores: Record<EcosystemType, number> = {
      desert: 0,
      ocean: 0,
      rainforest: 0,
      grassland: 0,
      tundra: 0,
    };

    const keywords = {
      desert: ['hot', 'dry', 'sand', 'cactus', 'desert', 'arid'],
      ocean: ['water', 'ocean', 'sea', 'swim', 'fish', 'waves', 'blue'],
      rainforest: ['trees', 'forest', 'rain', 'green', 'jungle', 'tropical', 'flowers'],
      grassland: ['grass', 'field', 'open', 'plain', 'meadow', 'prairie'],
      tundra: ['cold', 'snow', 'ice', 'arctic', 'frozen', 'winter'],
    };

    Object.entries(keywords).forEach(([ecosystem, words]) => {
      words.forEach(word => {
        if (allText.includes(word)) {
          ecosystemScores[ecosystem as EcosystemType] += 1;
        }
      });
    });

    const totalScore = Object.values(ecosystemScores).reduce((sum, score) => sum + score, 0);
    const probabilities = Object.entries(ecosystemScores).map(([ecosystem, score]) => ({
      ecosystem: ecosystem as EcosystemType,
      probability: totalScore > 0 ? score / totalScore : 0.2,
      influencingSentences: sentences.filter(sentence => 
        keywords[ecosystem as keyof typeof keywords].some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      ),
      keywords: keywords[ecosystem as keyof typeof keywords].filter(keyword => 
        allText.includes(keyword)
      ),
    }));

    const topPrediction = probabilities.reduce((max, current) => 
      current.probability > max.probability ? current : max
    );

    return {
      ecosystems: probabilities,
      topPrediction: topPrediction.ecosystem,
      confidence: topPrediction.probability,
      reasoning: ['Based on keyword matching (BERT unavailable)'],
    };
  }
};

export function PredictionStep({
  selectedAnimal,
  userSentences,
  onNext,
  onPrevious,
  onPredictionMade,
}: PredictionStepProps) {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [zhoraiResponse, setZhoraiResponse] = useState('');
  
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced TTS hook
  const { speak, isSpeaking } = useEnhancedTextToSpeech({
    rate: 0.9,
    pitch: 1.1,
    useGoogleCloud: true,
  });

  // Speech recognition hook
  const {
    transcript,
    isListening: isRecognitionListening,
    startListening,
    stopListening,
    error: recognitionError,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: false,
  });

  // Animal display name
  const animalDisplayName = selectedAnimal.charAt(0).toUpperCase() + selectedAnimal.slice(1);

  // Initialize BERT predictor
  useEffect(() => {
    const initializePredictor = async () => {
      try {
        await ecosystemPredictorDemo.initialize();
        console.log('BERT predictor initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize BERT predictor, will use fallback:', error);
      }
    };
    
    initializePredictor();
  }, []);

  // Generate prediction when component mounts or sentences change
  useEffect(() => {
    if (userSentences.length > 0) {
      const generatePrediction = async () => {
        try {
          const prediction = await createEnhancedPrediction(selectedAnimal, userSentences);
          setPredictionResult(prediction);
          onPredictionMade?.(prediction);
        } catch (error) {
          console.error('Failed to generate prediction:', error);
        }
      };
      
      generatePrediction();
    }
  }, [userSentences, selectedAnimal, onPredictionMade]);

  // Handle speech recognition result
  useEffect(() => {
    if (transcript && !isRecognitionListening) {
      setUserQuestion(transcript);
      setIsListening(false);
      
      // Generate Zhorai's response
      if (predictionResult) {
        const ecosystemName = predictionResult.ecosystems.find(
          e => e.ecosystem === predictionResult.topPrediction
        )?.ecosystem || 'unknown';
        
        const confidenceLevel = predictionResult.confidence > 0.7 ? 'pretty sure' : 
                               predictionResult.confidence > 0.4 ? 'think' : 'maybe';
        
        const response = `I ${confidenceLevel} ${animalDisplayName.toLowerCase()} live in the ${ecosystemName}!`;
        setZhoraiResponse(response);
        setShowChart(true);
        setHasAskedQuestion(true);
        
        // Speak the response
        setTimeout(() => {
          speak(response, {
            onError: (error) => {
              if (error !== 'canceled') {
                console.warn('Speech synthesis error:', error);
              }
            }
          });
        }, 500);
      }
    }
  }, [transcript, isRecognitionListening, predictionResult, animalDisplayName, speak]);

  // Handle listening state
  useEffect(() => {
    setIsListening(isRecognitionListening);
  }, [isRecognitionListening]);

  const handleStartListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleBarHover = (ecosystem: EcosystemType, prediction: any) => {
    // Could add tooltip logic here if needed
    console.log(`Hovering over ${ecosystem}:`, prediction);
  };

  const handleBarLeave = () => {
    // Could hide tooltip here if needed
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Based on what you&apos;ve taught Zhorai, do you think Zhorai can guess where a {animalDisplayName.toLowerCase()} lives? Try asking!
        </h1>
      </div>

      {/* Speech Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="text-center mb-6">
          <Button
            onClick={handleStartListening}
            disabled={isSpeaking}
            className={cn(
              "bg-black text-white hover:bg-gray-800 disabled:opacity-50 px-8 py-4 text-lg font-semibold",
              isListening && "bg-red-600 hover:bg-red-700"
            )}
          >
            {isListening ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                Listening...
              </div>
            ) : (
              "Press and speak"
            )}
          </Button>
        </div>

        {/* Example question */}
        <div className="text-center">
          <p className="text-purple-600 font-medium">
            Example: &quot;Where do {animalDisplayName.toLowerCase()} live?&quot;
          </p>
        </div>

        {/* User question display */}
        {userQuestion && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">You asked:</p>
            <p className="text-gray-900 font-medium">&quot;{userQuestion}&quot;</p>
          </div>
        )}

        {/* Recognition error */}
        {recognitionError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Speech recognition error: {recognitionError}
            </p>
          </div>
        )}
      </div>

      {/* Zhorai's Response and Chart */}
      {hasAskedQuestion && predictionResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* Zhorai's response */}
          {zhoraiResponse && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-6 py-4">
                <Image
                  src="/images/zhorai.png"
                  alt="Zhorai"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <p className="text-purple-800 font-semibold text-lg">
                  {zhoraiResponse}
                </p>
              </div>
            </div>
          )}

          {/* Probability Chart */}
          {showChart && (
            <div className="mb-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Here&apos;s how confident I am about each ecosystem:
                </h3>
                <p className="text-sm text-gray-600">
                  Hover over the bars to see what sentences I learned that correspond with each ecosystem
                </p>
              </div>
              
              <div className="flex justify-center">
                <ProbabilityChart
                  data={predictionResult}
                  width={700}
                  height={350}
                  animated={true}
                  onBarHover={handleBarHover}
                  onBarLeave={handleBarLeave}
                  className="max-w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zhorai Character */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <Image
            src="/images/zhorai.png"
            alt="Zhorai"
            width={139}
            height={151}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-black text-white hover:bg-gray-800"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export default PredictionStep;
