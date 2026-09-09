import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'line'

const variants: Record<Variant, string> = {
  solid: 'border-fg bg-fg text-bg hover:opacity-85',
  line: 'border-line text-fg hover:border-fg hover:bg-fg hover:text-bg',
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  className?: string
  icon?: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  'aria-label'?: string
  /** Renders an anchor instead of a button. Same-origin files only; anything
   *  that leaves the site is an ExternalLink so the arrow tells you so. */
  href?: string
  /** Saves the file rather than opening it, and names it on the way down. */
  download?: string
}

/**
 * In-page actions, and same-origin downloads. Anything that navigates away to
 * another site is an ExternalLink with an arrow on it, so the two are never
 * confusable.
 *
 * The href form renders a real anchor rather than a button that calls
 * `window.location`: a link is what a middle click, a long press and a screen
 * reader all expect, and none of those work on a button.
 *
 * Rounded here, unlike the squared-off version this replaced. A pill is softer,
 * and softness is the point of this design.
 */
export function Button({
  children,
  onClick,
  variant = 'solid',
  className,
  icon,
  type = 'button',
  disabled,
  'aria-label': ariaLabel,
  href,
  download,
}: ButtonProps) {
  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      {...(href
        ? { href, ...(download ? { download } : {}) }
        : { type, onClick, disabled })}
      aria-label={ariaLabel}
      className={cn(
        'group/btn inline-flex items-center justify-center gap-2.5 rounded-full border',
        'px-7 py-3.5 text-[0.9375rem] tracking-wide transition-all duration-300',
        'shadow-[0_10px_30px_-18px_oklch(0.2_0.04_50_/_0.55)]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
    >
      {children}
      {icon && (
        <span className="transition-transform duration-300 ease-out-expo group-hover/btn:translate-y-0.5">
          {icon}
        </span>
      )}
    </Tag>
  )
}
