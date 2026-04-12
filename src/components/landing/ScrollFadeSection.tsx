import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollFadeSectionProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps a section so that it smoothly fades (and translates) in as it
 * enters the viewport and fades back out as it leaves — driven by scroll
 * position, not just whileInView. Gives the landing page a continuous,
 * Squarespace-style cinematic feel.
 */
export default function ScrollFadeSection({ children, className = '' }: ScrollFadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [50, 0, 0, -50])

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  )
}
