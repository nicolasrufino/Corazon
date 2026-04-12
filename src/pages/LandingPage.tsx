import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import About from '@/components/landing/About'
import FAQ from '@/components/landing/FAQ'
import Founders from '@/components/landing/Founders'
import Footer from '@/components/landing/Footer'

export function LandingPage() {
  return (
    <div className="landing-page bg-black text-pearl scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <About />
        <FAQ />
        <Founders />
      </main>
      <Footer />
    </div>
  )
}
