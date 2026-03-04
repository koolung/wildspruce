'use client'

import { Wifi, Mountain, Users, Flame, Utensils, TreePine } from 'lucide-react'

interface ServiceCard {
  icon: React.ElementType
  title: string
  description: string
}

export default function Services() {
  const services: ServiceCard[] = [
    {
      icon: Wifi,
      title: 'High-Speed WiFi',
      description: 'Stay connected with reliable high-speed internet throughout the cabin.',
    },
    {
      icon: Mountain,
      title: 'Hiking & Trail Walking',
      description: 'Access to scenic trails and hiking routes right at your doorstep.',
    },
    {
      icon: Utensils,
      title: 'Kayaking & Water Activities',
      description: 'Paddle on pristine lakes and enjoy water sports near your accommodation.',
    },
    {
      icon: Flame,
      title: 'Cozy Fireplaces',
      description: 'Warm fireplaces in living areas for a perfect cozy night in.',
    },
    {
      icon: TreePine,
      title: 'Nature Exploration',
      description: 'Fully immerse yourself in beautiful natural surroundings and wildlife.',
    },
    {
      icon: Users,
      title: 'Family-Friendly',
      description: 'Perfect spaces for families and groups to gather and create memories.',
    },
  ]

  return (
    <section id="services" className="w-full py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Amenities & Activities</h2>
          <p className="section-subtitle">
            Everything you need for the perfect cabin getaway
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-4">
                  <Icon className="w-12 h-12 text-[#223318]" />
                </div>
                <h3 className="text-xl font-bold text-[#223318] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
