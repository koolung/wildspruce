'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MapPin, Users, Bed, Bath, PawPrint, Maximize2 } from 'lucide-react'
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="col-span-2 md:col-span-2 md:row-span-2 relative h-48 sm:h-64 md:h-full md:min-h-96 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Image
              src="/images/sun-drop-chalet/1.avif"
              alt="Sun Drop Chalet"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70 transition-all">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
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
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70 transition-all">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
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
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70 transition-all">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
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
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70 transition-all">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
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
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 p-2 rounded hover:bg-opacity-70 transition-all">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Title and Basic Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#223318] mb-3">
              Entire Chalet in South Brookfield, Canada
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-700">
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
              <div className="flex items-center gap-1">
                <PawPrint className="w-4 h-4" />
                <span>Pet Friendly</span>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">4.9</span>
              <span className="text-gray-600 text-sm sm:text-base">(128 reviews)</span>
            </div>
            <button className="btn-primary w-full md:w-auto">Reserve</button>
          </div>
        </div>
      </div>
    </section>
  )
}
