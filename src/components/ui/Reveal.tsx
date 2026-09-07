import type { ReactNode } from 'react'
import { motion } from 'motion/react'

type Direction = 'up' | 'left' | 'right' | 'none'

const offset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 22 },
  left: { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  none: { x: 0, y: 0 },
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: Direction
  /** Fraction of the element that must be in view before it plays. */
  amount?: number
  as?: 'div' | 'span' | 'li' | 'p'
}

/**
 * The entrance used by everything that is not a heading.
 *
 * Deliberately small: a 22px rise and a fade. The previous version also
 * animated a blur, which forces a filter pass on every frame of every reveal on
 * the page — a real cost on a phone, for an effect nobody consciously sees.
 *
 * Plays once. Replaying on the way back up reads as jitter, not polish.
 * `reducedMotion="user"` on the root MotionConfig strips the transform, so
 * there is no branch needed here.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  amount = 0.3,
  as = 'div',
}: RevealProps) {
  const Component = motion[as]
  const { x, y } = offset[direction]

  return (
    <Component
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}
