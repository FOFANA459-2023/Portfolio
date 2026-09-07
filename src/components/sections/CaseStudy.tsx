import { useEffect, useRef } from 'react'
import { motion, useScroll } from 'motion/react'
import type { Project } from '@/types'
import { useScrollLock } from '@/hooks/useScrollLock'
import { TechStack } from '@/components/ui/TechStack'
import { CloseIcon } from '@/components/ui/Icons'
import { Frame } from '@/components/ui/Frame'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { ProjectLinks } from './ProjectLinks'
import { site } from '@/data/site'
import { statusCopy } from '@/lib/status'
import { cn } from '@/lib/cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

interface CaseStudyProps {
  project: Project
  onClose: () => void
}

/**
 * The long form of a project: everything the showcase leaves out.
 *
 * A panel rather than a centred modal. A case study is a document — it has
 * sections, a reading order and a scrollbar — and a document reads better
 * pinned to an edge, with the page it came from still visible beside it, than
 * floating in the middle of a dimmed screen.
 *
 * It sets its own band to paper. The projects section it opens from is
 * charcoal, and a long read is easier on the lighter ground — which is also
 * the clearest possible signal that you have moved into a different mode.
 *
 * The order is set by who opens it. Someone assessing this as work samples
 * decides in the first screen whether to keep reading, so the first screen is
 * the product itself, the numbers, and the stack — and the prose about problem
 * and solution comes after the evidence rather than in front of it. The
 * sticky header keeps the title, the status and the live link on screen the
 * whole way down, so leaving to go and use the thing never costs a scroll back
 * to the top.
 *
 * Full dialog behaviour: scroll locked behind it, focus moved in and trapped,
 * Escape to close, focus returned to whatever opened it on the way out.
 */
export function CaseStudy({ project, onClose }: CaseStudyProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  useScrollLock(true)

  // The panel is the scroll container, not the window — so the reading
  // indicator has to be told to measure that element rather than the document.
  const { scrollYProgress } = useScroll({ container: panelRef })

  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      // The page behind is still rendered and still focusable, so without this
      // the keyboard walks straight out of the open dialog.
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
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
    return () => {
      document.removeEventListener('keydown', onKey)
      restoreFocusTo.current?.focus?.()
    }
  }, [onClose])

  const titleId = `case-${project.id}-title`
  const hero = project.shots[0]
  const rest = project.shots.slice(1)

  return (
    <div className="fixed inset-0 z-95">
      <motion.div
        className="absolute inset-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-band="light"
        /* Lenis keeps its wheel and touch listeners attached while it is
           stopped, and they call preventDefault before the panel's own
           scrolling ever happens — which is why this used to feel stuck. The
           attribute makes Lenis walk the event path, find this element, and
           leave the gesture to the browser. */
        data-lenis-prevent
        className="absolute inset-y-0 right-0 w-full overflow-y-auto overscroll-contain bg-bg text-fg outline-none sm:max-w-2xl lg:max-w-4xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 34, mass: 0.9 }}
      >
        {/* Sticky, so the project being read is never in question after three
            screens of scrolling — and so the one link that matters is always
            one click away. */}
        <header className="sticky top-0 z-10 border-b border-line-soft bg-bg/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-6 py-4 sm:gap-5 sm:px-10">
            <span
              aria-hidden
              className={cn(
                'block h-1.5 w-1.5 shrink-0 rounded-full',
                project.status === 'live' ? 'bg-accent' : 'bg-fg-faint',
              )}
            />

            <h2 id={titleId} className="display-3 min-w-0 truncate">
              {project.title}
            </h2>

            <span className="ml-auto flex shrink-0 items-center gap-2">
              {project.liveUrl && (
                <ExternalLink
                  href={project.liveUrl}
                  variant="solid"
                  size="sm"
                  label={`${project.liveLabel ?? 'Live demo'} — ${project.title}`}
                >
                  {project.liveLabel ?? 'Live demo'}
                </ExternalLink>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-soft transition-colors hover:text-fg"
              >
                <CloseIcon />
              </button>
            </span>
          </div>

          {/* How much of the document is left, drawn on the header's own edge
              so it costs no height. Purely an indicator — it is not motion in
              the sense prefers-reduced-motion is about, since it only ever
              tracks a position the reader is setting themselves. */}
          <motion.div
            aria-hidden
            style={{ scaleX: scrollYProgress }}
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
          />
        </header>

        {/* The product, full bleed and first. On the paper band a light capture
            no longer needs the mount the black band required, so it can run
            edge to edge and act as the panel's own opening image. */}
        {hero && (
          <img
            src={hero.src}
            alt={hero.alt}
            width={1600}
            height={1000}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="aspect-[16/9] w-full border-b border-line-soft object-cover object-top"
          />
        )}

        <div className="px-6 pb-20 pt-10 sm:px-10 sm:pt-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label text-fg">{project.number}</span>
            <span aria-hidden className="h-px w-6 bg-line" />
            <span className="label">{project.category}</span>
            <span aria-hidden className="h-3 w-px bg-line" />
            <span className="label">{statusCopy[project.status]}</span>
            <span aria-hidden className="h-3 w-px bg-line" />
            <span className="label">{project.year}</span>
          </div>

          <p className="display-3 mt-6 max-w-[30ch]">{project.summary}</p>

          {/* The numbers, given the size they deserve. These were only on the
              showcase before, which meant the document that argues for them
              never actually stated them. */}
          {project.metrics.length > 0 && (
            <dl className="mt-10 grid grid-cols-3 gap-x-6 gap-y-4 border-y border-line py-7">
              {project.metrics.map((metric) => (
                // `self-start` is what keeps the three figures on one line. A
                // grid item stretches to the row by default, and in a
                // column-reverse box the content then packs to the bottom — so
                // a label that wraps to three lines pushes its own figure up
                // and out of the row the other two are sitting on.
                <div key={metric.label} className="flex flex-col-reverse gap-2 self-start">
                  <dt className="text-[0.75rem] leading-snug text-fg-faint">{metric.label}</dt>
                  <dd className="font-serif text-[1.75rem] leading-none sm:text-[2.25rem]">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {/* High, and complete. The stack is the single most scanned thing on
              a page like this; burying it under two thousand words of prose
              asks the reader to earn the answer they came for. */}
          <section className="mt-10">
            <h3 className="label mb-4">Tech stack</h3>
            <TechStack items={project.stack} size="md" />
          </section>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line-soft pt-8 sm:grid-cols-3">
            <Fact term="Role" value={project.role} />
            <Fact term="Timeline" value={project.year} />
            <Fact term="Status" value={statusCopy[project.status]} />
          </dl>

          <Block title="Problem">
            <p className="prose-body max-w-[62ch]">{project.problem}</p>
          </Block>

          <Block title="Solution">
            <p className="prose-body max-w-[62ch]">{project.solution}</p>
          </Block>

          <Block title="What it does">
            <ul>
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3.5 border-b border-line-soft py-4 text-[0.9375rem] leading-relaxed text-fg-soft first:border-t"
                >
                  <span
                    aria-hidden
                    className="mt-[0.55em] block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span className="max-w-[62ch]">{feature}</span>
                </li>
              ))}
            </ul>
          </Block>

          {rest[0] && (
            <Frame className="mt-14" shot={rest[0]} caption={rest[0].caption} />
          )}

          {/* Numbered, because these are the arguments the whole document is
              really making and a reader should be able to point at one. */}
          <Block title="How it is built">
            <ol className="space-y-7">
              {project.engineering.map((note, i) => (
                <li key={note} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-1">
                  <span aria-hidden className="font-serif text-xl leading-[1.55] text-fg-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-[64ch] text-[0.9375rem] leading-relaxed text-fg-soft">
                    {note}
                  </p>
                </li>
              ))}
            </ol>
          </Block>

          {rest.slice(1).map((shot) => (
            <Frame key={shot.src} className="mt-14" shot={shot} caption={shot.caption} />
          ))}

          {/* The end of a case study is the moment someone has decided what
              they think. It should not be a dead stop — it should be the two
              things they might want next. */}
          <div className="mt-16 rounded-lg bg-bg-2 p-6 sm:p-8">
            <p className="label">Where to next</p>
            <p className="display-3 mt-3 max-w-[24ch]">Go and use it, or read the source.</p>

            <ProjectLinks project={project} className="mt-7" />

            {project.access && (
              <p className="mt-5 max-w-[60ch] text-[0.875rem] leading-relaxed text-fg-faint">
                {project.access}
              </p>
            )}

            <p className="mt-7 border-t border-line pt-6 text-[0.9375rem] leading-relaxed text-fg-soft">
              {site.availabilityLabel}.{' '}
              <a href={`mailto:${site.email}`} className="link-underline text-fg">
                {site.email}
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="label mb-1.5">{term}</dt>
      <dd className="text-[0.875rem] leading-snug text-fg-soft">{value}</dd>
    </div>
  )
}

/**
 * A section of the document. The heading sits in its own rail on wide screens
 * rather than stacked above the text — it keeps the prose at a reading measure
 * without leaving the left edge ragged, and it means the structure of the
 * document is visible in one glance down the margin.
 */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-8">
      <h3 className="label mb-4 lg:mb-0 lg:pt-1.5">{title}</h3>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
