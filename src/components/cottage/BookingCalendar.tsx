'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface UnavailableDate {
  date: string
  reason?: string
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch unavailable dates on mount
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoading(true)
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

        if (!response.ok) {
          throw new Error('Failed to fetch availability')
        }

        const data = await response.json()
        const dates = new Set<string>()

        if (data.unavailableDates && Array.isArray(data.unavailableDates)) {
          data.unavailableDates.forEach((dateStr: string) => {
            dates.add(dateStr)
          })
        }

        setUnavailableDates(dates)
        setError('')
      } catch (err) {
        console.error('Error fetching availability:', err)
        setError('Could not load availability calendar')
      } finally {
        setLoading(false)
      }
    }

    fetchUnavailableDates()
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const dateToString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.has(dateToString(date))
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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

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
        setSelectedEnd(clickedDate)
      }
    } else {
      setSelectedStart(clickedDate)
      setSelectedEnd(null)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedStart || !selectedEnd) {
      alert('Please select both check-in and check-out dates')
      return
    }

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      start_date: dateToString(selectedStart),
      end_date: dateToString(selectedEnd),
      guests: parseInt(formData.get('guests') as string, 10),
      notes: formData.get('notes') || '',
    }

    try {
      const response = await fetch('/api/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Booking failed')
      }

      const data = await response.json()
      alert(`Booking confirmed! Confirmation sent to ${body.email}`)
      
      // Reset form
      ;(e.target as HTMLFormElement).reset()
      setSelectedStart(null)
      setSelectedEnd(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking failed'
      alert(`Error: ${message}`)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  if (loading) {
    return (
      <section className="w-full bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading availability calendar...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#223318] mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Book Your Stay
          </h2>
          <p className="text-gray-600">Select your check-in and check-out dates. Gray dates are unavailable.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 text-[#223318]" />
                </button>
                <h3 className="text-lg font-semibold text-[#223318]">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  aria-label="Next month"
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
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const isUnavailable = isDateUnavailable(date)
                  const inRange = isDateInRange(date)
                  const isStart = isStartDate(date)
                  const isEnd = isEndDate(date)

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      disabled={isUnavailable}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-sm font-medium
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

              {/* Legend */}
              <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#223318] rounded" />
                  <span className="text-gray-700">Selected dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#e8f0e0] rounded border border-[#223318]" />
                  <span className="text-gray-700">In range</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded" />
                  <span className="text-gray-700">Unavailable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#223318]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#223318]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="555-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#223318]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
                <select
                  name="guests"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#223318]"
                >
                  <option value="">Select guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  name="notes"
                  placeholder="Any special requests or questions?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#223318]"
                />
              </div>

              {selectedStart && selectedEnd && (
                <div className="bg-[#e8f0e0] border border-[#223318] rounded-lg p-3">
                  <p className="text-sm font-medium text-[#223318]">
                    Check-in: {selectedStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm font-medium text-[#223318]">
                    Check-out: {selectedEnd.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-[#223318] mt-1">
                    {Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24))} night
                    {Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedStart || !selectedEnd}
                className={`
                  w-full py-3 rounded-lg font-semibold transition-colors
                  ${selectedStart && selectedEnd
                    ? 'bg-[#223318] text-white hover:bg-[#1a2610]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Request Booking
              </button>

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
