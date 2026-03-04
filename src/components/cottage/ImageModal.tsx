'use client'

import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ImageModalProps {
  isOpen: boolean
  images: string[]
  onClose: () => void
}

export default function ImageModal({ isOpen, images, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!isOpen) return null

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Close modal"
      >
        <X className="w-8 h-8 text-white" />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Previous Button */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      {/* Next Button */}
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 px-4">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-16 h-16 rounded overflow-hidden transition-opacity ${
              idx === currentIndex ? 'opacity-100 border-2 border-white' : 'opacity-50 hover:opacity-75'
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
