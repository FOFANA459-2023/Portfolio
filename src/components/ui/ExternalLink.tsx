import type { ReactNode } from 'react'
import { ArrowUpRightIcon } from './Icons'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'line' | 'text'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  /** One per project at most: the primary destination. */
  solid: 'rounded-full border border-fg bg-fg text-bg hover:opacity-85',
  /** The default. A hairline pill that fills on hover. */
  line: 'rounded-full border border-line text-fg hover:border-fg hover:bg-fg hover:text-bg',
  /** Sits in running text or a list without becoming a control. */
  text: 'text-fg-soft hover:text-fg',
}

/* Size is kept out of the variant strings because `cn` is a plain joiner with
   no conflict resolution — two competing `px-*` in one class list would be
   settled by stylesheet order rather than by call site. */
const sizes: Record<Size, string> = {
  sm: 'text-[0.8125rem]',
  md: 'text-[0.9375rem]',
}

const padding: Record<Size, string> = {
  sm: 'px-4 py-2',
  md: 'px-5 py-2.5',
}

interface ExternalLinkProps {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  /** Overrides the accessible name where the visible label is not enough on its
   *  own — "Frontend" means little read out of context. */
  label?: string
}

/**
 * Every outbound link on the page: one arrow, one hover, one set of rel
 * attributes. The arrow nudges out on hover, and because the icon carries the
 * meaning, the "opens in a new tab" note is spoken rather than left to it.
 */
export function ExternalLink({
  href,
  children,
  variant = 'line',
  size = 'md',
  className,
  label,
}: ExternalLinkProps) {
  const isExternal = /^https?:/.test(href)

  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className={cn(
        'group/link inline-flex items-center gap-2 transition-colors duration-300',
        sizes[size],
        variant !== 'text' && padding[size],
        variants[variant],
        className,
      )}
    >
      {label ? <span aria-hidden>{children}</span> : children}
      {label && <span className="sr-only">{label}</span>}
      {isExternal && <span className="sr-only">(opens in a new tab)</span>}
      <ArrowUpRightIcon
        className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-expo group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      />
    </a>
  )
}
