"use client"
import { Nav } from "@/components/nav"
import { AppShell } from "@astryxdesign/core/AppShell"

export default function PrivacyPage() {
  return (
    <AppShell topNav={<Nav />} contentPadding={0} height="auto">
      <main>
        <section className="text-center py-20 px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl font-serif mb-6">Privacy Policy</h1>
          <div className="bg-fill rounded-xl p-8">
            <p className="text-lg text-fg-muted">
              Privacy policy coming soon.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
