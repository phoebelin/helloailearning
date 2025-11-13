'use client';

import Image from 'next/image';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const router = useRouter();

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
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className="flex items-center gap-6" style={{ width: '703px' }}>
              <Image
                src="/images/basics-ai-icon.png"
                alt="Basics of AI"
                width={60}
                height={60}
                className="flex-shrink-0 object-cover"
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
                className="bg-black text-white hover:bg-black/90 text-sm font-semibold"
                style={{ borderRadius: '12px', padding: '10px' }}
              >
                Continue
              </Button>
              <ArrowUp className="w-6 h-6 text-black" />
            </div>
          </div>

          {/* Chapter 1 Section */}
          <div 
            className="flex flex-row gap-6 p-10 rounded-xl w-full"
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
                onClick={() => router.push('/test-activity-steps')}
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
          </div>
        </div>
      </div>
    </div>
  );
}

