"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { getCompletedActivitiesCount } from "@/lib/utils/activity-tracking"

export function Nav() {
  const pathname = usePathname()
  const [completedCount, setCompletedCount] = useState(0)
  
  // Only show streak on projects and courses pages
  const showStreak = pathname === '/projects' || pathname === '/courses'

  useEffect(() => {
    if (showStreak) {
      setCompletedCount(getCompletedActivitiesCount())
      
      // Listen for custom event when activities are completed
      const handleActivityCompleted = () => {
        setCompletedCount(getCompletedActivitiesCount())
      }
      
      // Also listen for storage changes (for cross-tab updates)
      const handleStorageChange = () => {
        setCompletedCount(getCompletedActivitiesCount())
      }
      
      window.addEventListener('activity-completed', handleActivityCompleted)
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        window.removeEventListener('activity-completed', handleActivityCompleted)
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [showStreak])

  return (
    <header className="border-b">
      <nav className="flex items-center justify-between py-6 px-[60px] max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold">
            Hello AI
          </Link>
          <div className="flex gap-6">
            <Link 
              href="/courses" 
              className={`text-sm ${pathname === '/courses' ? 'font-semibold' : ''}`}
            >
              Courses
            </Link>
            <Link 
              href="/projects" 
              className={`text-sm ${pathname === '/projects' ? 'font-semibold' : ''}`}
            >
              Projects
            </Link>
            <Link 
              href="/blog" 
              className={`text-sm ${pathname === '/blog' ? 'font-semibold' : ''}`}
            >
              Blog
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showStreak && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{completedCount}</span>
              <Flame className="w-5 h-5" />
            </div>
          )}
          <Link href="/login" className="text-sm">
            Login
          </Link>
        </div>
      </nav>
    </header>
  )
}

