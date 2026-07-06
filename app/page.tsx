"use client"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { Button } from "@/components/ui/button"
import { TextInput } from "@astryxdesign/core/TextInput"
import { AppShell } from "@astryxdesign/core/AppShell"
import { useWaitlist } from "@/lib/context/waitlist-context"

type FormStep = "email" | "name" | "submitted"

/**
 * Nav's "Join the waitlist" button redirects here with ?openWaitlist=1 when
 * clicked from a page that has no waitlist form of its own. Once Hero has
 * mounted (and is listening for the signal), trigger it and clean the URL.
 * Isolated into its own component because useSearchParams() requires a
 * Suspense boundary for static prerendering — keeping it out of the main
 * page body means the rest of the page stays statically prerenderable.
 */
function WaitlistRedirectListener() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openWaitlist } = useWaitlist()

  useEffect(() => {
    if (searchParams.get("openWaitlist")) {
      openWaitlist()
      router.replace("/", { scroll: false })
    }
  }, [searchParams, openWaitlist, router])

  return null
}

export default function Home() {
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
    <AppShell topNav={<Nav />} contentPadding={0} height="auto">
      <Suspense fallback={null}>
        <WaitlistRedirectListener />
      </Suspense>
      <main>
        <Hero />
        <Features />
        <Testimonials />
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
              <p className="text-lg font-bold text-positive font-(--font-inter)">Thank you! You&apos;re on the waitlist.</p>
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
                <p className="text-sm text-critical">{error}</p>
              )}
              {(step === "email" || step === "name") && (
                <p className="text-sm text-[#49454f]">I agree to receive emails from Hello AI Learning</p>
              )}
            </form>
          )}
        </section>
      </main>
    </AppShell>
  )
}
