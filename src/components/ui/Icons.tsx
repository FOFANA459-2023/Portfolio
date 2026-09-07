/**
 * Inline SVG icons. A dozen glyphs is not worth an icon library and its
 * tree-shaking caveats — these ship as markup with no runtime.
 *
 * All of them are decorative: they sit beside a text label or inside a control
 * that carries its own accessible name, so every one is aria-hidden.
 */
type IconProps = {
  className?: string
}

const base = 'h-[1.0625rem] w-[1.0625rem]'
const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.6',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function GitHubIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

export function LinkedInIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

export function MailIcon({ className = base }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden>
      <rect x="2" y="4.5" width="20" height="15" rx="1.5" />
      <path d="m3 7.5 8.4 5.6a1 1 0 0 0 1.2 0L21 7.5" />
    </svg>
  )
}

/** The one arrow used for every outbound link on the page. */
export function ArrowUpRightIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.8" className={className} aria-hidden>
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  )
}

export function ArrowDownIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 5v13.5M6.5 13 12 18.5 17.5 13" />
    </svg>
  )
}

export function ArrowRightIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function CloseIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.7" className={className} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function CopyIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="1.5" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.9" className={className} aria-hidden>
      <path d="m4 12.5 5.5 5.5L20 7" />
    </svg>
  )
}

export function LockIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} className={className} aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  )
}

/** Sits in the preview frame's address bar. */
export function GlobeIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.4" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </svg>
  )
}

/** Toggles a case study open. Rotates 45deg to become a close control. */
export function PlusIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg {...stroke} strokeWidth="1.6" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
