"use client"

import { X, Bell, ChevronLeft, ChevronRight } from "lucide-react"
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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Bell className="w-5 h-5" />
            <span className="font-medium">2</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onPrevious} disabled={currentStep === 1} className="text-sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-2 w-16 rounded-full ${i < currentStep ? "bg-[#967fd8]" : "bg-gray-200"}`} />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={currentStep === totalSteps}
              className="text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")} className="text-gray-500">
          <X className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

