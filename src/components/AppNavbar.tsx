import { User as UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import OrnateHeart from '@/components/landing/OrnateHeart'
import { useAppContext } from '@/context/AppContext'

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
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const lang: 'EN' | 'ES' = language === 'es' ? 'ES' : 'EN'
  const toggleLang = () => setLanguage(language === 'es' ? 'en' : 'es')

  const isAuthenticated = !!user?.onboardingCompleted
  const logoHref = isAuthenticated ? '/dashboard' : '/'

  // Nav links: only shown when fully authenticated (not during onboarding)
  const navLinks = isAuthenticated
    ? [
        { en: 'Resources', es: 'Recursos', href: '/dashboard' },
        { en: 'Community', es: 'Comunidad', href: '/community' },
        { en: 'Discover', es: 'Descubre', href: '/discovery' },
        { en: 'Analyzer', es: 'Analizador', href: '/analyzer' },
      ]
    : []

  const handleSignOut = async () => {
    setMobileOpen(false)
    await signOut()
    navigate('/')
  }

  const handleJoin = () => {
    setMobileOpen(false)
    navigate('/auth')
  }

  // Profile avatar circle — shown when user exists (authenticated or onboarding)
  const ProfileAvatar = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => (
    <button
      onClick={() => {
        setMobileOpen(false)
        navigate('/profile')
      }}
      className={`flex items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20 cursor-pointer ${
        size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
      }`}
      aria-label={lang === 'ES' ? 'Mi perfil' : 'My profile'}
    >
      <UserIcon className={size === 'lg' ? 'size-5' : 'size-4'} />
    </button>
  )

  // Language toggle
  const LangToggle = ({ wide = false }: { wide?: boolean }) => (
    <button
      onClick={toggleLang}
      className={`relative flex items-center rounded-full bg-white/10 border border-white/10 transition-colors hover:bg-white/15 cursor-pointer ${
        wide ? 'h-9 w-20' : 'h-8 w-16'
      }`}
      aria-label={lang === 'EN' ? 'Switch language to Spanish' : 'Cambiar idioma a inglés'}
    >
      <motion.div
        className={`absolute top-0.5 rounded-full ${wide ? 'h-8 w-10' : 'h-7 w-8'}`}
        style={{ background: '#0b4a31' }}
        animate={{ left: lang === 'EN' ? 1 : wide ? 37 : 29 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <span
        className={`relative z-10 flex-1 text-center font-medium ${wide ? 'text-sm' : 'text-xs'} ${
          lang === 'EN' ? 'text-white' : 'text-white/60'
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-10 flex-1 text-center font-medium ${wide ? 'text-sm' : 'text-xs'} ${
          lang === 'ES' ? 'text-white' : 'text-white/60'
        }`}
      >
        ES
      </span>
    </button>
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
          {/* Logo */}
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

          {/* Desktop center links — hidden during onboarding */}
          {navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group relative text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
                >
                  {lang === 'ES' ? link.es : link.en}
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-[#dc2626] transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              ))}
            </div>
          )}

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            <LangToggle />

            {user ? (
              <>
                <NotificationDropdown />
                <ProfileAvatar />
              </>
            ) : (
              <motion.button
                onClick={handleJoin}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative rounded-full font-body font-semibold tracking-wide text-white cursor-pointer px-5 py-2 text-sm"
                style={{ background: 'var(--cta)' }}
                aria-label={lang === 'ES' ? 'Únete a Corazón' : 'Join Corazon'}
              >
                <span className="relative z-10">{lang === 'ES' ? 'Únete' : 'Join'}</span>
              </motion.button>
            )}
          </div>

          {/* Mobile hamburger */}
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

      {/* Mobile drawer */}
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
              {/* Mobile nav links — hidden during onboarding */}
              {navLinks.length > 0 && (
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + i * 0.05,
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-white text-lg tracking-wide hover:text-[#dc2626] transition-colors"
                      >
                        {lang === 'ES' ? link.es : link.en}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              )}

              <div className={navLinks.length > 0 ? 'mt-10' : 'mt-0'}>
                <LangToggle wide />
              </div>

              <div className="mt-8 flex items-center gap-4">
                {user ? (
                  <>
                    <ProfileAvatar size="lg" />
                    <button
                      onClick={handleSignOut}
                      className="cursor-pointer text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {lang === 'ES' ? 'Cerrar sesión' : 'Sign out'}
                    </button>
                  </>
                ) : (
                  <motion.button
                    onClick={handleJoin}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="relative rounded-full font-body font-semibold tracking-wide text-white cursor-pointer px-7 py-3 text-base"
                    style={{ background: 'var(--cta)' }}
                  >
                    <span className="relative z-10">{lang === 'ES' ? 'Únete' : 'Join'}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
