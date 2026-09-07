import { useEffect } from 'react'
import Lenis from 'lenis'
import { prefersReducedMotion, onMotionPreferenceChange } from '@/lib/motion-preference'
import { setLenis } from '@/lib/scroll'

/**
 * Smooth scroll. Lenis drives the real window scroll position, so Motion's
 * `useScroll` and IntersectionObserver both keep working untouched.
 *
 * Never initialised when the user has asked for reduced motion, and torn down
 * live if they change that preference mid-session.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    let lenis: Lenis | null = null
    let frame = 0

    const start = () => {
      if (lenis || prefersReducedMotion()) return

      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.6,
        wheelMultiplier: 1,
      })
      setLenis(lenis)

      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lenis?.destroy()
      lenis = null
      setLenis(null)
    }

    start()
    const off = onMotionPreferenceChange((reduced) => (reduced ? stop() : start()))

    return () => {
      off()
      stop()
    }
  }, [enabled])
}
