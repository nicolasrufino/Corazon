import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const LABEL_COLOR = 'rgba(247,242,232,0.85)' // pearl, soft on dark

const stats = [
  {
    value: '77%',
    valueColor: '#5a78ff', // sapphire
    label: 'of undocumented immigrants in the U.S. are Latino.',
  },
  {
    value: 'only 9%',
    valueColor: '#b8c94d', // jade
    label: 'of international students in the U.S. come from Latin America.',
  },
  {
    value: '8%',
    valueColor: '#ff8a1f', // amber
    label: 'of U.S. STEM workers are Latino, despite being 19% of the population.',
  },
  {
    value: 'only 4%',
    valueColor: '#ff4560', // coral
    label: 'of Fortune 500 CEOs are Hispanic.',
    emphasis: 'We plan to change that.',
    emphasisColor: '#ff4560',
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
              className="relative p-6 sm:p-8 lg:p-10 flex flex-col justify-center min-h-[220px] sm:min-h-[260px] cursor-default"
            >
              <div className="relative z-10">
                <div
                  className="font-display font-black leading-[0.95] mb-5"
                  style={{
                    color: stat.valueColor,
                    fontSize: 'clamp(3.25rem, 7vw, 5.5rem)',
                  }}
                >
                  {stat.value}
                </div>
                <p
                  className="font-body leading-snug"
                  style={{
                    color: LABEL_COLOR,
                    fontSize: 'clamp(1.05rem, 1.3vw, 1.25rem)',
                  }}
                >
                  {stat.label}
                </p>
                {stat.emphasis && (
                  <p
                    className="font-body leading-snug mt-1.5"
                    style={{
                      color: stat.emphasisColor,
                      fontSize: 'clamp(1.05rem, 1.3vw, 1.25rem)',
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
