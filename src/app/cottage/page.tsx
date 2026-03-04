import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CottageHero from '@/components/cottage/CottageHero'
import CottageDetails from '@/components/cottage/CottageDetails'
import Testimonials from '@/components/cottage/Testimonials'
import LocationMap from '@/components/cottage/LocationMap'
import About from '@/components/About'
import CottagePolicy from '@/components/cottage/CottagePolicy'

export default function CottagePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <CottageHero />
      <CottageDetails />
      <Testimonials />
      <LocationMap />
      <About />
      <CottagePolicy />
      <Footer />
    </main>
  )
}
