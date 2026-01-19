export function Features() {
  return (
    <section className="py-20 px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <img 
          src="/images/feature-standards-aligned.png" 
          alt="Fun for kids, effective for learning" 
          className="rounded-xl w-full"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-serif mb-4">Fun for kids, effective for learning</h2>
          <p className="text-gray-600">
            Hello AI Learning is the first digitally-native AI literacy tool, and research shows that it works. Children
            will build real AI competencies through interactive lessons, and work up to their own personally-relevant
            project.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 mt-20">
        <div className="flex flex-col justify-center order-2 md:order-1">
          <h2 className="text-3xl font-serif mb-4">Backed by research from Harvard and MIT</h2>
          <p className="text-gray-600">
            We use research-backed methods and learning science to inform our learning experiences, and have tested
            their efficacy against AI learning frameworks.
          </p>
        </div>
        <img 
          src="/images/feature-harvard-mit.png" 
          alt="Backed by research from Harvard and MIT" 
          className="rounded-xl w-full order-1 md:order-2"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-16 mt-20">
        <img 
          src="/images/feature-fun-effective.png" 
          alt="Standards-aligned, co-designed with educators" 
          className="rounded-xl w-full"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-serif mb-4">Standards-aligned, co-designed with educators</h2>
          <p className="text-gray-600">
            All of our lessons are connected to national standards, so children can experience integrated learning that
            blends AI with other disciplines.
          </p>
        </div>
      </div>
    </section>
  )
}

