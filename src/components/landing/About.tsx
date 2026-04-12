import { motion } from 'framer-motion'
import { useLang } from './i18n'

export default function About() {
  const { t } = useLang()

  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8"
      aria-label="About us"
    >
      {/* Subtle top gradient divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="mx-auto max-w-[720px]"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-block text-coral text-sm tracking-[0.2em] uppercase mb-4"
        >
          {t('about.overline')}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          className="font-display font-bold text-pearl mb-8"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          {t('about.heading.pre')}{' '}
          <span className="text-aquamarine">{t('about.heading.accent')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-pearl/75 mb-6 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}
        >
          {t('about.p1')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-pearl/75 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}
        >
          {t('about.p2')}
        </motion.p>
      </motion.div>
    </section>
  )
}
