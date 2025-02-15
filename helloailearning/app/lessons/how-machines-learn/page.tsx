"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LessonLayout } from "@/components/lesson-layout"

export default function HowMachinesLearn() {
  return (
    <LessonLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Image
          // src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ai_literacy_for_kids-3mWyqGGbOHl4FnDlNORcqnEKc8uKnM.png"
          src="/helloailearning/app/lessons/how-machines-learn/imgs/zhorai.png"
          alt="Zhorai"
          width={300}
          height={300}
          className="mb-8"
        />
        <h1 className="text-4xl font-bold mb-4">
          How machine learns
          <br />
          with Zhorai
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          In this course, you'll teach Zhorai, our conversational agent, all about animals and ecosystems and understand
          how Zhorai learns.
        </p>
        <div className="flex gap-4">
          <Button className="bg-black text-white hover:bg-black/90">Continue</Button>
          <Button variant="outline">Test your microphone</Button>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl mb-8">Start by asking Zhorai about your favorite ecosystem.</h2>
        <div className="flex flex-col gap-4 items-start mb-8">
          <Button variant="ghost" className="text-left w-full">
            Desert
          </Button>
          <Button variant="ghost" className="text-left w-full">
            Ocean
          </Button>
          <Button variant="ghost" className="text-left w-full">
            Rainforest
          </Button>
          <Button variant="ghost" className="text-left w-full">
            Grassland
          </Button>
          <Button variant="ghost" className="text-left w-full">
            Tundra
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-black text-white hover:bg-black/90">Press and speak</Button>
          <span className="text-[#967fd8]">"What do you know about the desert?"</span>
        </div>
      </div>
    </LessonLayout>
  )
}

