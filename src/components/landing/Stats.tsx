import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLang } from './i18n'

const LABEL_COLOR = 'rgba(247,242,232,0.85)' // pearl, soft on dark

const statKeys = [
  { valueKey: 'stats.1.value', labelKey: 'stats.1.label', valueColor: '#5a78ff' },
  { valueKey: 'stats.2.value', labelKey: 'stats.2.label', valueColor: '#34d399' },
  { valueKey: 'stats.3.value', labelKey: 'stats.3.label', valueColor: '#ff8a1f' },
  {
    valueKey: 'stats.4.value',
    labelKey: 'stats.4.label',
    valueColor: '#ff4560',
    emphasisKey: 'stats.4.emphasis',
    emphasisColor: '#ff4560',
  },
]

export default function Stats() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

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
          {statKeys.map((stat, i) => (
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
                  {t(stat.valueKey)}
                </div>
                <p
                  className="font-body leading-snug"
                  style={{
                    color: LABEL_COLOR,
                    fontSize: 'clamp(1.05rem, 1.3vw, 1.25rem)',
                  }}
                >
                  {t(stat.labelKey)}
                </p>
                {stat.emphasisKey && (
                  <p
                    className="font-body leading-snug mt-1.5"
                    style={{
                      color: stat.emphasisColor,
                      fontSize: 'clamp(1.05rem, 1.3vw, 1.25rem)',
                    }}
                  >
                    {t(stat.emphasisKey)}
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
