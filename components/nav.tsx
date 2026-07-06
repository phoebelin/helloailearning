"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav"
import { Button } from "@/components/ui/button"
import { useWaitlist } from "@/lib/context/waitlist-context"

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { openWaitlist } = useWaitlist()

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
      className="px-6"
      heading={<TopNavHeading heading="Hello AI" headingHref="/" as={Link} />}
      centerContent={
        <>
          <TopNavItem label="Courses" href="/courses" as={Link} isSelected={pathname === '/courses'} />
          <TopNavItem label="Projects" href="/projects" as={Link} isSelected={pathname === '/projects'} />
          <TopNavItem label="Blog" href="/blog" as={Link} isSelected={pathname === '/blog'} />
        </>
      }
      endContent={
        <Button size="sm" className="rounded-full" onClick={handleJoinWaitlist}>
          Join the waitlist
        </Button>
      }
    />
  )
}
