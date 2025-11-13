"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User } from "lucide-react"

export function Nav() {
  const pathname = usePathname()

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
          <button className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>
          <button>
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  )
}

