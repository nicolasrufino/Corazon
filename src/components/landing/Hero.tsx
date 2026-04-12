import { useRef, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import OrnateHeart from './OrnateHeart'
import { useLang } from './i18n'

type Letter = { type: 'char'; char: string; color: string } | { type: 'heart'; color: string }

const letters: Letter[] = [
  { type: 'char', char: 'c', color: '#ff8100' },
  { type: 'heart', color: '#dc2626' },
  { type: 'char', char: 'r', color: '#00aa63' },
  { type: 'char', char: 'a', color: '#1777d7' },
  { type: 'char', char: 'z', color: '#ffd300' },
  { type: 'char', char: 'o', color: '#ffb5e2' },
  { type: 'char', char: 'n', color: '#f82d1a' },
]

export default function Hero() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92])

  // Spotlight cursor reveal — image lives at public/hero-mosaic.png.
  // We track the cursor in motion values, smooth them with a spring, then
  // derive a CSS mask string that opens a soft circle around the cursor.
  // Off-screen default (-1000) keeps the image fully hidden until hover.
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)
  const springConfig = { stiffness: 220, damping: 28, mass: 0.5 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)
  const maskImage = useTransform(
    [springX, springY],
    ([x, y]: number[]) =>
      `radial-gradient(circle 55px at ${x}px ${y}px, #000 38%, rgba(0,0,0,0.6) 70%, transparent 100%)`
  )

  const handleMove = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(event.clientX - rect.left)
    mouseY.set(event.clientY - rect.top)
  }

  const handleLeave = () => {
    mouseX.set(-1000)
    mouseY.set(-1000)
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Spotlight reveal layer — drops the mosaic at public/hero-mosaic.png */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/hero-mosaic.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />

      {/* Bottom fade — gradients the spotlight image down into the page bg
         so it never hard-cuts at the section boundary as the user scrolls */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(5,6,8,0.6) 55%, #050608 100%)',
        }}
      />

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
          {t('hero.subtitle')}
        </motion.p>
      </motion.div>
    </section>
  )
}
