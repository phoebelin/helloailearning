"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

interface WaitlistContextValue {
  /** Increments each time openWaitlist() is called. Hero watches this to open its email step. */
  openSignal: number
  /** Signals any listening waitlist form to open its email step. Does not scroll or navigate itself. */
  openWaitlist: () => void
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null)

/**
 * Shares a single "open the waitlist form" signal between the nav (which has
 * no form of its own) and Hero (which owns the actual step/email/name state).
 * Nav calls openWaitlist(); Hero's own effect reacts to openSignal changing.
 */
export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [openSignal, setOpenSignal] = useState(0)
  const openWaitlist = useCallback(() => {
    setOpenSignal((n) => n + 1)
  }, [])

  return (
    <WaitlistContext.Provider value={{ openSignal, openWaitlist }}>
      {children}
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) {
    throw new Error("useWaitlist must be used within a WaitlistProvider")
  }
  return ctx
}
