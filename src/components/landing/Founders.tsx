import { motion } from 'framer-motion'

const founders = [
  {
    name: 'Nicolas',
    role: 'CEO & Co-Founder',
    bio: 'A first-generation Colombian-American, Nicolas brings a decade of experience in community organizing and product strategy. His vision for Corazon is rooted in the belief that technology can be a force for cultural preservation and empowerment.',
    gradient: 'from-emerald to-aquamarine',
    borderColor: '#0b4a31',
  },
  {
    name: 'Eddie',
    role: 'CTO & Co-Founder',
    bio: 'Eddie is a Mexican-American engineer with a passion for building accessible, inclusive technology. With experience at leading tech companies, he ensures Corazon is built on a foundation that scales while keeping the community at its core.',
    gradient: 'from-sapphire to-citrine',
    borderColor: '#334ab5',
  },
  {
    name: 'Diego',
    role: 'CDO & Co-Founder',
    bio: 'Diego is a Dominican-American designer who believes beautiful design is a form of respect. He crafts every pixel of Corazon with intention, ensuring the platform feels like home for every member of our diverse community.',
    gradient: 'from-coral to-amber',
    borderColor: '#f94e4f',
  },
]

export default function Founders() {
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
            className="inline-block text-jade text-sm tracking-[0.2em] uppercase mb-4"
          >
            Our Team
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
            Meet the <span className="text-sapphire">Founders</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, i) => (
            <motion.article
              key={founder.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 20,
                delay: i * 0.12,
              }}
              whileHover={{
                y: -8,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              className="group relative rounded-2xl p-8 text-center cursor-default"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Avatar placeholder */}
              <div
                className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${founder.gradient} mb-6 flex items-center justify-center text-3xl font-bold text-white/90 select-none font-display`}
                aria-hidden="true"
              >
                {founder.name[0]}
              </div>

              <h3
                className="font-display font-bold text-pearl mb-1"
                style={{ fontSize: 'clamp(1.2rem, 1.5vw, 1.4rem)' }}
              >
                {founder.name}
              </h3>

              <p className="text-sm tracking-wide mb-4" style={{ color: founder.borderColor }}>
                {founder.role}
              </p>

              <p className="text-pearl/60 text-sm leading-relaxed">{founder.bio}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
