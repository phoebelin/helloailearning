/**
 * Introduction Step Component
 * Figma: Desktop-3
 * Welcomes users with Zhorai and provides microphone testing
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  MicrophonePermissionDialog, 
  useMicrophonePermission 
} from './microphone-permission-dialog';
import { StepComponentProps } from '@/types/activity';

export interface IntroductionStepProps extends StepComponentProps {
  /** Custom title (optional) */
  title?: string;
  /** Custom description (optional) */
  description?: string;
  /** Whether microphone is required to proceed */
  requireMicrophone?: boolean;
}

/**
 * Introduction Step Component
 * Figma: Desktop-3
 * Welcomes users with Zhorai and provides microphone testing
 */
export function IntroductionStep({
  onNext,
  title = 'How machine learns with Zhorai',
  description = "In this course, you'll teach Zhorai, our conversational agent, all about animals and ecosystems and understand how Zhorai learns.",
  requireMicrophone = false,
}: IntroductionStepProps) {
  const { 
    isDialogOpen, 
    openDialog, 
    closeDialog,
  } = useMicrophonePermission();

  console.log('IntroductionStep rendered, onNext:', typeof onNext);

  const handleTestMicrophone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Test microphone button clicked');
    console.log('isDialogOpen before:', isDialogOpen);
    openDialog();
    console.log('openDialog called');
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Continue button clicked, onNext:', onNext);
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 py-20 px-4 max-w-[682px] mx-auto">
      {/* Zhorai Character - Using Figma asset */}
      <div className="w-[379px] h-[411px] flex-shrink-0">
        <Image
          src="/images/zhorai.png"
          alt="Zhorai, your AI learning companion"
          width={379}
          height={411}
          priority
          className="object-contain w-full h-full"
        />
      </div>

      {/* Title */}
      <h1 className="text-[36px] font-semibold text-black leading-[44px] w-full">
        {title}
      </h1>
      
      {/* Description */}
      <p className="text-base text-black leading-[32px] w-full">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-row gap-3 z-10 relative">
        <button
          type="button"
          onClick={handleContinue}
          className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
        >
          Continue
        </button>
        
        <button
          type="button"
          onClick={handleTestMicrophone}
          className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
        >
          Test your microphone
        </button>
      </div>

      {/* Microphone Permission Dialog */}
      {console.log('Rendering dialog, isOpen:', isDialogOpen)}
      <MicrophonePermissionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        autoCloseOnSuccess
      />
    </div>
  );
}
