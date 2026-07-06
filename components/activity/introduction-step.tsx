/**
 * Introduction Step Component
 * Figma: Desktop-3
 * Welcomes users with Zhorai and provides microphone testing
 */

'use client';

import React from 'react';
import Image from 'next/image';
import {
  MicrophonePermissionDialog,
  useMicrophonePermission
} from './microphone-permission-dialog';
import { StepComponentProps } from '@/types/activity';
import { Button } from '@/components/ui/button';

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
  title = 'How machines learn with Zhorai',
  description = "In this course, you'll teach Zhorai, our conversational agent, all about animals and ecosystems and understand how Zhorai learns.",
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
      <div className="w-[379px] h-[411px] shrink-0">
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
        <Button
          type="button"
          onClick={handleContinue}
          className="rounded-xl px-6 py-3 h-12 text-sm font-semibold leading-[17px]"
        >
          Continue
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleTestMicrophone}
          className="border rounded-xl px-6 py-3 h-12 text-sm font-semibold leading-[17px]"
        >
          Test your microphone
        </Button>
      </div>

      {/* Microphone Permission Dialog */}
      <MicrophonePermissionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        autoCloseOnSuccess
      />
    </div>
  );
}
