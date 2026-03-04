'use client'

import { Check } from 'lucide-react'

interface AmenityGroup {
  category: string
  amenities: string[]
}

export default function CottageAmenities() {
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b">
      <h2 className="text-3xl font-bold text-[#223318] mb-12">What this place offers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {amenityGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xl font-bold text-[#223318] mb-4">{group.category}</h3>
            <ul className="space-y-3">
              {group.amenities.map((amenity, amenityIdx) => (
                <li key={amenityIdx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#223318] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{amenity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
