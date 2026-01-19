"use client"

import { LessonNav } from "@/components/lesson-nav"

export default function Chapter2() {
  return (
    <div className="min-h-screen bg-white">
      <LessonNav currentStep={1} totalSteps={1} />
      <div className="pt-16">
        {/* Skeleton content - to be filled in later */}
      </div>
    </div>
  )
}

