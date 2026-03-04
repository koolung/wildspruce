'use client'

import { MapPin } from 'lucide-react'

export default function LocationMap() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b">
      <div className="flex items-center gap-2 mb-8">
        <MapPin className="w-6 h-6 text-[#223318]" />
        <h2 className="text-3xl font-bold text-[#223318]">Where you'll be</h2>
      </div>

      {/* Google Map */}
      <div className="w-full h-96 rounded-lg overflow-hidden mb-6 shadow-md">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2823.5235926826044!2d-64.47358!3d44.5675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b5a1f5a5a5a5a5b%3A0x5a5a5a5a5a5a5a5a!2sMolega%20Lake%2C%20Nova%20Scotia!5e0!3m2!1sen!2sca!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-[#223318] mb-4">South Brookfield</h3>
          <p className="text-gray-700 mb-4">
            Welcome to Molega Lake, one of Nova Scotia's most beautiful and serene destinations. 
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• Beautiful waterfront access</li>
            <li>• Perfect for kayaking and water activities</li>
            <li>• Scenic hiking trails nearby</li>
            <li>• Local restaurants and shops</li>
            <li>• Peaceful natural surroundings</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#223318] mb-4">Things to do</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Kayaking on Molega Lake</li>
            <li>✓ Hiking and trail walking</li>
            <li>✓ Wildlife watching</li>
            <li>✓ Picnicking by the lake</li>
            <li>✓ Photography and nature exploration</li>
            <li>✓ Fishing (seasonal)</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
