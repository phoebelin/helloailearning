export function Testimonials() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg">
            <blockquote className="text-xl mb-4">
              "Since my kids are already using things like chatGPT, I want them to understand how it works"
            </blockquote>
            <cite className="text-gray-600">Ayda's mom</cite>
          </div>
          <div className="bg-white p-8 rounded-lg">
            <blockquote className="text-xl mb-4">
              "These lessons are great. I think they know more about AI than I do now"
            </blockquote>
            <cite className="text-gray-600">Kevin's dad</cite>
          </div>
        </div>
      </div>
    </section>
  )
}

