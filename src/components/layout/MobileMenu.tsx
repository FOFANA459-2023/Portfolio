import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { site } from '@/data/site'
import { useScrollLock } from '@/hooks/useScrollLock'
import { socialIcons } from '@/components/ui/social-icons'
import { cn } from '@/lib/cn'

interface MobileMenuProps {
  active: string
  onNavigate: (id: string) => void
  onClose: () => void
  /** Runs once this has unmounted and released its scroll lock. */
  onClosed: () => void
}

const FOCUSABLE = 'a[href], button:not([disabled])'

export function MobileMenu({ active, onNavigate, onClose, onClosed }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useScrollLock(true)

  // Declared after useScrollLock on purpose: React runs cleanups in declaration
  // order, so the lock is already released by the time this fires.
  useEffect(() => onClosed, [onClosed])

  useEffect(() => {
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      // The page behind is still rendered and still focusable, so without this
      // the keyboard walks straight out of the open dialog.
      const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-band="light"
      className="fixed inset-0 z-75 bg-bg text-fg md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="shell flex h-full flex-col justify-between pb-12 pt-24">
        <ul>
          {site.sections.map((section, i) => (
            <motion.li
              key={section.id}
              className="border-b border-line-soft"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={() => onNavigate(section.id)}
                aria-current={active === section.id ? 'true' : undefined}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className={cn('display-3', active !== section.id && 'text-fg-soft')}>
                  {section.label}
                </span>
                {active === section.id && (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </button>
            </motion.li>
          ))}
        </ul>

        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.4 }}
        >
          <a href={`mailto:${site.email}`} className="link-underline w-fit text-fg-soft">
            {site.email}
          </a>
          <ul className="flex gap-2">
            {site.socials.map((social) => {
              const Icon = socialIcons[social.icon]
              const isExternal = social.url.startsWith('http')
              return (
                <li key={social.label}>
                  <a
                    href={social.url}
                    {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    aria-label={isExternal ? `${social.label} (opens in a new tab)` : social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-fg-soft transition-colors hover:border-fg hover:text-fg"
                  >
                    <Icon />
                  </a>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
