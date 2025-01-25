"use client"
import { useState } from "react"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [showBottomEmailInput, setShowBottomEmailInput] = useState(false)
  const [bottomEmail, setBottomEmail] = useState("")

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission here
    console.log("Email submitted:", bottomEmail)
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <section className="text-center py-20 px-4">
          <h2 className="text-4xl font-serif mb-8">Prepare your child for the AI era</h2>
          {showBottomEmailInput ? (
            <form onSubmit={handleBottomSubmit} className="flex flex-col items-center gap-2">
              <div className="flex w-full max-w-md gap-2 mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={bottomEmail}
                  onChange={(e) => setBottomEmail(e.target.value)}
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
              onClick={() => setShowBottomEmailInput(true)}
            >
              Join the waitlist
            </Button>
          )}
        </section>
      </main>
    </div>
  )
}

