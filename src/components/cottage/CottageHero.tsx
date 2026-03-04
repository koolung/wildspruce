'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MapPin, Users, Bed, Bath } from 'lucide-react'
import ImageModal from './ImageModal'

export default function CottageHero() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const images = [
    '/images/sun-drop-chalet/1.avif',
    '/images/sun-drop-chalet/2.avif',
    '/images/sun-drop-chalet/3.avif',
    '/images/lake_view.png',
    '/images/sun-drop-chalet/5.avif',
    '/images/sun-drop-chalet/6.avif',
    '/images/sun-drop-chalet/7.avif',
    '/images/sun-drop-chalet/8.avif',
    '/images/sun-drop-chalet/9.avif',
    '/images/sun-drop-chalet/10.avif',
    '/images/sun-drop-chalet/11.avif',
    '/images/sun-drop-chalet/12.avif',
    '/images/sun-drop-chalet/13.avif',
    '/images/sun-drop-chalet/14.avif',
    '/images/sun-drop-chalet/15.avif',
    '/images/sun-drop-chalet/16.avif',
    '/images/sun-drop-chalet/17.avif',
    '/images/sun-drop-chalet/18.avif',
  ]
  return (
    <section className="w-full bg-white">
      <ImageModal isOpen={isModalOpen} images={images} onClose={() => setIsModalOpen(false)} />
      
      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:col-span-2 md:row-span-2 relative h-64 md:h-full min-h-96 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/sun-drop-chalet/1.avif"
              alt="Sun Drop Chalet"
              fill
              className="object-cover"
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative h-48 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/sun-drop-chalet/2.avif"
              alt="Lake View"
              fill
              className="object-cover"
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative h-48 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/sun-drop-chalet/3.avif"
              alt="Bedroom"
              fill
              className="object-cover"
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative h-48 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/lake_view.png"
              alt="Kitchen"
              fill
              className="object-cover"
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative h-48 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/sun-drop-chalet/5.avif"
              alt="Outdoor"
              fill
              className="object-cover"
            />
          </button>
        </div>
      </div>

      {/* Title and Basic Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-[#223318] mb-2">
              Entire Chalet in South Brookfield, Canada
            </h1>
            <div className="flex items-center gap-4 text-gray-700">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>5 guests</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>2 bedrooms</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>2 beds</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>1 bath</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">4.9</span>
              <span className="text-gray-600">(128 reviews)</span>
            </div>
            <button className="btn-primary">Reserve</button>
          </div>
        </div>
      </div>
    </section>
  )
}
