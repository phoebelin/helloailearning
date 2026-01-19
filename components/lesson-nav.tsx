"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface LessonNavProps {
  currentStep: number
  totalSteps?: number
  onNext?: () => void
  onPrevious?: () => void
}

export function LessonNav({ currentStep, totalSteps = 5, onNext, onPrevious }: LessonNavProps) {
  const router = useRouter()
  const visibleStepIndex = currentStep - 1 // Convert to 0-based index

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-[60px] py-6">
        <div className="flex items-center justify-between">
          {/* Left spacer for balance */}
          <div className="w-20" />
          
          {/* Centered navigation */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={visibleStepIndex === 0}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {/* Progress indicators - rectangular bars matching Figma design */}
            <div className="flex items-center" style={{ width: '432px', gap: '8px' }}>
              {Array.from({ length: totalSteps }).map((_, index) => {
                const isCompleted = index <= visibleStepIndex
                return (
                  <div
                    key={index}
                    className="h-3 transition-colors"
                    style={{
                      flex: 1,
                      backgroundColor: isCompleted ? '#967FD8' : '#D9D9D9',
                      borderRadius: '12px',
                    }}
                  />
                )
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={visibleStepIndex >= totalSteps - 1}
              className="text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Right side - X button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/courses')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

