'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { MapPin, KeyRound, Home, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Minus, X, Calendar as CalendarIcon } from 'lucide-react'

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
  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null)

  // Date and guest state
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 3, 1))
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  })
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waiverAgreed, setWaiverAgreed] = useState(false)
  const [showWaiverModal, setShowWaiverModal] = useState(false)

  // Fetch unavailable dates when calendar opens (only once)
  useEffect(() => {
    if (showCalendar && unavailableDates.size === 0) {
      const fetchUnavailableDates = async () => {
        try {
          setCalendarLoading(true)
          const startOfYear = new Date(2026, 0, 1)
          const endOfYear = new Date(2026, 11, 31)

          const resStart = startOfYear.toISOString().split('T')[0]
          const resEnd = endOfYear.toISOString().split('T')[0]

          const response = await fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start_date: resStart,
              end_date: resEnd,
            }),
          })

          if (!response.ok) throw new Error('Failed to fetch availability')

          const data = await response.json()
          const dates = new Set<string>()

          if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
            data.unavailableDates.forEach((dateStr: string) => {
              dates.add(dateStr)
            })
            console.log('Loaded unavailable dates:', Array.from(dates))
          }

          setUnavailableDates(dates)
        } catch (err) {
          console.error('Error fetching availability:', err)
        } finally {
          setCalendarLoading(false)
        }
      }

      fetchUnavailableDates()
    }
  }, [showCalendar])

  // Calendar helper functions
  const dateToString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateUnavailable = (date: Date) => {
    const dateStr = dateToString(date)
    const isUnavailable = unavailableDates.has(dateStr)
    // Uncomment for debugging:
    // if (isUnavailable) console.log('Unavailable date found:', dateStr)
    return isUnavailable
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !selectedEnd) return false
    const [start, end] = selectedStart <= selectedEnd ? [selectedStart, selectedEnd] : [selectedEnd, selectedStart]
    return date >= start && date <= end
  }

  const isStartDate = (date: Date) => {
    if (!selectedStart) return false
    return dateToString(date) === dateToString(selectedStart)
  }

  const isEndDate = (date: Date) => {
    if (!selectedEnd) return false
    return dateToString(date) === dateToString(selectedEnd)
  }

  const handleCalendarDateClick = (day: number) => {
    const clickedDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day)

    if (isDateUnavailable(clickedDate)) {
      return
    }

    if (!selectedStart) {
      setSelectedStart(clickedDate)
      setSelectedEnd(null)
    } else if (!selectedEnd) {
      if (clickedDate < selectedStart) {
        setSelectedStart(clickedDate)
        setSelectedEnd(null)
      } else {
        // Check if there are any blocked dates between selectedStart and clickedDate
        let hasBlockedDatesInRange = false
        const checkDate = new Date(selectedStart)
        while (checkDate < clickedDate) {
          if (isDateUnavailable(checkDate)) {
            hasBlockedDatesInRange = true
            break
          }
          checkDate.setDate(checkDate.getDate() + 1)
        }

        if (hasBlockedDatesInRange) {
          alert('There are blocked dates within your selected range. Please choose different dates.')
          return
        }

        setSelectedEnd(clickedDate)
      }
    } else {
      setSelectedStart(clickedDate)
      setSelectedEnd(null)
    }
  }

  const confirmDateSelection = () => {
    if (selectedStart && selectedEnd) {
      setCheckInDate(dateToString(selectedStart))
      setCheckOutDate(dateToString(selectedEnd))
      setShowCalendar(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1))
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const totalGuests = guests.adults + guests.children
  const maxGuests = 5

  // Calculate nights and pricing (using Halifax timezone)
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    // Parse dates as local Halifax time (not UTC)
    const [startYear, startMonth, startDay] = checkInDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = checkOutDate.split('-').map(Number)
    const start = new Date(startYear, startMonth - 1, startDay)
    const end = new Date(endYear, endMonth - 1, endDay)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, nights)
  }

  const nights = calculateNights()
  const nightly_rate = 249
  const servicefee = 25
  const totalPrice = nights > 0 ? nights * nightly_rate + servicefee : 0

  const handleReserveClick = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select dates')
      return
    }
    if (!guestName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!guestEmail.trim()) {
      alert('Please enter your email')
      return
    }
    if (!guestPhone.trim()) {
      alert('Please enter your phone number')
      return
    }
    if (!waiverAgreed) {
      alert('Please agree to the waiver to proceed')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          start_date: checkInDate,
          end_date: checkOutDate,
          guests: totalGuests,
          notes: `Pets: ${guests.pets}, Infants: ${guests.infants}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Booking failed: ${error.error || 'Unknown error'}`)
        return
      }

      alert('Booking created successfully! Check your email for confirmation.')
      setCheckInDate('')
      setCheckOutDate('')
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
    } catch (err) {
      console.error('Error creating booking:', err)
      alert('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              alt="Bill and Shauna" 
              width={64} 
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#223318]">Hosted by Bill and Shauna</h3>
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
          
          <div className="relative">
            {/* Navigation Buttons - Mobile Only */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Previous amenities"
            >
              <ChevronLeft className="w-6 h-6 text-[#223318]" />
            </button>
            
            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 gap-4 md:gap-8 scroll-smooth"
            >
              {amenityGroups.map((group, idx) => (
                <div key={idx} className="flex-shrink-0 w-full md:w-auto md:flex-shrink snap-center">
                  <AmenityGroupCard 
                    group={group} 
                    color={colors[idx % colors.length]}
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Next amenities"
            >
              <ChevronRight className="w-6 h-6 text-[#223318]" />
            </button>
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

        {/* Select Dates */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dates</label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center gap-2 hover:border-[#223318] transition-colors bg-white"
          >
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className={checkInDate && checkOutDate ? 'text-gray-700 font-medium' : 'text-gray-500'}>
              {checkInDate && checkOutDate ? `${checkInDate} - ${checkOutDate}` : 'Select date'}
            </span>
          </button>
        </div>

        {/* Guest Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#223318]"
          />
        </div>

        {/* Guest Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#223318]"
          />
        </div>

        {/* Guest Phone */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#223318]"
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

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-2 p-4 w-96 md:top-0">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h3 className="text-lg font-semibold text-[#223318]">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </h3>
              <button
                onClick={() => {
                  setShowCalendar(false)
                  setSelectedStart(null)
                  setSelectedEnd(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#223318]" />
              </button>
              <h4 className="font-semibold text-gray-700"></h4>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#223318]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: getDaysInMonth(currentCalendarDate) + getFirstDayOfMonth(currentCalendarDate) }).map((_, index) => {
                const day = index >= getFirstDayOfMonth(currentCalendarDate) ? index - getFirstDayOfMonth(currentCalendarDate) + 1 : null

                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day)
                const isUnavailable = isDateUnavailable(date)
                const inRange = isDateInRange(date)
                const isStart = isStartDate(date)
                const isEnd = isEndDate(date)

                return (
                  <button
                    key={day}
                    onClick={() => handleCalendarDateClick(day)}
                    disabled={isUnavailable}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                      transition-all duration-200
                      ${isUnavailable
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isStart || isEnd
                          ? 'bg-[#223318] text-white font-bold'
                          : inRange
                            ? 'bg-[#e8f0e0] text-[#223318]'
                            : 'bg-white text-[#223318] hover:bg-[#f0f5eb] border border-gray-200'
                      }
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Selected dates info */}
            {selectedStart && selectedEnd && (
              <div className="bg-[#e8f0e0] border border-[#223318] rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-[#223318]">
                  {selectedStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {selectedEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-[#223318] mt-1">
                  {Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24))} night(s)
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCalendar(false)
                  setSelectedStart(null)
                  setSelectedEnd(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDateSelection}
                disabled={!selectedStart || !selectedEnd}
                className={`
                  flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-sm
                  ${selectedStart && selectedEnd
                    ? 'bg-[#223318] text-white hover:bg-[#1a2610]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
        
        {/* Waiver Checkbox */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="waiver"
            checked={waiverAgreed}
            onChange={(e) => setWaiverAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 cursor-pointer accent-[#223318]"
          />
          <label htmlFor="waiver" className="flex-1 cursor-pointer">
            <span className="text-sm text-gray-700">I have read and agree to the </span>
            <button
              onClick={() => setShowWaiverModal(true)}
              className="text-sm font-semibold text-[#223318] hover:underline inline"
            >
              Liability Waiver
            </button>
          </label>
        </div>

        <button 
          onClick={handleReserveClick}
          disabled={isSubmitting || !checkInDate || !checkOutDate || !waiverAgreed}
          className="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating booking...' : 'Reserve'}
        </button>
        
        <div className="space-y-4 text-sm border-t pt-4">
          {nights > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">${nightly_rate} × {nights} night{nights !== 1 ? 's' : ''}</span>
              <span className="font-semibold">${(nights * nightly_rate).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span className="font-semibold">${servicefee}</span>
          </div>
          {nights > 0 && (
            <div className="flex justify-between border-t pt-4 font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Waiver Modal */}
        {showWaiverModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-[#223318]">Liability Waiver</h2>
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 text-gray-700 text-sm leading-relaxed space-y-4">
                <section>
                  <h3 className="font-bold text-[#223318] mb-2">ASSUMPTION OF RISK & LIABILITY WAIVER</h3>
                  <p>
                    PLEASE READ THIS AGREEMENT CAREFULLY. BY MAKING A RESERVATION AND ARRIVING AT THE PROPERTY, 
                    YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS WAIVER AND VOLUNTARILY AGREE TO ITS TERMS.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">1. ACKNOWLEDGMENT OF RISKS</h3>
                  <p>
                    The guest acknowledges that use of the property and participation in any activities involve inherent risks, 
                    including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Water-related activities (swimming, boating, etc.)</li>
                    <li>Natural hazards on the property (uneven terrain, wildlife, water bodies)</li>
                    <li>Outdoor activities and recreational facilities</li>
                    <li>Use of hot tubs, saunas, or other amenities</li>
                    <li>Fire pit and outdoor heating equipment</li>
                    <li>Weather-related hazards</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">2. ASSUMPTION OF RISK</h3>
                  <p>
                    The guest voluntarily assumes all risks associated with their stay at the property and use of all 
                    amenities and facilities. The host is not responsible for any injuries, accidents, or damages that may 
                    occur during the guest's stay to the extent permitted by law.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">3. RELEASE OF LIABILITY</h3>
                  <p>
                    In consideration for being permitted to stay at the property, the guest hereby releases, waives, and 
                    discharges the host, property owner, manager, and their respective agents, employees, and representatives 
                    from any and all claims, demands, or causes of action arising from:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Personal injury or property damage</li>
                    <li>Illness or death</li>
                    <li>Loss of personal items or belongings</li>
                    <li>Accidents, falls, or other incidents on the property</li>
                    <li>Allergic reactions or health complications</li>
                    <li>Any negligence (except gross negligence)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">4. RULES & SAFETY</h3>
                  <p>
                    The guest agrees to follow all posted safety guidelines, rules, and instructions provided by the host. 
                    The guest assumes full responsibility for their own safety and the safety of anyone in their party.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">5. COMMUNICATION OF RISKS</h3>
                  <p>
                    The guest acknowledges that the host has disclosed all known hazards and risks associated with the 
                    property. If the guest is uncertain about any risk, they are responsible for asking the host before 
                    engaging in any activity.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">6. MEDICAL EMERGENCIES</h3>
                  <p>
                    In the event of a medical emergency, the guest authorizes the host to contact emergency services. The 
                    guest is responsible for all medical expenses incurred.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">7. INSURANCE</h3>
                  <p>
                    The guest is strongly encouraged to obtain travel and health insurance. The host recommends that all 
                    guests have adequate personal insurance coverage.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">8. RESTRICTIONS</h3>
                  <p>
                    This waiver does not exempt the host from liability for gross negligence, willful misconduct, or 
                    violations of applicable law. This waiver is binding on the guest's heirs, estate, and personal representatives.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-[#223318] mb-2">ACKNOWLEDGMENT</h3>
                  <p className="font-semibold">
                    I have read this agreement carefully, understand its terms, and voluntarily assume all risks associated 
                    with my stay at the property.
                  </p>
                </section>
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setWaiverAgreed(true)
                    setShowWaiverModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-[#223318] text-white rounded-lg hover:bg-[#1a2610] transition-colors font-medium"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
