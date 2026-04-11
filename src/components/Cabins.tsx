'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Users, Bed, Bath, Wifi, Star, PawPrint } from 'lucide-react'

interface Cabin {
  id: number
  title: string
  location: string
  image: string
  sleeps: number
  beds: number
  baths: number
  wifi: boolean
  rating: number
  reviews: number
  price: number
  comingSoon?: boolean
}

export default function Cabins() {
  const cabins: Cabin[] = [
    {
      id: 1,
      title: 'Sun Drop Chalet',
      location: 'Entire chalet in South Brookfield, Canada',
      image: '/images/woods.png',
      sleeps: 5,
      beds: 2,
      baths: 1,
      wifi: true,
      rating: 4.91,
      reviews: 55,
      price: 249,
    },
    {
      id: 2,
      title: 'The Sweet Fern',
      location: 'Molega Lake, Nova Scotia',
      image: '/images/the-sweet-fern/the_sweet_fern.jpg',
      sleeps: 5,
      beds: 2,
      baths: 1,
      wifi: true,
      rating: 5.0,
      reviews: 245,
      price: 249,
      comingSoon: true,
    },
    {
      id: 3,
      title: 'Mountain Retreat Lodge',
      location: 'nova scotia mountains',
      image: '/images/woods.png',
      sleeps: 8,
      beds: 4,
      baths: 2,
      wifi: true,
      rating: 0,
      reviews: 97,
      price: 299,
      comingSoon: true,
    },
  ]

  return (
    <section id="cabins" className="w-full py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Featured Cabins</h2>
          <p className="section-subtitle">
            Discover our most popular cabin rentals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cabins.map((cabin) => (
            <div
              key={cabin.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={cabin.image}
                  alt={cabin.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {cabin.comingSoon && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Coming Soon</span>
                  </div>
                )}
                {!cabin.comingSoon && (
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{cabin.rating}</span>
                    <span className="text-xs text-gray-600">({cabin.reviews})</span>
                  </div>
                )}
                {/* Pet Friendly Badge */}
                <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                  <PawPrint className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-800">Pet Friendly</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#223318] mb-2">
                  {cabin.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{cabin.location}</p>

                {/* Amenities */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="flex flex-col items-center">
                    <Users className="w-5 h-5 text-[#223318] mb-1" />
                    <span className="text-xs text-gray-600">{cabin.sleeps} sleeps</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bed className="w-5 h-5 text-[#223318] mb-1" />
                    <span className="text-xs text-gray-600">{cabin.beds} beds</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="w-5 h-5 text-[#223318] mb-1" />
                    <span className="text-xs text-gray-600">{cabin.baths} baths</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {cabin.wifi && (
                      <>
                        <Wifi className="w-5 h-5 text-[#223318] mb-1" />
                        <span className="text-xs text-gray-600">WiFi</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price and Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-2xl font-bold text-[#223318]">
                      ${cabin.price}
                    </span>
                    <span className="text-gray-600 text-sm"> / night</span>
                  </div>
                  {cabin.comingSoon ? (
                    <button disabled className="btn-primary text-sm opacity-50 cursor-not-allowed">
                      Notify Me
                    </button>
                  ) : (
                    <Link href="/cottage" className="btn-primary text-sm">
                      Book Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
