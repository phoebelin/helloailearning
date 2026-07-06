"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav"
import { Button } from "@/components/ui/button"
import { getCompletedActivitiesCount } from "@/lib/utils/activity-tracking"
import { useWaitlist } from "@/lib/context/waitlist-context"

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { openWaitlist } = useWaitlist()
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

  const handleJoinWaitlist = () => {
    if (pathname === '/') {
      // Hero is already mounted on this page — just signal it to open.
      openWaitlist()
    } else {
      // Navigate home, then app/page.tsx's mount effect reads this flag and
      // calls openWaitlist() once Hero is mounted.
      router.push('/?openWaitlist=1')
    }
  }

  return (
    <TopNav
      label="Main"
      heading={<TopNavHeading heading="Hello AI" headingHref="/" as={Link} />}
      centerContent={
        <>
          <TopNavItem label="Courses" href="/courses" as={Link} isSelected={pathname === '/courses'} />
          <TopNavItem label="Projects" href="/projects" as={Link} isSelected={pathname === '/projects'} />
          <TopNavItem label="Blog" href="/blog" as={Link} isSelected={pathname === '/blog'} />
        </>
      }
      endContent={
        <div className="flex items-center gap-4">
          {showStreak && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{completedCount}</span>
              <Flame className="w-5 h-5" />
            </div>
          )}
          <Button size="sm" onClick={handleJoinWaitlist}>
            Join the waitlist
          </Button>
        </div>
      }
    />
  )
}
