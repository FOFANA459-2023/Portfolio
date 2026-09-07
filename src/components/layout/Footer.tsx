import { site } from '@/data/site'
import { scrollToTop } from '@/lib/scroll'
import { socialIcons } from '@/components/ui/social-icons'

/**
 * Deliberately one row. Everything a footer usually repeats — the nav, the
 * email, a sitemap — is a few hundred pixels above it in the contact section,
 * and repeating it there would only make the page end twice.
 */
export function Footer() {
  return (
    <footer data-band="dark" className="border-t border-line-soft bg-bg text-fg">
      <div className="shell flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.875rem] text-fg-faint">
          © {new Date().getFullYear()} {site.name} — designed and built from scratch
        </p>

        <div className="flex items-center justify-between gap-8 sm:justify-end">
          <ul className="flex items-center gap-1">
            {site.socials.map((social) => {
              const Icon = socialIcons[social.icon]
              const isExternal = social.url.startsWith('http')
              return (
                <li key={social.label}>
                  <a
                    href={social.url}
                    {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    aria-label={isExternal ? `${social.label} (opens in a new tab)` : social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-fg-faint transition-colors hover:text-fg"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={scrollToTop}
            className="text-[0.875rem] text-fg-faint transition-colors hover:text-fg"
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
