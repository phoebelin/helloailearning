'use client';

import Image from 'next/image';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { ArrowUp, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isActivityCompleted } from '@/lib/utils/activity-tracking';

export default function CoursesPage() {
  const router = useRouter();
  const [moriComplete, setMoriComplete] = useState(false);
  const [pippyComplete, setPippyComplete] = useState(false);

  useEffect(() => {
    setMoriComplete(isActivityCompleted('find-the-secret-rule'));
    setPippyComplete(isActivityCompleted('update-understanding-pippy'));
    const handler = () => {
      setMoriComplete(isActivityCompleted('find-the-secret-rule'));
      setPippyComplete(isActivityCompleted('update-understanding-pippy'));
    };
    window.addEventListener('activity-completed', handler);
    return () => window.removeEventListener('activity-completed', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" id="courses-page">
      <Nav />
      
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-[120px] pt-10 pb-10" id="courses-content">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-[36px] font-semibold text-black mb-1" style={{ lineHeight: '1.2222222222222223em' }}>
            Courses
          </h1>
          <p className="text-sm text-black" style={{ lineHeight: '1.7142857142857142em' }}>
            Child-led, teacher-facilitated learning experiences
          </p>
        </div>

        {/* Course Content */}
        <div className="flex flex-col" style={{ gap: '24px' }}>
          {/* Basics of AI Course Card */}
          <div className="flex items-center justify-between gap-2.5 w-full flex-wrap">
            <div className="flex items-center gap-6" style={{ minWidth: '280px', maxWidth: '703px', flex: '1' }}>
              <Image
                src="/images/basics-ai-icon.png"
                alt="Basics of AI"
                width={60}
                height={60}
                className="shrink-0 object-cover"
              />
              <div>
                <h2 className="text-2xl font-semibold text-black" style={{ lineHeight: '1.8333333333333333em' }}>
                  Basics of AI
                </h2>
                <p className="text-sm text-black" style={{ lineHeight: '1.7142857142857142em' }}>
                  3rd to 5th grade
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                className="text-sm font-semibold"
                style={{ borderRadius: '12px', padding: '10px' }}
              >
                Continue
              </Button>
              <ArrowUp className="w-6 h-6 text-black" />
            </div>
          </div>

          {/* Chapter 1 Section */}
          <div
            className="flex flex-row flex-wrap gap-6 p-6 rounded-xl w-full"
            style={{
              backgroundColor: '#E5E0EF',
              borderRadius: '12px',
            }}
          >
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-black text-center" style={{ lineHeight: '1.7142857142857142em' }}>
                Chapter 1
              </p>
              
              {/* How machines learn with Zhorai Tile */}
              <button
                onClick={() => router.push('/lessons/how-machines-learn')}
                className="flex flex-col items-center gap-2.5 bg-white border border-black rounded-xl cursor-pointer transition-shadow hover:shadow-[0px_1px_5px_0px_rgba(0,0,0,1)]"
                style={{
                  width: '261px',
                  height: '285px',
                  padding: '24px 48px',
                  borderRadius: '12px',
                }}
              >
                <Image
                  src="/images/zhorai-course.png"
                  alt="Zhorai"
                  width={165}
                  height={179}
                  className="object-contain"
                />
                <p 
                  className="text-sm font-semibold text-black text-center whitespace-pre-line"
                  style={{ lineHeight: '1.7142857142857142em' }}
                >
                  How machines learn{'\n'}with Zhorai
                </p>
              </button>
            </div>

            {/* Chapter 2 Section */}
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-black text-center" style={{ lineHeight: '1.7142857142857142em' }}>
                Chapter 2
              </p>

              {/* How machines use patterns with Mori Tile */}
              <button
                onClick={() => router.push('/lessons/how-machines-use-patterns')}
                className="flex flex-col items-center justify-between gap-0 border border-black rounded-xl transition-shadow bg-white cursor-pointer hover:shadow-[0px_1px_5px_0px_rgba(0,0,0,1)]"
                style={{
                  width: '261px',
                  height: '285px',
                  padding: '24px',
                  borderRadius: '12px',
                  position: 'relative',
                }}
              >
                <Image
                  src="/images/mori-course.png"
                  alt="Mori"
                  width={200}
                  height={179}
                  className="object-contain"
                />
                <p
                  className="text-sm font-semibold text-black text-center whitespace-pre-line"
                  style={{ lineHeight: '1.7142857142857142em' }}
                >
                  How machines{'\n'}use patterns with Mori
                </p>
              </button>
            </div>

            {/* Chapter 3 Section */}
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-black text-center" style={{ lineHeight: '1.7142857142857142em' }}>
                Chapter 3
              </p>

              {moriComplete ? (
                <button
                  onClick={() => router.push('/lessons/how-machines-update-understanding')}
                  className="flex flex-col items-center justify-between gap-0 border border-black rounded-xl transition-shadow bg-white cursor-pointer hover:shadow-[0px_1px_5px_0px_rgba(0,0,0,1)]"
                  style={{
                    width: '261px',
                    height: '285px',
                    padding: '24px 12px',
                    borderRadius: '12px',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/images/pippy.png"
                    alt="Pippy"
                    width={140}
                    height={125}
                    className="object-contain"
                  />
                  <p
                    className="text-sm font-semibold text-black text-center whitespace-pre-line"
                    style={{ lineHeight: '1.7142857142857142em' }}
                  >
                    How machines update{'\n'}understanding with Pippy
                  </p>
                </button>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                  style={{
                    width: '261px',
                    height: '285px',
                    padding: '24px',
                    borderRadius: '12px',
                  }}
                >
                  <Lock className="w-8 h-8 text-gray-300" />
                  <Image
                    src="/images/pippy.png"
                    alt="Pippy"
                    width={200}
                    height={179}
                    className="object-contain opacity-30"
                  />
                  <p className="text-xs text-gray-400 text-center">
                    Complete <span className="font-semibold">How machines use patterns with Mori</span> to unlock
                  </p>
                </div>
              )}
            </div>

            {/* Chapter 4 Section */}
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-black text-center" style={{ lineHeight: '1.7142857142857142em' }}>
                Chapter 4
              </p>

              {pippyComplete ? (
                <button
                  onClick={() => router.push('/lessons/how-machines-chase-goals')}
                  className="flex flex-col items-center justify-between gap-0 border border-black rounded-xl transition-shadow bg-white cursor-pointer hover:shadow-[0px_1px_5px_0px_rgba(0,0,0,1)]"
                  style={{
                    width: '261px',
                    height: '285px',
                    padding: '24px 12px',
                    borderRadius: '12px',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/images/coda.png"
                    alt="Coda"
                    width={140}
                    height={125}
                    className="object-contain"
                  />
                  <p
                    className="text-sm font-semibold text-black text-center whitespace-pre-line"
                    style={{ lineHeight: '1.7142857142857142em' }}
                  >
                    How machines chase{'\n'}goals with Coda
                  </p>
                </button>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                  style={{
                    width: '261px',
                    height: '285px',
                    padding: '24px',
                    borderRadius: '12px',
                  }}
                >
                  <Lock className="w-8 h-8 text-gray-300" />
                  <Image
                    src="/images/coda.png"
                    alt="Coda"
                    width={140}
                    height={125}
                    className="object-contain opacity-30"
                  />
                  <p className="text-xs text-gray-400 text-center">
                    Complete <span className="font-semibold">How machines update understanding with Pippy</span> to unlock
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

