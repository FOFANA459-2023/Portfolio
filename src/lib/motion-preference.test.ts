import { describe, it, expect, vi, afterEach } from 'vitest'
import { prefersReducedMotion, onMotionPreferenceChange, hasFinePointer } from './motion-preference'

/** A controllable stand-in for the one browser API these three functions use. */
function stubMatchMedia(matches: Record<string, boolean>) {
  const listeners = new Map<string, (e: MediaQueryListEvent) => void>()
  const removed: string[] = []

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matches[query] ?? false,
      media: query,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) =>
        listeners.set(query, cb),
      removeEventListener: () => removed.push(query),
    })),
  )

  return { listeners, removed }
}

afterEach(() => vi.unstubAllGlobals())

describe('prefersReducedMotion', () => {
  it('is true when the OS asks for reduced motion', () => {
    stubMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    expect(prefersReducedMotion()).toBe(true)
  })

  it('is false when it does not', () => {
    stubMatchMedia({ '(prefers-reduced-motion: reduce)': false })
    expect(prefersReducedMotion()).toBe(false)
  })

  it('fails to false where matchMedia does not exist, rather than throwing', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('onMotionPreferenceChange', () => {
  it('reports a change of preference to the caller', () => {
    const { listeners } = stubMatchMedia({})
    const seen: boolean[] = []
    onMotionPreferenceChange((reduced) => seen.push(reduced))

    listeners.get('(prefers-reduced-motion: reduce)')?.({ matches: true } as MediaQueryListEvent)
    expect(seen).toEqual([true])
  })

  it('returns an unsubscribe that actually detaches the listener', () => {
    const { removed } = stubMatchMedia({})
    const off = onMotionPreferenceChange(() => {})
    off()
    expect(removed).toEqual(['(prefers-reduced-motion: reduce)'])
  })

  it('returns a usable no-op where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(() => onMotionPreferenceChange(() => {})()).not.toThrow()
  })
})

describe('hasFinePointer', () => {
  it('is true only for a precise pointer', () => {
    stubMatchMedia({ '(pointer: fine)': true })
    expect(hasFinePointer()).toBe(true)

    stubMatchMedia({ '(pointer: fine)': false })
    expect(hasFinePointer()).toBe(false)
  })

  it('fails to false where matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(hasFinePointer()).toBe(false)
  })
})
