'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Cabins from '@/components/Cabins'
import About from '@/components/About'
import Services from '@/components/Services'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Cabins />
      <About />
      <Services />
      <Contact />
      <Footer />
    </main>
  )
}
