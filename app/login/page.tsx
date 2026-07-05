"use client"
import { useState } from "react"
import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { TextInput } from "@astryxdesign/core/TextInput"

type FormStep = "email" | "name" | "submitted"

export default function LoginPage() {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <section className="text-center py-20 px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl font-serif mb-6">Login</h1>
          <p className="text-xl text-gray-600 mb-8">
            Login functionality is coming soon! We&apos;re working hard to bring you a seamless experience.
          </p>
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <p className="text-lg text-gray-700">
              In the meantime, join our waitlist to be notified when login becomes available.
            </p>
          </div>
        </section>
        <section className="text-center py-20 px-4">
          <h2 className="text-4xl font-serif mb-8">Prepare your child for the AI era</h2>
          {step === null ? (
            <Button
              variant="default"
              size="lg"
              className="rounded-xl"
              onClick={() => setStep("email")}
            >
              Join the waitlist
            </Button>
          ) : step === "submitted" && success ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-bold text-green-600 font-(--font-inter)">Thank you! You&apos;re on the waitlist.</p>
              <p className="text-sm text-[#49454f]">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form
              onSubmit={step === "email" ? handleEmailContinue : handleNameSubmit}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-start gap-2 w-full max-w-md mx-auto">
                <div className="flex-1">
                  {step === "email" ? (
                    <TextInput
                      label="Email"
                      isLabelHidden
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(value) => {
                        setEmail(value)
                        setError(null)
                      }}
                      isRequired
                      hasAutoFocus
                      size="lg"
                    />
                  ) : (
                    <TextInput
                      label="Name"
                      isLabelHidden
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(value) => {
                        setName(value)
                        setError(null)
                      }}
                      isRequired
                      hasAutoFocus
                      size="lg"
                    />
                  )}
                </div>
                <Button
                  type="submit"
                  className="px-5 rounded-xl text-sm font-medium mt-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : step === "email" ? "Continue" : "Submit"}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              {(step === "email" || step === "name") && (
                <p className="text-sm text-[#49454f]">I agree to receive emails from Hello AI Learning</p>
              )}
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

