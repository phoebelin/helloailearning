'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';

export function MeetCodaStep({ onNext }: CodaStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <Image
        src="/images/coda.png"
        alt="Coda"
        width={220}
        height={220}
        className="mb-8 object-contain"
        priority
      />
      <h1 className="text-4xl font-bold mb-4">Meet Coda!</h1>
      <p className="text-gray-600 max-w-md mb-4 text-lg">
        Coda is a points-chaser. It can&apos;t see goals, missions, or maps — only points.
        Whatever earns the most points is exactly what Coda will do.
      </p>
      <p className="text-[#967FD8] font-medium max-w-sm mb-10 text-base italic">
        &ldquo;Hi, I&apos;m Coda! Give me points for things, and I&apos;ll go get them —
        no matter what you actually wanted.&rdquo;
      </p>
      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        See the mission
      </Button>
    </div>
  );
}
