"use client"

import { useEffect, useRef } from "react"

const testimonials = [
  {
    quote: "Since my kids are already using things like chatGPT, I want them to understand how it works",
    author: "Ayda's mom"
  },
  {
    quote: "These lessons are great. I think they know more about AI than I do now",
    author: "Kevin's dad"
  },
  {
    quote: "My daughter loves the interactive activities. She's learning without even realizing it!",
    author: "Sarah's mom"
  },
  {
    quote: "Finally, an AI education tool that's actually engaging for kids. Highly recommend!",
    author: "Marcus's dad"
  },
  {
    quote: "The lessons are well-structured and age-appropriate. My son looks forward to each session.",
    author: "Emma's mom"
  },
  {
    quote: "As a teacher, I appreciate how this aligns with educational standards while being fun.",
    author: "Ms. Johnson"
  }
]

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollPosition = 0
    const scrollSpeed = 0.3 // pixels per frame - slower for smooth scrolling
    let animationId: number

    const animate = () => {
      scrollPosition += scrollSpeed
      
      // Get the width of one card (including gap)
      const firstCard = scrollContainer.querySelector('.testimonial-card') as HTMLElement
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth + 32 // 32px is gap-8
        const totalWidth = cardWidth * testimonials.length
        
        // Reset position when we've scrolled past all duplicated cards
        if (scrollPosition >= totalWidth) {
          scrollPosition = 0
        }
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="bg-gray-100 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-8"
            style={{ willChange: 'transform' }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="testimonial-card bg-white p-8 rounded-lg flex-shrink-0"
                style={{ minWidth: '500px', maxWidth: '600px', width: 'calc((100vw - 120px) / 2)' }}
              >
                <blockquote className="text-xl mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <cite className="text-gray-600">{testimonial.author}</cite>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

