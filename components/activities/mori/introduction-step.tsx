'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoriStepProps } from '@/types/mori-activity';

export function IntroductionStep({ onNext }: MoriStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <Image
        src="/images/mori-course.png"
        alt="Mori"
        width={220}
        height={220}
        className="mb-8 object-contain"
        priority
      />
      <h1 className="text-4xl font-bold mb-4">Meet Mori!</h1>
      <p className="text-fg-muted max-w-md mb-4 text-lg">
        Mori is a creature-sorting monster! Mori has a secret rule about which creatures it likes.
        Can you figure out the rule?
      </p>
      <p className="text-[#967FD8] font-medium max-w-sm mb-10 text-base italic">
        &ldquo;Hi, I&apos;m Mori! Some creatures match my secret rule, and some don&apos;t.
        Test some out and see if you can crack it!&rdquo;
      </p>
      <Button
        onClick={onNext}
        className="text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        How Mori thinks
      </Button>
    </div>
  );
}
