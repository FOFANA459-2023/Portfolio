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
}

/**
 * In-page actions only. Anything that navigates away is an ExternalLink with an
 * arrow on it, so the two are never confusable.
 *
 * Rounded here, unlike the squared-off version this replaced — a pill is softer,
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
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'group/btn inline-flex items-center justify-center gap-2.5 rounded-full border',
        'px-6 py-3 text-[0.9375rem] transition-all duration-300',
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
    </button>
  )
}
