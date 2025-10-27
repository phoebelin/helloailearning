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
import { AudioRecorder } from './audio-recorder';

export interface PredictionStepProps extends StepComponentProps {
  /** Selected animal for prediction */
  selectedAnimal: AnimalType;
  /** User sentences that will be used for prediction */
  userSentences: string[];
  /** Callback when prediction is made */
  onPredictionMade?: (result: PredictionResult) => void;
}

// Correct answers for each animal
const CORRECT_ANSWERS: Record<AnimalType, EcosystemType[]> = {
  bees: ['rainforest', 'grassland'],
  dolphins: ['ocean'],
  monkeys: ['rainforest'],
  zebras: ['grassland'],
};

// Check if the prediction is correct
const isCorrectAnswer = (animal: AnimalType, ecosystem: EcosystemType): boolean => {
  return CORRECT_ANSWERS[animal]?.includes(ecosystem) || false;
};

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
      probability: totalScore > 0 ? score / totalScore : 0,
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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [correctGuess, setCorrectGuess] = useState<boolean | null>(null);
  
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced TTS hook
  const { speak, isSpeaking } = useEnhancedTextToSpeech({
    rate: 0.9,
    pitch: 1.1,
    useGoogleCloud: true,
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

  // Handle when user asks a question
  useEffect(() => {
    if (userQuestion && predictionResult) {
      // Generate Zhorai's response
      const ecosystemName = predictionResult.ecosystems.find(
        e => e.ecosystem === predictionResult.topPrediction
      )?.ecosystem || 'unknown';
      
      let confidenceLevel: string;
      if (predictionResult.confidence > 0.7) {
        confidenceLevel = "I'm pretty sure";
      } else if (predictionResult.confidence > 0.4) {
        confidenceLevel = 'I think';
      } else {
        confidenceLevel = 'I\'m not sure, but';
      }
      
      const response = `${confidenceLevel} ${animalDisplayName.toLowerCase()} ${confidenceLevel === 'I\'m not sure, but' ? 'might live' : 'live'} in the ${ecosystemName}! Did I guess right?`;
      setZhoraiResponse(response);
      
      // Check if the guess is correct
      const topEcosystem = predictionResult.topPrediction;
      const isCorrect = isCorrectAnswer(selectedAnimal, topEcosystem);
      setCorrectGuess(isCorrect);
      
      setShowChart(true);
      
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
  }, [userQuestion, predictionResult, animalDisplayName, speak]);

  const handleBarHover = (ecosystem: EcosystemType, prediction: any) => {
    // Could add tooltip logic here if needed
    console.log(`Hovering over ${ecosystem}:`, prediction);
  };

  const handleBarLeave = () => {
    // Could hide tooltip here if needed
  };

  return (
    <div className="max-w-[682px] mx-auto px-0 py-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-base font-normal text-gray-900 mb-4">
          Based on what you&apos;ve taught Zhorai, do you think Zhorai can guess where {animalDisplayName.toLowerCase()} live? Try asking!
        </h1>
      </div>

      {/* Speech Input Section */}
      {/* Action Section - Button and Example */}
      <div className="flex flex-row items-start gap-6 mb-8">
        {/* Press and Speak Button - Fixed width container */}
        <div className="flex-shrink-0 w-[180px]">
          <AudioRecorder
            showTranscript={false}
            buttonText="Press and speak"
            onTranscriptChange={(transcript, isFinal) => {
              setCurrentTranscript(transcript);
              if (isFinal && transcript) {
                setUserQuestion(transcript);
                setHasAskedQuestion(true);
              }
            }}
            onStart={() => {
              setIsListening(true);
              setCurrentTranscript('');
            }}
            onStop={() => setIsListening(false)}
            variant="default"
            buttonClassName="px-6 py-3 h-12 rounded-xl"
          />
        </div>
        
        {/* Example Question or Transcript - Fixed width, not affected by button state */}
        <div className="flex-shrink-0 w-[400px] pt-3 min-h-[60px]">
          {currentTranscript ? (
            <p className="text-sm font-semibold leading-[17px] text-[#967FD8]">
              {currentTranscript}
            </p>
          ) : (
            <p className="text-sm font-semibold leading-[17px] text-[#967FD8] opacity-50">
              &quot;Where do {animalDisplayName.toLowerCase()} live?&quot;
            </p>
          )}
        </div>
      </div>

      {/* Zhorai's Response and Chart */}
      {hasAskedQuestion && predictionResult && (
        <div className="bg-white rounded-lg border border-gray-200 mb-8" style={{ padding: '24px' }}>
          {/* Zhorai's response */}
          {zhoraiResponse && (
            <div className="flex justify-start items-center gap-4 mb-6">
              {/* Zhorai Avatar */}
              <Image
                src="/images/zhorai.png"
                alt="Zhorai"
                width={48}
                height={48}
                className="rounded-full border-2 border-[#967fd8]/50 flex-shrink-0"
              />
              {/* Response Box */}
              <div className="bg-[#967fd8]/10 border border-[#967fd8]/30 rounded-lg px-6 py-4">
                <p className="text-[#967fd8] font-semibold text-base">
                  {zhoraiResponse}
                </p>
              </div>
            </div>
          )}

          {/* Probability Chart */}
          {showChart && (
            <div className="mb-6">
              <div className="text-left mb-4">
                <p className="text-base text-gray-900">
                  {correctGuess === true && "It looks like Zhorai is right! "}
                  {correctGuess === false && "It looks like Zhorai guessed incorrectly. "}
                  Take a look at the chart below to see why Zhorai picked {predictionResult.ecosystems.find(e => e.ecosystem === predictionResult.topPrediction)?.ecosystem || 'this ecosystem'}. Hint: hover over the bars!
                </p>
              </div>
              
              <ProbabilityChart
                data={predictionResult}
                width={600}
                height={350}
                animated={true}
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
                className="max-w-full"
              />
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
