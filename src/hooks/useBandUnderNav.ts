import { useEffect, useState } from 'react'
import type { Band } from '@/components/ui/Section'

/**
 * Which band the fixed header is currently sitting over.
 *
 * The header floats above sections that alternate between paper and black, so
 * a single fixed colour would be invisible over one of them. This watches a
 * 1px line across the viewport at the header's own baseline and reports which
 * band is crossing it, and the header inverts to match.
 *
 * An IntersectionObserver rather than a scroll handler: the browser does the
 * intersection work off the main thread and only calls back when the answer
 * actually changes, so this costs nothing while scrolling through one long
 * section. The margins depend on the viewport height, so it is rebuilt on
 * resize.
 */
export function useBandUnderNav(offset = 56): Band {
  const [band, setBand] = useState<Band>('light')

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    const attach = () => {
      observer?.disconnect()

      // Collapse the observation root to a single line `offset` px down the
      // viewport. Whichever band crosses that line is the one behind the header.
      const bottom = Math.max(0, window.innerHeight - offset - 1)
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const next = (entry.target as HTMLElement).dataset.band
            if (next === 'light' || next === 'dark') setBand(next)
          }
        },
        { rootMargin: `-${offset}px 0px -${bottom}px 0px`, threshold: 0 },
      )

      document.querySelectorAll<HTMLElement>('[data-band]').forEach((el) => {
        observer?.observe(el)
      })
    }

    attach()
    window.addEventListener('resize', attach)
    return () => {
      window.removeEventListener('resize', attach)
      observer?.disconnect()
    }
  }, [offset])

  return band
}
