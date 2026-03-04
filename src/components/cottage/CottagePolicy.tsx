'use client'

import { AlertCircle, Shield, FileText } from 'lucide-react'

export default function CottagePolicy() {
  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cancellation Policy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-[#223318]" />
              <h3 className="text-xl font-bold text-[#223318]">Cancellation Policy</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Free cancellation before April 1. Cancel before April 24 for a partial refund.
            </p>
            <button className="text-[#223318] font-semibold hover:underline">
              Review this host's full policy for details →
            </button>
          </div>

          {/* House Rules */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-[#223318]" />
              <h3 className="text-xl font-bold text-[#223318]">House Rules</h3>
            </div>
            <ul className="text-gray-700 space-y-2 mb-4">
              <li>• Check-in after 3:00 p.m.</li>
              <li>• Checkout before 11:00 a.m.</li>
              <li>• 5 guests maximum</li>
            </ul>
            <button className="text-[#223318] font-semibold hover:underline">
              Learn more →
            </button>
          </div>

          {/* Safety & Property */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[#223318]" />
              <h3 className="text-xl font-bold text-[#223318]">Safety & Property</h3>
            </div>
            <ul className="text-gray-700 space-y-2 mb-4">
              <li>✓ Exterior security cameras on property</li>
              <li>✓ Carbon monoxide alarm</li>
              <li>✓ Smoke alarm</li>
            </ul>
            <button className="text-[#223318] font-semibold hover:underline">
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
