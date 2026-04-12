import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OrnateHeart from './OrnateHeart'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Resources', href: '#founders' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<'EN' | 'ES'>('EN')

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

  const JoinButton = ({ large = false }: { large?: boolean }) => (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative overflow-hidden rounded-full font-body font-semibold tracking-wide text-white cursor-pointer ${
        large ? 'px-7 py-3 text-base' : 'px-5 py-2 text-sm'
      }`}
      style={{
        background: 'linear-gradient(135deg, #ff6c8a 0%, #f94e4f 40%, #ff6c00 100%)',
        boxShadow:
          '0 4px 14px rgba(249,78,79,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.25) inset',
      }}
      aria-label="Join Corazon"
    >
      {/* Shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <span className="relative z-10">Join</span>
    </motion.button>
  )

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-xl shadow-lg shadow-black/40' : 'backdrop-blur-md'
        }`}
        style={{
          background: scrolled
            ? 'linear-gradient(180deg, rgba(48,50,58,0.92) 0%, rgba(28,30,36,0.88) 50%, rgba(14,16,20,0.85) 100%)'
            : 'linear-gradient(180deg, rgba(58,60,68,0.75) 0%, rgba(34,36,42,0.65) 50%, rgba(18,20,24,0.55) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center text-white hover:opacity-80 transition-opacity"
            style={{
              fontFamily: 'var(--font-brand)',
              fontWeight: 400,
              fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
              letterSpacing: '-0.01em',
            }}
            aria-label="Corazon home"
          >
            c
            <OrnateHeart
              size="0.85em"
              color="#ff4560"
              style={{ margin: '0 0.04em', transform: 'translateY(0.02em)' }}
            />
            razon
          </a>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-pearl/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-coral transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
              className="relative flex items-center h-8 w-16 rounded-full bg-white/10 border border-white/10 transition-colors hover:bg-white/15 cursor-pointer"
              aria-label={`Switch language to ${lang === 'EN' ? 'Spanish' : 'English'}`}
            >
              <motion.div
                className="absolute top-0.5 h-7 w-8 rounded-full bg-emerald"
                animate={{ left: lang === 'EN' ? 1 : 29 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
              <span
                className={`relative z-10 flex-1 text-center text-xs font-medium ${
                  lang === 'EN' ? 'text-white' : 'text-pearl/60'
                }`}
              >
                EN
              </span>
              <span
                className={`relative z-10 flex-1 text-center text-xs font-medium ${
                  lang === 'ES' ? 'text-white' : 'text-pearl/60'
                }`}
              >
                ES
              </span>
            </button>

            <JoinButton />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <motion.span
              className="block w-6 h-[2px] bg-pearl rounded-full"
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
            <motion.span
              className="block w-6 h-[2px] bg-pearl rounded-full"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block w-6 h-[2px] bg-pearl rounded-full"
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
              style={{
                background:
                  'linear-gradient(180deg, rgba(48,50,58,0.95) 0%, rgba(20,22,28,0.95) 100%)',
              }}
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
                    className="text-pearl text-lg tracking-wide hover:text-coral transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={() => setLang(lang === 'EN' ? 'ES' : 'EN')}
                  className="relative flex items-center h-9 w-20 rounded-full bg-white/10 border border-white/10 cursor-pointer"
                  aria-label={`Switch language to ${lang === 'EN' ? 'Spanish' : 'English'}`}
                >
                  <motion.div
                    className="absolute top-0.5 h-8 w-10 rounded-full bg-emerald"
                    animate={{ left: lang === 'EN' ? 1 : 37 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                  <span
                    className={`relative z-10 flex-1 text-center text-sm ${
                      lang === 'EN' ? 'text-white font-medium' : 'text-pearl/60'
                    }`}
                  >
                    EN
                  </span>
                  <span
                    className={`relative z-10 flex-1 text-center text-sm ${
                      lang === 'ES' ? 'text-white font-medium' : 'text-pearl/60'
                    }`}
                  >
                    ES
                  </span>
                </button>
              </div>

              <div className="mt-8">
                <JoinButton large />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
