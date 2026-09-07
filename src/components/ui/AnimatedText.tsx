import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

interface AnimatedTextProps {
  /** One entry per visual line. Nodes rather than strings so a line can carry
   *  an accent span, a number, or a link. */
  lines: ReactNode[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
  className?: string
  /** Set when something else needs to reference the heading, e.g. an
   *  aria-labelledby on a dialog. */
  id?: string
  /** Overrides the spoken text. Needed when a heading is split across lines
   *  that would otherwise run together in the accessibility tree — "Varlee"
   *  and "Fofana" as two block spans concatenate to "VarleeFofana". */
  ariaLabel?: string
  /** Applied to each line's moving span — line-height and tracking live here. */
  lineClassName?: string
  delay?: number
  stagger?: number
  /** 'mount' for the hero, which must not wait to be scrolled into view. */
  trigger?: 'mount' | 'inView'
}

/**
 * Heading entrance: each line rises out of its own clipping window.
 *
 * Line-level rather than character-level on purpose. Splitting a heading into
 * one span per character costs a node per glyph, breaks text selection and
 * copy-paste, and forces every assistive technology onto an aria-label instead
 * of the real text. A line mask gets the same effect with the markup intact —
 * the text stays selectable, searchable, and readable in the accessibility tree
 * exactly as authored.
 *
 * The clipping window is padded and pulled back by the same amount so that
 * descenders (g, y, p) are not shaved off by `overflow: hidden`.
 */
export function AnimatedText({
  lines,
  as = 'div',
  className,
  id,
  ariaLabel,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  trigger = 'inView',
}: AnimatedTextProps) {
  const Component = motion[as]

  const animateProps =
    trigger === 'mount'
      ? { animate: 'visible' as const }
      : { whileInView: 'visible' as const, viewport: { once: true, amount: 0.6 } }

  return (
    <Component
      className={className}
      id={id}
      aria-label={ariaLabel}
      initial="hidden"
      {...animateProps}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {lines.map((line, i) => (
        <span key={i} className="mask-line pb-[0.14em] -mb-[0.14em]">
          <motion.span
            className={cn('block', lineClassName)}
            variants={{
              hidden: { y: '108%' },
              visible: {
                y: '0%',
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
