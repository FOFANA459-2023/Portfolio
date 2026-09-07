import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Band = 'light' | 'dark'

interface SectionProps {
  id: string
  /** Which ground this section sits on. Drives every colour inside it. */
  band: Band
  children: ReactNode
  className?: string
  /** Trims the vertical rhythm for a section that is mostly one large object. */
  tight?: boolean
  /** Fades in from the ground of the section above. Off for the first section
   *  on a ground, where there is nothing above to fade from. */
  seam?: boolean
}

/**
 * A band of the page.
 *
 * `data-band` is doing real work: it re-points the `--band-*` variables that
 * every colour utility resolves against, so everything inside — text, rules,
 * form fields, buttons — flips ground without a single conditional class. It is
 * also what the header watches to know which ground it is currently over.
 *
 * `scroll-mt` clears the fixed header so a section landed on from the nav is
 * not tucked underneath it.
 *
 * `band-seam` softens the join: the section paints the previous ground at its
 * top edge and crossfades to its own over 6rem, so the two grounds meet across
 * a stretch of scrolling instead of at a line. The header's own colour change
 * is a 700ms crossfade on the same boundary, so the two resolve together.
 */
export function Section({
  id,
  band,
  children,
  className,
  tight = false,
  seam = true,
}: SectionProps) {
  return (
    <section
      id={id}
      data-band={band}
      className={cn(
        'scroll-mt-14 bg-bg text-fg',
        seam && 'band-seam',
        tight ? 'py-20 sm:py-24' : 'py-24 sm:py-32 lg:py-40',
        className,
      )}
    >
      <div className="shell">{children}</div>
    </section>
  )
}
