import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import OrnateHeart from './OrnateHeart'

type Letter = { type: 'char'; char: string; color: string } | { type: 'heart'; color: string }

const letters: Letter[] = [
  { type: 'char', char: 'c', color: '#0b4a31' },
  { type: 'heart', color: '#ff2e50' },
  { type: 'char', char: 'r', color: '#334ab5' },
  { type: 'char', char: 'a', color: '#ff6c00' },
  { type: 'char', char: 'z', color: '#ffab0d' },
  { type: 'char', char: 'o', color: '#70b0a6' },
  { type: 'char', char: 'n', color: '#808f3d' },
]

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Content with parallax */}
      <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-4">
        {/* Title */}
        <h1 className="leading-none select-none">
          <span className="sr-only">Corazon</span>
          <span
            aria-hidden="true"
            className="flex items-center justify-center gap-[0.02em]"
            style={{
              fontFamily: 'var(--font-brand)',
              fontWeight: 400,
              fontSize: 'clamp(4rem, 13vw, 11rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.15 + i * 0.1,
                }}
                className="inline-flex items-center"
                style={{ color: letter.color }}
              >
                {letter.type === 'heart' ? (
                  <OrnateHeart size="0.85em" color={letter.color} style={{ margin: '0 0.04em' }} />
                ) : (
                  letter.char
                )}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 1.1,
          }}
          className="mt-6 sm:mt-8 text-pearl/90 tracking-wide font-body"
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
          }}
        >
          For Latinos, by Latinos.
        </motion.p>

        {/* Subtle scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-16 sm:mt-24 flex flex-col items-center gap-2"
        >
          <span className="text-pearl/40 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const }}
            className="w-5 h-8 rounded-full border-2 border-pearl/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-pearl/40" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #000 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    </section>
  )
}
