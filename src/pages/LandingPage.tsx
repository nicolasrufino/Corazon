import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import About from '@/components/landing/About'
import Stats from '@/components/landing/Stats'
import FAQ from '@/components/landing/FAQ'
import Founders from '@/components/landing/Founders'
import Footer from '@/components/landing/Footer'
import ScrollFadeSection from '@/components/landing/ScrollFadeSection'

export function LandingPage() {
  return (
    <div
      className="landing-page text-pearl scroll-smooth relative min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #050608 0%, #0a0c12 20%, #0d0f16 40%, #0a0c12 60%, #07090e 80%, #030406 100%)',
      }}
    >
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ScrollFadeSection>
            <About />
          </ScrollFadeSection>
          <ScrollFadeSection>
            <Stats />
          </ScrollFadeSection>
          <ScrollFadeSection>
            <FAQ />
          </ScrollFadeSection>
          <ScrollFadeSection>
            <Founders />
          </ScrollFadeSection>
        </main>
        <Footer />
      </div>
    </div>
  )
}
