'use client'

import { Star } from 'lucide-react'

interface Testimonial {
  name: string
  date: string
  rating: number
  text: string
  avatar: string
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah M.',
      date: 'January 2024',
      rating: 5,
      text: 'Absolutely beautiful property! The views of Molega Lake are stunning. Bill and Shauna were wonderful hosts. Everything was clean and well-maintained. We can\'t wait to come back!',
      avatar: 'SM',
    },
    {
      name: 'James D.',
      date: 'December 2023',
      rating: 5,
      text: 'Perfect getaway! The cottage is even better than the pictures. The fireplace was cozy on the rainy days, and the outdoor screen room is fantastic. Highly recommend!',
      avatar: 'JD',
    },
    {
      name: 'Emily R.',
      date: 'November 2023',
      rating: 4,
      text: 'Great property with fantastic amenities. The lake access is amazing for kayaking. Only minor issue was the WiFi could be a bit stronger. Overall, excellent stay!',
      avatar: 'ER',
    },
  ]

  return (
    <section 
      className="w-full py-16 relative bg-cover bg-center"
      style={{
        backgroundImage: 'url(/images/about-bg.jpg)',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-white/40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl font-bold text-black mb-12">Guest Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="bg-white/95 p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#223318] rounded-full flex items-center justify-center text-white font-bold">
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="font-bold text-[#223318]">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.date}</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{testimonial.text}</p>
          </div>
        ))}
        </div>
      </div>
    </section>
  )
}
