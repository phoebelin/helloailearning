import { Nav } from "@/components/nav"
import { ProjectCreator } from "@/components/project-creator"
import { ProjectBrowser } from "@/components/project-browser"
import { ChapterCard } from "@/components/chapter-card"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-[#49454f]">Put your AI knowledge to practice with fun projects</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6">Create a new project</h2>
          <ProjectCreator />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Browse existing projects</h2>
          <ProjectBrowser />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ChapterCard
              chapter={1}
              title="How machines learn"
              imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ai_literacy_for_kids-a8PkLsmUHPtOcbpg6za3wc9blBXRtV.png"
              href="/lessons/how-machines-learn"
            />
            <ChapterCard chapter={2} title="XXX" />
            <ChapterCard chapter={3} title="XXX" />
            <ChapterCard chapter={4} title="XXX" />
          </div>
        </section>
      </main>
    </div>
  )
}

