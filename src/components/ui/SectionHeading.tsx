import type { ReactNode } from 'react'
import { AnimatedText } from './AnimatedText'
import { Reveal } from './Reveal'
import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  /** The small caps line above the title, e.g. "Selected work". */
  label: string
  /** One entry per visual line of the title. */
  title: ReactNode[]
  /** A short paragraph under the title. */
  lede?: ReactNode
  className?: string
}

/**
 * How every section opens: a small label, a serif title, and at most one
 * paragraph.
 *
 * An earlier version of this carried an index number, a rule, and a count in
 * the corner. All three have gone — they made every section start with four
 * things to read before the heading, which is the opposite of the quiet the
 * page is after.
 */
export function SectionHeading({ label, title, lede, className }: SectionHeadingProps) {
  return (
    <header className={cn('max-w-4xl', className)}>
      <Reveal direction="none">
        <p className="label kicker mb-6 sm:mb-8">{label}</p>
      </Reveal>

      <AnimatedText as="h2" lines={title} className="display-2 max-w-[18ch]" stagger={0.08} />

      {lede && (
        <Reveal delay={0.15}>
          <p className="prose-body mt-8 max-w-[54ch]">{lede}</p>
        </Reveal>
      )}
    </header>
  )
}
