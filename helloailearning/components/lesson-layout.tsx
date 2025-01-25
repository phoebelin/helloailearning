"use client"

import { useState, useEffect } from "react"
import { LessonNav } from "./lesson-nav"

interface LessonLayoutProps {
  children: React.ReactNode[]
  initialStep?: number
}

export function LessonLayout({ children, initialStep = 1 }: LessonLayoutProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleNext = () => {
    if (currentStep < children.length) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 500)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsTransitioning(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <LessonNav
        currentStep={currentStep}
        totalSteps={children.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
      <div className="pt-16">
        {children.map((child, index) => (
          <div
            key={index}
            className={`transition-transform duration-500 absolute w-full ${
              index + 1 === currentStep
                ? "translate-y-0 opacity-100"
                : index + 1 < currentStep
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
            }`}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

