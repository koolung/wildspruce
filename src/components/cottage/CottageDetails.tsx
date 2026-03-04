'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, KeyRound, Home, Check, ChevronDown, ChevronUp, Plus, Minus, X } from 'lucide-react'

interface AmenityGroup {
  category: string
  amenities: string[]
}

function AmenityItem({ amenity }: { amenity: string }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
      <span className="text-white">{amenity}</span>
    </li>
  )
}

function AmenityGroupCard({ group, color }: { group: AmenityGroup; color: string }) {
  const [expanded, setExpanded] = useState(false)
  const displayLimit = 3
  const hasMore = group.amenities.length > displayLimit
  const visibleAmenities = expanded ? group.amenities : group.amenities.slice(0, displayLimit)

  return (
    <div className={`${color} rounded-[10px] p-8 text-white`}>
      <h3 className="text-lg font-bold text-white mb-4">{group.category}</h3>
      <ul className="space-y-3">
        {visibleAmenities.map((amenity, amenityIdx) => (
          <AmenityItem key={amenityIdx} amenity={amenity} />
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/80 hover:text-white text-sm font-semibold flex items-center gap-1 mt-4 transition-colors"
        >
          {expanded ? (
            <>
              Read Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read More ({group.amenities.length - displayLimit} more) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default function CottageDetails() {
  // Date and guest state
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  })

  const totalGuests = guests.adults + guests.children
  const maxGuests = 5

  const updateGuests = (type: 'adults' | 'children' | 'infants' | 'pets', delta: number) => {
    setGuests((prev) => {
      const newCount = Math.max(0, prev[type] + delta)
      
      // Check max guests limit (not including infants)
      if (type === 'adults' || type === 'children') {
        const newTotal = (type === 'adults' ? newCount : prev.adults) + (type === 'children' ? newCount : prev.children)
        if (newTotal > maxGuests) return prev
      }
      
      // Check max pets
      if (type === 'pets' && newCount > 20) return prev
      
      return { ...prev, [type]: newCount }
    })
  }

  const colors = [
    'bg-[#223318]',
    'bg-[rgb(91,107,95)]',
    'bg-[rgb(91,107,95)]',
    'bg-[#223318]',
    'bg-[#223318]',
    'bg-[rgb(91,107,95)]',
    'bg-[rgb(91,107,95)]',
    'bg-[#223318]',
    'bg-[#223318]',
    'bg-[rgb(91,107,95)]',
    'bg-[rgb(91,107,95)]',
  ]

  const amenityGroups: AmenityGroup[] = [
    {
      category: 'Bathroom',
      amenities: ['Hair dryer', 'Cleaning products', 'Shampoo', 'Conditioner', 'Body soap', 'Hot water', 'Shower gel'],
    },
    {
      category: 'Bedroom and Laundry',
      amenities: ['Free washer – In unit', 'Free dryer – In unit', 'Cotton linens', 'Iron'],
    },
    {
      category: 'Essentials',
      amenities: ['Towels, bed sheets, soap, and toilet paper'],
    },
    {
      category: 'Entertainment',
      amenities: ['Ethernet connection', '55-inch HDTV with standard cable'],
    },
    {
      category: 'Heating and Cooling',
      amenities: ['Indoor fireplace', 'Portable fans', 'Heating'],
    },
    {
      category: 'Kitchen and Dining',
      amenities: [
        'Kitchen',
        'Refrigerator',
        'Microwave',
        'Cooking basics',
        'Pots and pans, oil, salt and pepper',
        'Dishes and silverware',
        'Bowls, chopsticks, plates, cups, etc.',
        'Freezer',
        'Electric stove',
        'Oven',
        'Hot water kettle',
        'Coffee maker: Keurig coffee machine',
        'Wine glasses',
        'Toaster',
        'Baking sheet',
        'Barbecue utensils',
        'Dining table',
      ],
    },
    {
      category: 'Location Features',
      amenities: ['Waterfront – Right next to a body of water', 'Beach access – Beachfront', 'Lake access', 'Private entrance'],
    },
    {
      category: 'Outdoor',
      amenities: ['Patio or balcony', 'Fire pit', 'Outdoor furniture', 'BBQ grill'],
    },
    {
      category: 'Parking and Facilities',
      amenities: ['Free parking on premises', 'Free street parking', 'Single level home', 'No stairs in home'],
    },
    {
      category: 'Services',
      amenities: ['Pets allowed', 'Long-term stays allowed', 'Self check-in with Keypad'],
    },
    {
      category: 'Internet and Office',
      amenities: ['WiFi'],
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
      {/* Main Info */}
      <div className="md:col-span-2">
        {/* Host Info */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image 
              src="/images/profile.avif" 
              alt="Bill And Shauna" 
              width={64} 
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#223318]">Hosted by Bill And Shauna</h3>
            <p className="text-gray-600">Superhost • 5 years hosting</p>
            <p className="text-sm text-gray-500 mt-1">Superhosts are experienced, highly rated hosts.</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
          <div className="flex gap-4">
            <MapPin className="w-6 h-6 text-[#223318] flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[#223318] mb-1">On the lake</h4>
              <p className="text-gray-600 text-sm">This home is right on Molega Lake.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <KeyRound className="w-6 h-6 text-[#223318] flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[#223318] mb-1">24-hour self check-in</h4>
              <p className="text-gray-600 text-sm">Check yourself in with the keypad whenever you arrive.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Home className="w-6 h-6 text-[#223318] flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[#223318] mb-1">Superhost</h4>
              <p className="text-gray-600 text-sm">Superhosts are experienced, highly rated hosts.</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-16 pb-12 border-b">
          <h3 className="text-2xl font-bold text-[#223318] mb-4">About this place</h3>
          <p className="text-gray-700 leading-relaxed">
            This quaint two bedroom, one bath open-concept cottage has that "wow" factor! From custom-made beds to a modern flair, your stay will be unforgettable. A fully stocked kitchen with a large dining table so everyone can gather to enjoy each other's company! Towels and linens provided as well as cozy blankets to snuggle in, and enjoy watching a movie in the peace and quiet. The covered porch and outdoor screen room is an added bonus so, no matter the weather, you can still enjoy the beauty of Molega Lake.
          </p>
        </div>

        {/* Amenities Section */}
        <div>
          <h2 className="text-3xl font-bold text-[#223318] mb-12">What this place offers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {amenityGroups.map((group, idx) => (
              <AmenityGroupCard 
                key={idx} 
                group={group} 
                color={colors[idx % colors.length]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Sidebar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-24">
        {/* Price */}
        <div className="mb-6">
          <span className="text-3xl font-bold text-[#223318]">$249</span>
          <span className="text-gray-600"> / night</span>
        </div>

        {/* Check-in Date */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#223318]"
          />
        </div>

        {/* Check-out Date */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#223318]"
          />
        </div>

        {/* Guest Selector */}
        <div className="mb-6">
          <button
            onClick={() => setShowGuestModal(!showGuestModal)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left font-medium text-gray-700 hover:border-gray-400 transition-colors"
          >
            {totalGuests + guests.infants + guests.pets} guest{totalGuests + guests.infants + guests.pets !== 1 ? 's' : ''}
          </button>

          {/* Guest Modal */}
          {showGuestModal && (
            <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80 mt-2 p-4">
              {/* Adults */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="font-semibold text-gray-700">Adults</p>
                  <p className="text-xs text-gray-500">Age 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuests('adults', -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{String(guests.adults).padStart(2, '0')}</span>
                  <button
                    onClick={() => updateGuests('adults', 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="font-semibold text-gray-700">Children</p>
                  <p className="text-xs text-gray-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuests('children', -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{String(guests.children).padStart(2, '0')}</span>
                  <button
                    onClick={() => updateGuests('children', 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="font-semibold text-gray-700">Infants</p>
                  <p className="text-xs text-gray-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuests('infants', -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{String(guests.infants).padStart(2, '0')}</span>
                  <button
                    onClick={() => updateGuests('infants', 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="font-semibold text-gray-700">Pets</p>
                  <p className="text-xs text-gray-500">Bringing a service animal?</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateGuests('pets', -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{String(guests.pets).padStart(2, '0')}</span>
                  <button
                    onClick={() => updateGuests('pets', 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-600 leading-relaxed">
                This place has a maximum of 5 guests, not including infants. If you're bringing more than 2 pets, please let your Host know.
              </p>
            </div>
          )}
        </div>

        <button className="w-full btn-primary mb-4">Reserve</button>
        <p className="text-sm text-gray-600 text-center mb-4">You won't be charged yet</p>
        
        <div className="space-y-4 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">$249 × 4 nights</span>
            <span className="font-semibold">$996</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span className="font-semibold">$150</span>
          </div>
          <div className="flex justify-between border-t pt-4 font-bold text-lg">
            <span>Total</span>
            <span>$1,146</span>
          </div>
        </div>
      </div>
    </section>
  )
}
