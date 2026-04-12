import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from './i18n'

const faqKeys = [
  { q: 'faq.1.q', a: 'faq.1.a' },
  { q: 'faq.2.q', a: 'faq.2.a' },
  { q: 'faq.3.q', a: 'faq.3.a' },
  { q: 'faq.4.q', a: 'faq.4.a' },
  { q: 'faq.5.q', a: 'faq.5.a' },
  { q: 'faq.6.q', a: 'faq.6.a' },
]

function FAQItem({
  question,
  answer,
  index,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
        delay: index * 0.08,
      }}
      className={`border-b border-white/[0.06] transition-colors duration-300 ${
        isOpen ? 'border-l-2 border-l-coral pl-5' : 'border-l-2 border-l-transparent pl-5'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span
          className={`font-body pr-4 transition-colors duration-200 ${
            isOpen ? 'text-pearl' : 'text-pearl/80 group-hover:text-pearl'
          }`}
          style={{ fontSize: 'clamp(1.05rem, 1.3vw, 1.2rem)' }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
            isOpen ? 'bg-coral/20 text-coral' : 'bg-white/5 text-pearl/50 group-hover:bg-white/10'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: 'spring', stiffness: 200, damping: 25 },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-pearl/60 leading-relaxed pr-12">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const { t } = useLang()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8"
      aria-label="Frequently asked questions"
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.06) 50%, transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[720px]">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-block text-amber text-sm tracking-[0.2em] uppercase mb-4"
        >
          {t('faq.overline')}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200, damping: 20 }}
          className="font-display font-bold text-pearl mb-12"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          {t('faq.heading.pre')} <span className="text-citrine">{t('faq.heading.accent')}</span>
        </motion.h2>

        <div>
          {faqKeys.map((entry, i) => (
            <FAQItem
              key={i}
              question={t(entry.q)}
              answer={t(entry.a)}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
