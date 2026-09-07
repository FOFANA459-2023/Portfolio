import { useEffect, useState } from 'react'

/**
 * Tracks which section owns the viewport, for the nav highlight.
 *
 * Uses a band across the middle of the screen rather than a single line, so a
 * section has to genuinely occupy the viewport before it takes the highlight.
 */
export function useActiveSection(ids: readonly string[], fallback = ids[0]) {
  const [active, setActive] = useState<string>(fallback)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible intersecting section rather than the last event.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
