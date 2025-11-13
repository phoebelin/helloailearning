'use client';

import { Nav } from '@/components/nav';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" id="projects-page">
      <Nav />
      
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-[120px] pt-10 pb-10" id="projects-content">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-[36px] font-semibold text-black mb-1" style={{ lineHeight: '1.2222222222222223em' }}>
            Projects
          </h1>
          <p className="text-sm text-black" style={{ lineHeight: '1.7142857142857142em' }}>
            Put your AI knowledge to practice with fun projects
          </p>
        </div>

        {/* Create a new project Section */}
        <div className="flex flex-col mb-10" style={{ gap: '24px' }}>
          <div className="flex items-center justify-between gap-2.5 w-full">
            <h2 className="text-2xl font-semibold text-black" style={{ lineHeight: '1.8333333333333333em', width: '703px' }}>
              Create a new project
            </h2>
            <div className="flex items-center gap-3 opacity-0">
              <Button className="bg-black text-white hover:bg-black/90 text-sm font-semibold" style={{ borderRadius: '12px', padding: '10px' }}>
                Continue
              </Button>
            </div>
          </div>

          {/* Form Section */}
          <div 
            className="flex flex-col gap-6 p-10 rounded-xl"
            style={{ 
              backgroundColor: '#E5E0EF',
              borderRadius: '12px',
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold text-black" style={{ lineHeight: '1.7142857142857142em' }}>
                  I want to use AI to teach my
                </span>
                
                {/* Grade Select */}
                <Select defaultValue="6th graders">
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6th graders">6th graders</SelectItem>
                    <SelectItem value="7th graders">7th graders</SelectItem>
                    <SelectItem value="8th graders">8th graders</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm font-semibold text-black" style={{ lineHeight: '1.7142857142857142em' }}>
                  something about
                </span>
                
                {/* Subject Select */}
                <Select defaultValue="Science">
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm font-semibold text-black" style={{ lineHeight: '1.7142857142857142em' }}>
                  and
                </span>
                
                {/* Topic Input */}
                <Input 
                  defaultValue="Plants"
                  className="w-[180px] bg-white"
                  placeholder="Plants"
                />
              </div>

              {/* Generate Ideas Button */}
              <Button 
                className="bg-black text-white hover:bg-black/90 text-sm font-semibold self-start"
                style={{ borderRadius: '12px', padding: '10px 20px' }}
              >
                Generate ideas
              </Button>
            </div>
          </div>
        </div>

        {/* Browse existing projects Section */}
        <div className="flex flex-col" style={{ gap: '24px' }}>
          <div className="flex items-center justify-between gap-2.5 w-full">
            <h2 className="text-2xl font-semibold text-black" style={{ lineHeight: '1.8333333333333333em', width: '703px' }}>
              Browse existing projects
            </h2>
            <div className="flex items-center gap-3 opacity-0">
              <Button className="bg-black text-white hover:bg-black/90 text-sm font-semibold" style={{ borderRadius: '12px', padding: '10px' }}>
                Continue
              </Button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#49454f]">Grade level</label>
              <Select defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="3rd">3rd grade</SelectItem>
                  <SelectItem value="4th">4th grade</SelectItem>
                  <SelectItem value="5th">5th grade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#49454f]">Subject</label>
              <Select defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Cards */}
          <div 
            className="flex flex-col gap-6 p-10 rounded-xl"
            style={{ 
              backgroundColor: '#E5E0EF',
              borderRadius: '12px',
            }}
          >
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold text-black text-center" style={{ lineHeight: '1.7142857142857142em' }}>
                Chapter 1
              </p>
              
              {/* Project Card */}
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
                  src="/images/zhorai-project.png"
                  alt="Zhorai"
                  width={165}
                  height={179}
                  className="object-contain"
                  priority
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
