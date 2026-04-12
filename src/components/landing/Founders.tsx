import { motion } from 'framer-motion'
import { useLang } from './i18n'

/**
 * Each founder gets a country flag that reveals on hover. Flags are built
 * from CSS gradients so they render crisply at any card size.
 *
 *   - Bolivia: horizontal tricolor red / yellow / green
 *   - Mexico:  vertical tricolor green / white / red
 */
const BOLIVIA_FLAG =
  'linear-gradient(to bottom, #d52b1e 0 33.33%, #f9e300 33.33% 66.66%, #007934 66.66% 100%)'
const MEXICO_FLAG =
  'linear-gradient(to right, #006847 0 33.33%, #ffffff 33.33% 66.66%, #ce1126 66.66% 100%)'

const founders = [
  {
    name: 'Nicolas',
    country: 'Bolivia',
    flag: BOLIVIA_FLAG,
    roleKey: 'founders.nicolas.role',
    bioKey: 'founders.nicolas.bio',
    gradient: 'from-emerald to-aquamarine',
    borderColor: '#0b4a31',
  },
  {
    name: 'Eddie',
    country: 'México',
    flag: MEXICO_FLAG,
    roleKey: 'founders.eddie.role',
    bioKey: 'founders.eddie.bio',
    gradient: 'from-sapphire to-citrine',
    borderColor: '#334ab5',
  },
  {
    name: 'Diego',
    country: 'México',
    flag: MEXICO_FLAG,
    roleKey: 'founders.diego.role',
    bioKey: 'founders.diego.bio',
    gradient: 'from-coral to-amber',
    borderColor: '#f94e4f',
  },
]

export default function Founders() {
  const { t } = useLang()

  return (
    <section
      id="founders"
      className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8"
      aria-label="Meet the founders"
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-block text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: '#34d399' }}
          >
            {t('founders.overline')}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.05,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="font-display font-bold text-pearl"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('founders.heading.pre')}{' '}
            <span style={{ color: '#dc2626' }}>{t('founders.heading.accent')}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, i) => (
            <motion.article
              key={founder.name}
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={{
                rest: { y: 0 },
                hover: { y: -8 },
              }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
                delay: i * 0.12,
              }}
              className="group relative rounded-2xl text-center cursor-default min-h-[360px] overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              aria-label={`${founder.name} — ${founder.country}`}
            >
              {/* Resting card background */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                variants={{
                  rest: { opacity: 1 },
                  hover: { opacity: 0 },
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ background: 'rgba(255,255,255,0.03)' }}
                aria-hidden="true"
              />

              {/* Flag fill — fades in on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                variants={{
                  rest: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: founder.flag }}
                aria-hidden="true"
              />

              {/* Card content — avatar always visible, text fades on hover */}
              <div className="relative z-10 p-8">
                {/* Avatar — drifts to card center and grows on hover */}
                <motion.div
                  className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${founder.gradient} mb-6 flex items-center justify-center text-3xl font-bold text-white/90 select-none font-display ring-2 ring-white/30 ring-offset-2 ring-offset-transparent`}
                  variants={{
                    rest: { y: 0, scale: 1 },
                    hover: { y: 100, scale: 1.5 },
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  aria-hidden="true"
                >
                  {founder.name[0]}
                </motion.div>

                {/* Text block — fades out on hover to reveal the flag */}
                <motion.div
                  variants={{
                    rest: { opacity: 1, y: 0 },
                    hover: { opacity: 0, y: 12 },
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3
                    className="font-display font-bold text-pearl mb-1"
                    style={{ fontSize: 'clamp(1.2rem, 1.5vw, 1.4rem)' }}
                  >
                    {founder.name}
                  </h3>

                  <p className="text-sm tracking-wide mb-4" style={{ color: founder.borderColor }}>
                    {t(founder.roleKey)}
                  </p>

                  <p className="text-pearl/60 text-sm leading-relaxed">{t(founder.bioKey)}</p>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
