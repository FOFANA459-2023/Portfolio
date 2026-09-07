import type Lenis from 'lenis'
import { prefersReducedMotion } from './motion-preference'

/**
 * Module-level handle on the active Lenis instance.
 *
 * Anything that needs to pause or drive scrolling (the project overlay, the
 * mobile menu, the nav links) goes through here rather than reaching for a
 * context — there is exactly one scroller for the whole page.
 */
let instance: Lenis | null = null

export function setLenis(next: Lenis | null) {
  instance = next
}

export function getLenis(): Lenis | null {
  return instance
}

export function pauseScroll() {
  instance?.stop()
}

export function resumeScroll() {
  instance?.start()
}

/** Scroll to a section by id, falling back to native behaviour without Lenis. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return

  if (instance) {
    // `force` matters: a stopped Lenis silently discards scrollTo, and an
    // overlay that locked scrolling may not have released it yet. Navigation is
    // always an explicit intent, so it should win over any outstanding lock.
    instance.scrollTo(target, { offset: 0, duration: 1.2, force: true })
    return
  }
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}

export function scrollToTop() {
  if (instance) {
    instance.scrollTo(0, { duration: 1.2, force: true })
    return
  }
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
