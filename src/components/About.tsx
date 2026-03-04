'use client'

import Image from 'next/image'

export default function About() {
  return (
    <section 
      id="about" 
      className="w-full py-20 md:py-32 relative bg-cover bg-center"
      style={{
        backgroundImage: 'url(/images/about-bg.jpg)',
      }}
    >
      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/75"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-96 md:h-full min-h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/images/about.jpg"
              alt="About Us - Bill and Shauna Lilly"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-[#223318] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              🏡 Locally & Family Owned
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="section-title">About Us</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We are <span className="font-semibold text-[#223318]">Bill and Shauna Lilly</span>, the proud owners of two vacation properties that offer unique escapes in beautiful locations.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="border-l-4 border-[#223318] pl-6 bg-[#3d5a2b] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                   Sun Drop Chalet
                </h3>
                <p className="text-white">
                  Nestled along Molega Lake on the South Shore of Nova Scotia. A serene lakeside haven surrounded by natural beauty and tranquility.
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide unforgettable vacation experiences in two of the most beautiful destinations we know. Whether you prefer the warmth of the Florida coast or the cool charm of Nova Scotia, we invite you to experience the magic of our properties.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
