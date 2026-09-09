import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { site } from '@/data/site'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useBandUnderNav } from '@/hooks/useBandUnderNav'
import { scrollToSection } from '@/lib/scroll'
import { cn } from '@/lib/cn'
import { MobileMenu } from './MobileMenu'

const SECTION_IDS = site.sections.map((s) => s.id)
const NAV_HEIGHT = 56

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // A ref, not state: this is read from an unmount cleanup, where a captured
  // state value would be a render behind.
  const pendingSection = useRef<string | null>(null)
  const active = useActiveSection(SECTION_IDS)
  const band = useBandUnderNav(NAV_HEIGHT)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 16))

  // Close the menu if the viewport grows past the breakpoint while it is open,
  // otherwise its scroll lock survives into a layout that never shows it.
  useEffect(() => {
    if (!menuOpen) return
    const mq = window.matchMedia('(min-width: 768px)')
    const close = () => setMenuOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [menuOpen])

  const go = (id: string) => {
    if (!menuOpen) {
      scrollToSection(id)
      return
    }
    // The menu holds a scroll lock — Lenis is stopped and <html> is
    // overflow:hidden — so scrolling from here would be swallowed. Record the
    // target and let the menu run it as it unmounts, which is the first moment
    // the lock is actually gone. AnimatePresence's onExitComplete is too early:
    // it fires while the exiting child, and so its lock, still exists.
    pendingSection.current = id
    setMenuOpen(false)
  }

  const runPendingScroll = useCallback(() => {
    const id = pendingSection.current
    pendingSection.current = null
    if (id) scrollToSection(id)
  }, [])

  return (
    <>
      {/* data-band on the header itself re-points the colour variables, so the
          whole bar inverts as it crosses from paper onto black and back. The
          long transition is what makes that read as a considered change rather
          than a flicker. */}
      <motion.header
        data-band={band}
        className={cn(
          'fixed inset-x-0 top-0 z-80 text-fg',
          'transition-[background-color,border-color,color] duration-700 ease-out-expo',
          scrolled ? 'border-b border-line-soft bg-bg/72 backdrop-blur-2xl' : 'border-b border-transparent',
        )}
        initial={{ y: -NAV_HEIGHT }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          aria-label="Primary"
          className="shell flex items-center justify-between gap-6"
          style={{ height: NAV_HEIGHT }}
        >
          <button
            type="button"
            onClick={() => go('top')}
            className="group flex shrink-0 items-center gap-2.5 font-serif text-[1.0625rem] tracking-tight transition-opacity hover:opacity-70"
          >
            {site.available && (
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            )}
            {site.name}
            <span className="sr-only">, back to top</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {site.sections.slice(1).map((section) => {
              const isActive = active === section.id
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => go(section.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative px-4 py-2 text-[0.875rem] tracking-wide transition-opacity duration-300',
                      isActive ? 'opacity-100' : 'opacity-55 hover:opacity-100',
                    )}
                  >
                    {section.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-4 bottom-1 block h-px bg-accent"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => go('contact')}
              className="hidden rounded-full border border-line px-5 py-2 text-[0.8125rem] tracking-wide transition-colors duration-300 hover:border-fg hover:bg-fg hover:text-bg md:block"
            >
              Get in touch
            </button>

            {/* Two rules that cross, rather than a hamburger with a middle bar
                that has to vanish — one fewer moving part. */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            >
              <span className="relative block h-2.5 w-5">
                <motion.span
                  className="absolute left-0 block h-px w-full bg-current"
                  animate={menuOpen ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.span
                  className="absolute left-0 block h-px w-full bg-current"
                  animate={menuOpen ? { top: 5, rotate: -45 } : { top: 10, rotate: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            active={active}
            onNavigate={go}
            onClose={() => setMenuOpen(false)}
            onClosed={runPendingScroll}
          />
        )}
      </AnimatePresence>
    </>
  )
}
