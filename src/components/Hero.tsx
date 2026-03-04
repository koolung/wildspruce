'use client'

export default function Hero() {
  return (
    <section 
      id="home" 
      className="w-full h-[70vh] text-white py-20 md:py-32 relative overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              The Perfect Cabin Escape in Nova Scotia
            </h1>
            <p className="text-xl text-gray-100 leading-relaxed">
              Discover stunning cabin rentals in the heart of nature. Book your dream getaway and create unforgettable memories in the wilderness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#cabins" className="btn-primary bg-white text-[#223318] hover:bg-gray-100">
                Browse Cabins
              </a>
              <a href="#contact" className="btn-secondary border-white text-white hover:bg-white hover:text-[#223318]">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
