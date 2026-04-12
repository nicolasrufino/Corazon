import { motion } from 'framer-motion'

export default function About() {
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
          About Us
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          className="font-display font-bold text-pearl mb-8"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Building Community, <span className="text-aquamarine">Together</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-pearl/75 mb-6 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}
        >
          Coraz&oacute;n was born from a simple truth: our communities are stronger when we&apos;re
          connected. We&apos;re building the digital plaza where Latino voices, stories, and
          resources come together &mdash; a space that honors our culture while empowering our
          future. From first-generation college students seeking mentorship to entrepreneurs looking
          for community capital, Coraz&oacute;n is the bridge between aspiration and achievement.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-pearl/75 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)' }}
        >
          We believe technology should serve the people, not the other way around. Every feature we
          build is shaped by the lived experiences of our community &mdash; bilingual by design,
          culturally rooted, and radically inclusive. Whether you&apos;re in Los Angeles, San Juan,
          or Mexico City, Coraz&oacute;n is your home. We&apos;re not just building an app;
          we&apos;re nurturing a movement that celebrates the richness of Latino identity in all its
          beautiful complexity.
        </motion.p>
      </motion.div>
    </section>
  )
}
