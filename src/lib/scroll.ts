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
    // An absolute position, computed here, rather than handing Lenis the
    // element and letting it work one out.
    //
    // Lenis resolves an element target against its own internal scroll
    // position, and that position is stale after any scroll it did not drive
    // itself: a find-in-page match, the browser moving focus, a screen reader
    // jumping to a landmark, an automated click that scrolls its target into
    // view first. It then lands short by exactly the distance it missed, which
    // is how this was found — a jump that should have gone to 3137 stopped at
    // 2041, and the browser had natively scrolled 1096 first.
    //
    // Reading `scrollY` off the window each time sidesteps that entirely,
    // because a number is absolute and needs no frame of reference.
    const marginTop = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const top = target.getBoundingClientRect().top + window.scrollY - marginTop

    // `force` matters: a stopped Lenis silently discards scrollTo, and an
    // overlay that locked scrolling may not have released it yet. Navigation is
    // always an explicit intent, so it should win over any outstanding lock.
    instance.scrollTo(top, { duration: 1.2, force: true })
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
