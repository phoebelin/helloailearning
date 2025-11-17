"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FormStep = "email" | "name" | "submitted"

export function Hero() {
  const [step, setStep] = useState<FormStep | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }
    setError(null)
    setStep("name")
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name: name.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist")
      }

      setSuccess(true)
      setStep("submitted")
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === null) {
    return (
      <section className="text-center py-20 px-4 max-w-3xl mx-auto">
        <h1 className="text-5xl font-serif mb-6">
          Anyone can learn <span className="block italic">artificial intelligence</span>
        </h1>
        <p className="text-lg mb-6 text-gray-600">
          Hello AI Learning is a free and engaging way for K-12 children to learn AI literacy.
        </p>
        <Button
          variant="default"
          size="lg"
          className="bg-black text-white hover:bg-black/90 rounded-xl"
          onClick={() => setStep("email")}
        >
          Join the waitlist
        </Button>
        <div className="mt-12">
          <img 
            src="/images/hero-image.png" 
            alt="AI Learning for Kids" 
            className="w-full max-w-4xl mx-auto rounded-xl"
          />
        </div>
      </section>
    )
  }

  if (step === "submitted" && success) {
    return (
      <section className="text-center py-20 px-4 max-w-3xl mx-auto">
        <h1 className="text-5xl font-serif mb-6">
          Anyone can learn <span className="block italic">artificial intelligence</span>
        </h1>
        <p className="text-lg mb-6 text-gray-600">
          Hello AI Learning is a free and engaging way for K-12 children to learn AI literacy.
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-purple-400 font-[var(--font-inter)]">Thank you! We'll be in touch soon.</p>
        </div>
        <div className="mt-12">
          <img 
            src="/images/hero-image.png" 
            alt="AI Learning for Kids" 
            className="w-full max-w-4xl mx-auto rounded-xl"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="text-center py-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-5xl font-serif mb-6">
        Anyone can learn <span className="block italic">artificial intelligence</span>
      </h1>
      <p className="text-lg mb-6 text-gray-600">
        Hello AI Learning is a free and engaging way for K-12 children to learn AI literacy.
      </p>
      <form
        onSubmit={step === "email" ? handleEmailContinue : handleNameSubmit}
        className="flex flex-col items-center gap-2"
      >
        <div className="relative w-full max-w-md">
          {step === "email" ? (
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              required
              className="w-full h-14 pr-28 text-base rounded-xl pl-4 border-gray-300 focus-visible:border-purple-300 focus-visible:ring-1 focus-visible:ring-purple-300"
              autoFocus
            />
          ) : (
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              required
              className="w-full h-14 pr-28 text-base rounded-xl pl-4 border-gray-300 focus-visible:border-purple-300 focus-visible:ring-1 focus-visible:ring-purple-300"
              autoFocus
            />
          )}
          <Button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black text-white hover:bg-black/90 px-5 h-10 rounded-xl text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : step === "email" ? "Continue" : "Submit"}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {step === "email" && (
          <p className="text-sm text-[#49454f]">I agree to receive emails from Hello AI Learning</p>
        )}
      </form>
      <div className="mt-12">
        <img 
          src="/images/hero-image.png" 
          alt="AI Learning for Kids" 
          className="w-full max-w-4xl mx-auto rounded-xl"
        />
      </div>
    </section>
  )
}

