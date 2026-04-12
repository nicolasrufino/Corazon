import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import About from '@/components/landing/About'
import Stats from '@/components/landing/Stats'
import FAQ from '@/components/landing/FAQ'
import Founders from '@/components/landing/Founders'
import Footer from '@/components/landing/Footer'
import ScrollFadeSection from '@/components/landing/ScrollFadeSection'
import { LangProvider } from '@/components/landing/i18n'

export function LandingPage() {
  return (
    <LangProvider>
      <div
        className="landing-page text-pearl scroll-smooth relative min-h-screen"
        style={{ background: '#050608' }}
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
    </LangProvider>
  )
}
