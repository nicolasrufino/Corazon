import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const stats = [
  {
    value: '12%',
    valueColor: '#334ab5', // sapphire
    label: 'of the population in MA',
    labelColor: '#0b4a31', // emerald
  },
  {
    value: '1.1 Million',
    valueColor: '#808f3d', // jade
    label: 'strong in MA by 2035',
    labelColor: '#0b4a31',
  },
  {
    value: '35%',
    valueColor: '#ff6c00', // amber
    label: 'of the USA workforce will be Latinx by 2030',
    labelColor: '#0b4a31',
  },
  {
    value: 'only 1.6%',
    valueColor: '#f94e4f', // coral
    label: 'of senior executives are Hispanic/Latina women.',
    labelColor: '#0b4a31',
    emphasis: 'We plan to change that.',
    emphasisColor: '#f94e4f',
  },
]

export default function Stats() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Fade in as it enters, fade out as it leaves
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60])

  return (
    <section
      ref={ref}
      id="stats"
      className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8"
      aria-label="Impact by the numbers"
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      <motion.div style={{ opacity, y }} className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-block text-coral text-sm tracking-[0.2em] uppercase mb-4"
          >
            By the Numbers
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 200, damping: 20 }}
            className="font-display font-bold text-pearl"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Our Community, <span className="text-amber">In Numbers</span>
          </motion.h2>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 22,
                delay: i * 0.1,
              }}
              whileHover={{
                y: -6,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              className="group relative rounded-3xl p-10 sm:p-12 lg:p-14 flex flex-col justify-center min-h-[240px] sm:min-h-[280px] cursor-default overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #faf8f2 0%, #f7f2e8 50%, #efe8d6 100%)',
                boxShadow:
                  '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {/* Subtle radial glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${stat.valueColor}15 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div
                  className="font-display font-black leading-none mb-4"
                  style={{
                    color: stat.valueColor,
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                  }}
                >
                  {stat.value}
                </div>
                <p
                  className="font-body font-semibold leading-snug"
                  style={{
                    color: stat.labelColor,
                    fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)',
                  }}
                >
                  {stat.label}
                </p>
                {stat.emphasis && (
                  <p
                    className="font-body font-semibold leading-snug mt-1"
                    style={{
                      color: stat.emphasisColor,
                      fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)',
                    }}
                  >
                    {stat.emphasis}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
