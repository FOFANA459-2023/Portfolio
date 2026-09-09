import { useEffect, useState } from 'react'
import { site } from '@/data/site'
import { Section } from '@/components/ui/Section'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { Reveal } from '@/components/ui/Reveal'
import { ContactForm } from './ContactForm'
import { CopyIcon, CheckIcon, ArrowUpRightIcon, DownloadIcon } from '@/components/ui/Icons'
import { socialIcons } from '@/components/ui/social-icons'

/**
 * The last band: black again, so the page closes on the same ground the work
 * was shown on.
 */
export function Contact() {
  return (
    <Section id="contact" band="dark">
      <div className="max-w-4xl">
        <Reveal direction="none">
          <p className="label kicker mb-6 sm:mb-8">Contact</p>
        </Reveal>
        <AnimatedText
          as="h2"
          lines={['Let’s build something', 'that gets used.']}
          className="display-2 max-w-[16ch]"
          stagger={0.08}
        />
        <Reveal delay={0.15}>
          <p className="prose-body mt-8 max-w-[52ch]">
            I am looking for a full-stack or frontend software engineering role, and I
            am open to freelance work. If you have a role, a project, or a question
            about anything above, this reaches me directly.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-14 sm:mt-20 lg:grid-cols-12 lg:gap-8">
        {/* Direct routes first. Someone who would rather email than fill in a
            form should not have to scroll past one to find the address. */}
        <div className="min-w-0 lg:col-span-4">
          <Reveal>
            <p className="label">Email</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${site.email}`}
                className="link-underline font-serif text-xl italic text-fg sm:text-2xl"
              >
                {site.email}
              </a>
              <CopyEmailButton email={site.email} />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10">
              <p className="label">Elsewhere</p>
              <ul className="mt-2">
                {site.socials
                  .filter((s) => s.icon !== 'mail')
                  .map((social) => {
                    const Icon = socialIcons[social.icon]
                    return (
                      <li key={social.label}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="group flex items-center gap-3 border-b border-line-soft py-3.5 text-[0.9375rem] text-fg-soft transition-colors hover:text-fg"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {social.label}
                          <span className="sr-only">(opens in a new tab)</span>
                          <ArrowUpRightIcon className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </li>
                    )
                  })}

                {/* The resume sits with the other places to find him rather
                    than in its own block: a recruiter scanning this column is
                    looking for exactly one of these four things, and a list is
                    faster to scan than four headings. */}
                <li>
                  <a
                    href={site.resumeUrl}
                    download={site.resumeFileName}
                    className="group flex items-center gap-3 border-b border-line-soft py-3.5 text-[0.9375rem] text-fg-soft transition-colors hover:text-fg"
                  >
                    <DownloadIcon className="h-4 w-4 shrink-0" />
                    Resume
                    <span className="label ml-auto">PDF</span>
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-10">
              <p className="label">Availability</p>
              <p className="mt-3 flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-fg-soft">
                {site.available && (
                  <span className="relative mt-2 flex h-1.5 w-1.5 shrink-0" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                )}
                {site.availabilityLabel}. Comfortable working remotely and across time
                zones.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal direction="none" delay={0.1} className="min-w-0 lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  )
}

/** Copy-to-clipboard, for anyone without a mail client wired up to mailto:. */
function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // Clipboard access can be blocked outright; the mailto link beside this
      // still works, so there is nothing useful to report here.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem] text-fg-faint transition-colors hover:border-fg hover:bg-fg hover:text-bg"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
