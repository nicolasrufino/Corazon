import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import OrnateHeart from '@/components/landing/OrnateHeart'
import { useAppContext } from '@/context/AppContext'

/**
 * Shared Corazón navbar used across auth, onboarding, and the authenticated
 * app. Mirrors the landing-page navbar visually, but pulls its language state
 * from AppContext and changes its behavior based on whether a user is signed
 * in (logo destination, Join vs. Sign out).
 */
export default function AppNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { language, setLanguage, user, signOut } = useAppContext()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const lang: 'EN' | 'ES' = language === 'es' ? 'ES' : 'EN'
  const toggleLang = () => setLanguage(language === 'es' ? 'en' : 'es')

  // When signed in, the logo returns to the authenticated dashboard. When
  // signed out, it returns to the public landing page.
  const logoHref = user?.onboardingCompleted ? '/' : '/landing'

  const handlePrimary = () => {
    setMobileOpen(false)
    if (user?.onboardingCompleted) {
      signOut()
      navigate('/landing')
    } else {
      navigate('/auth')
    }
  }

  const primaryLabel = user?.onboardingCompleted
    ? lang === 'ES'
      ? 'Salir'
      : 'Sign out'
    : lang === 'ES'
      ? 'Únete'
      : 'Join'

  const primaryAria = user?.onboardingCompleted
    ? lang === 'ES'
      ? 'Cerrar sesión'
      : 'Sign out'
    : lang === 'ES'
      ? 'Únete a Corazón'
      : 'Join Corazon'

  const navLinks = user?.onboardingCompleted
    ? [
        { en: 'Resources', es: 'Recursos', href: '/' },
        { en: 'Community', es: 'Comunidad', href: '/community' },
        { en: 'Analyzer', es: 'Analizador', href: '/analyzer' },
      ]
    : [
        { en: 'About', es: 'Nosotros', href: '/landing#about' },
        { en: 'FAQ', es: 'Preguntas', href: '/landing#faq' },
        { en: 'The Team', es: 'El Equipo', href: '/landing#founders' },
      ]

  const PrimaryButton = ({ large = false }: { large?: boolean }) => (
    <motion.button
      onClick={handlePrimary}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative rounded-full font-body font-semibold tracking-wide text-white cursor-pointer ${
        large ? 'px-7 py-3 text-base' : 'px-5 py-2 text-sm'
      }`}
      style={{ background: 'var(--cta)' }}
      aria-label={primaryAria}
    >
      <span className="relative z-10">{primaryLabel}</span>
    </motion.button>
  )

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between h-16 sm:h-18">
          <Link
            to={logoHref}
            className="flex items-center text-white hover:opacity-80 transition-opacity"
            style={{
              fontFamily: 'var(--font-brand)',
              fontWeight: 400,
              fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
              letterSpacing: '-0.01em',
            }}
            aria-label={lang === 'ES' ? 'Inicio de Corazón' : 'Corazon home'}
          >
            c
            <OrnateHeart
              size="0.85em"
              color="#dc2626"
              style={{ margin: '0 0.04em', transform: 'translateY(0.02em)' }}
            />
            razon
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {lang === 'ES' ? link.es : link.en}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#dc2626] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="relative flex items-center h-8 w-16 rounded-full bg-white/10 border border-white/10 transition-colors hover:bg-white/15 cursor-pointer"
              aria-label={lang === 'EN' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés'}
            >
              <motion.div
                className="absolute top-0.5 h-7 w-8 rounded-full"
                style={{ background: '#0b4a31' }}
                animate={{ left: lang === 'EN' ? 1 : 29 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
              <span
                className={`relative z-10 flex-1 text-center text-xs font-medium ${
                  lang === 'EN' ? 'text-white' : 'text-white/60'
                }`}
              >
                EN
              </span>
              <span
                className={`relative z-10 flex-1 text-center text-xs font-medium ${
                  lang === 'ES' ? 'text-white' : 'text-white/60'
                }`}
              >
                ES
              </span>
            </button>

            <PrimaryButton />
          </div>

          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <motion.span
              className="block w-6 h-[2px] bg-white rounded-full"
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
            <motion.span
              className="block w-6 h-[2px] bg-white rounded-full"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block w-6 h-[2px] bg-white rounded-full"
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-72 backdrop-blur-xl border-l border-white/10 md:hidden flex flex-col pt-24 px-8"
              style={{ background: 'rgba(0,0,0,0.95)' }}
            >
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.05,
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="text-white text-lg tracking-wide hover:text-[#dc2626] transition-colors"
                  >
                    {lang === 'ES' ? link.es : link.en}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-10">
                <button
                  onClick={toggleLang}
                  className="relative flex items-center h-9 w-20 rounded-full bg-white/10 border border-white/10 cursor-pointer"
                  aria-label={
                    lang === 'EN' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés'
                  }
                >
                  <motion.div
                    className="absolute top-0.5 h-8 w-10 rounded-full"
                    style={{ background: '#0b4a31' }}
                    animate={{ left: lang === 'EN' ? 1 : 37 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                  <span
                    className={`relative z-10 flex-1 text-center text-sm ${
                      lang === 'EN' ? 'text-white font-medium' : 'text-white/60'
                    }`}
                  >
                    EN
                  </span>
                  <span
                    className={`relative z-10 flex-1 text-center text-sm ${
                      lang === 'ES' ? 'text-white font-medium' : 'text-white/60'
                    }`}
                  >
                    ES
                  </span>
                </button>
              </div>

              <div className="mt-8">
                <PrimaryButton large />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
