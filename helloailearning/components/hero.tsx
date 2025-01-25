"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Hero() {
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission here
    console.log("Email submitted:", email)
  }

  return (
    <section className="text-center py-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-5xl font-serif mb-4">
        Anyone can learn <span className="block italic">artificial intelligence</span>
      </h1>
      <p className="text-lg mb-8 text-gray-600">
        Hello AI Learning is a free and engaging way for K-12 children to learn AI literacy.
      </p>
      {showEmailInput ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
          <div className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-black text-white hover:bg-black/90 px-8">
              Join
            </Button>
          </div>
          <p className="text-sm text-[#49454f]">I agree to receive emails from Hello AI Learning</p>
        </form>
      ) : (
        <Button
          variant="default"
          size="lg"
          className="bg-black text-white hover:bg-black/90"
          onClick={() => setShowEmailInput(true)}
        >
          Join the waitlist
        </Button>
      )}
    </section>
  )
}

