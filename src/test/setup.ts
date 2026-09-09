import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * Runs before every test file.
 *
 * `cleanup` unmounts anything left over between tests, so a component from one
 * test cannot be found by a query in the next and pass for the wrong reason.
 *
 * `matchMedia` and `IntersectionObserver` have no jsdom implementation, and
 * both are reached during render: the first by the reduced-motion check, the
 * second by every `whileInView` animation. Stubbing them is what lets a
 * component be rendered at all rather than throwing on mount.
 */
afterEach(cleanup)

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

if (!window.IntersectionObserver) {
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    readonly scrollMargin = ''
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  window.IntersectionObserver = StubIntersectionObserver as unknown as typeof IntersectionObserver
}
