'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';

const CODA_INTRO =
  "Hi! I'm Coda. I'm a points-chaser — I can't see your goal or your map, " +
  "only whatever earns the most points. Give me points for things, and I'll " +
  "go get them — no matter what you actually wanted!";

export function MeetCodaStep({ onNext }: CodaStepProps) {
  const [muted, setMuted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { speak, stop, isSupported } = useEnhancedTextToSpeech({
    rate: 0.88,
    pitch: 1.15,
    useGoogleCloud: true,
  });

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => speak(CODA_INTRO), 600);
    return () => {
      clearTimeout(timer);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMuteToggle = () => {
    if (!muted) stop();
    setMuted(m => !m);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 text-center">
      <Image
        src="/images/coda.png"
        alt="Coda"
        width={160}
        height={160}
        className="mb-4 sm:mb-6 object-contain sm:w-[200px] sm:h-[200px]"
        priority
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Meet Coda!</h1>

      <p className="text-fg-muted max-w-md mb-3 text-lg leading-relaxed">
        Coda is an AI that chases points — it can&apos;t see goals, missions, or maps.
        Whatever earns the most points is <em>exactly</em> what Coda will do.
      </p>

      <p className="text-fg-muted text-sm max-w-sm mb-4 leading-relaxed">
        You just helped Pippy fix its training data. Coda learns differently —
        instead of learning from labeled examples, Coda is guided entirely by
        a <strong>reward</strong> you design. Your job is to turn your goal
        into points Coda can chase.
      </p>

      <p className="text-[#967FD8] font-medium max-w-sm mb-8 text-base italic">
        &ldquo;Hi! I&apos;m Coda. I&apos;m a points-chaser — I can&apos;t see your
        goal or your map, only whatever earns the most points. Give me points
        for things, and I&apos;ll go get them — no matter what you actually
        wanted!&rdquo;
      </p>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <Button
          onClick={onNext}
          className="text-base px-8 py-3 min-h-[44px] w-full"
          style={{ borderRadius: '12px' }}
        >
          Give Coda a goal
        </Button>

        {isMounted && isSupported && (
          <button
            onClick={handleMuteToggle}
            className="flex items-center gap-2 text-xs text-fg-subtle hover:text-fg-muted transition-colors"
            aria-label={muted ? 'Muted' : 'Mute Coda'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {muted ? 'Muted ✓' : 'Mute Coda'}
          </button>
        )}
      </div>
    </div>
  );
}
