import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import OrnateHeart from './OrnateHeart'

type Letter = { type: 'char'; char: string; color: string } | { type: 'heart'; color: string }

const letters: Letter[] = [
  { type: 'char', char: 'C', color: '#0b4a31' },
  { type: 'heart', color: '#f94e4f' },
  { type: 'char', char: 'R', color: '#334ab5' },
  { type: 'char', char: 'A', color: '#ff6c00' },
  { type: 'char', char: 'Z', color: '#ffab0d' },
  { type: 'char', char: 'O', color: '#70b0a6' },
  { type: 'char', char: 'N', color: '#808f3d' },
]

const glowOrbs = [
  { color: '#0b4a31', x: '15%', y: '30%', size: 320 },
  { color: '#334ab5', x: '70%', y: '25%', size: 280 },
  { color: '#f94e4f', x: '40%', y: '55%', size: 240 },
  { color: '#ff6c00', x: '80%', y: '60%', size: 200 },
  { color: '#70b0a6', x: '25%', y: '70%', size: 260 },
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
      {/* Floating glow orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {glowOrbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}30 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </div>

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
              fontWeight: 900,
              fontSize: 'clamp(4rem, 13vw, 11rem)',
              letterSpacing: '-0.045em',
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
                style={{
                  color: letter.color,
                  textShadow: `0 0 60px ${letter.color}40, 0 0 120px ${letter.color}20`,
                }}
              >
                {letter.type === 'heart' ? (
                  <OrnateHeart
                    size="0.85em"
                    color={letter.color}
                    style={{
                      filter: `drop-shadow(0 0 60px ${letter.color}66) drop-shadow(0 0 120px ${letter.color}33)`,
                      margin: '0 0.04em',
                    }}
                  />
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
