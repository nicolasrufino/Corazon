import { motion } from 'framer-motion'
import OrnateHeart from './OrnateHeart'

const socialLinks = [
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer
      className="relative border-t border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)' }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center sm:text-left"
          >
            <a
              href="#"
              className="inline-flex items-center text-white hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'var(--font-brand)',
                fontWeight: 400,
                fontSize: '1.75rem',
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
            <p className="mt-2 text-pearl/40 text-sm">
              &copy; {new Date().getFullYear()} Coraz&oacute;n. All rights reserved.
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.1,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="flex items-center gap-4"
          >
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/[0.06] text-pearl/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-200"
              >
                {link.icon}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
