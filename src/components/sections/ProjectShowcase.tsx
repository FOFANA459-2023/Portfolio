import type { Project } from '@/types'
import { Frame } from '@/components/ui/Frame'
import { Reveal } from '@/components/ui/Reveal'
import { TechStack } from '@/components/ui/TechStack'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { ProjectLinks } from './ProjectLinks'
import { statusCopy } from '@/lib/status'
import { cn } from '@/lib/cn'

interface ProjectShowcaseProps {
  project: Project
  /** Even projects put the text on the left, odd ones on the right. */
  index: number
  onOpen: (project: Project) => void
}

/**
 * One project: a column of facts that stays put, beside a column of screens
 * that scrolls past it.
 *
 * This replaced a single full-width stack — index, title, summary, one image,
 * stack, links — which was correctly typeset and completely uncomposed. It ran
 * the whole width for text that wants 50 characters, so the right-hand third of
 * every project was empty; it showed one screenshot when two had been captured;
 * and reading it was three screens of scrolling with nothing to look at but the
 * one image you had already passed.
 *
 * Sticky is the fix and it is also the point: the identity of the thing stays
 * on screen while its evidence goes by, which is how you read a case in print.
 * It is only switched on from `lg` up, where there is both the width for two
 * columns and the height for the sticky column to have somewhere to sit.
 *
 * The sides alternate down the page. One arrangement mirrored is not three
 * different layouts to hold in your head — it is the same layout, and the
 * alternation is what keeps three of them in a row from reading as a list.
 *
 * The column runs in the order a hiring reader needs it: what it is called,
 * what it is, what it proved, what it is built with, then where to go next.
 */
export function ProjectShowcase({ project, index, onOpen }: ProjectShowcaseProps) {
  const mirrored = index % 2 === 1
  const open = () => onOpen(project)

  const domain = project.liveUrl ? project.liveUrl.replace(/^https?:\/\//, '') : null

  return (
    // `scroll-mt` clears the fixed header, so a jump from the index lands on
    // the project's own rule rather than under the bar.
    <article
      id={`project-${project.id}`}
      aria-labelledby={`project-${project.id}-title`}
      className="scroll-mt-24"
    >
      {/* Index rule. This is what separates one project from the next; before
          it there was only whitespace, and three projects read as one stretch. */}
      <Reveal direction="none">
        <div className="flex items-center gap-4 border-t border-line pt-5">
          <span className="label text-fg">{project.number}</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                'block h-1.5 w-1.5 rounded-full',
                project.status === 'live' ? 'bg-accent' : 'bg-fg-faint',
              )}
            />
            <span className="label">{statusCopy[project.status]}</span>
          </span>
          <span aria-hidden className="h-3 w-px bg-line" />
          <span className="label whitespace-nowrap">{project.year}</span>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-12 sm:mt-12 lg:grid-cols-12 lg:gap-12">
        {/* Facts. First in the DOM either way, so the reading order is always
            "what is this" before "here is what it looks like", whichever side
            it is drawn on. */}
        <div
          className={cn(
            'min-w-0 lg:col-span-4 lg:row-start-1 lg:self-start',
            'lg:tall:sticky lg:tall:top-24',
            mirrored ? 'lg:col-start-9' : 'lg:col-start-1',
          )}
        >
          {/* One word per line. At this size a two-word name would wrap
              anyway, and choosing the break beats letting the column choose
              it — it also means a long name never has to fit on one line. */}
          <AnimatedText
            as="h3"
            id={`project-${project.id}-title`}
            ariaLabel={project.title}
            lines={project.title.split(' ')}
            className="display-project"
          />

          <Reveal delay={0.06}>
            <p className="label mt-4">{project.category}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="prose-body mt-7 text-base sm:text-[1.0625rem]">{project.summary}</p>
          </Reveal>

          {project.metrics.length > 0 && (
            <Reveal delay={0.14}>
              {/* flex-col-reverse: the number reads first, while the markup keeps
                  the term-then-definition order a description list expects. */}
              <dl className="mt-9 grid grid-cols-3 gap-x-4 gap-y-5 border-y border-line py-6">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="flex flex-col-reverse gap-1.5">
                    {/* Two lines' worth of height whether the label needs it or
                        not. In a column-reverse box the content packs to the
                        bottom, so a label that wraps pushes its own figure up —
                        and three figures at three different heights stop
                        reading as a row. */}
                    <dt className="min-h-[2.75em] text-[0.6875rem] leading-snug text-fg-faint">
                      {metric.label}
                    </dt>
                    <dd className="font-serif text-2xl leading-none sm:text-[1.75rem]">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {/* Every name, not the first six. A stack behind a "+6 more" is a
              stack that the person scanning for Django never finds. */}
          <Reveal delay={0.18}>
            <div className="mt-8">
              <p className="label mb-3">Tech stack</p>
              <TechStack items={project.stack} />
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="mt-8">
              <ProjectLinks project={project} size="sm" />
            </div>

            {/* A row rather than a text link. This is the deepest thing a
                visitor can do here, and it used to be the quietest control on
                the whole section. */}
            <button
              type="button"
              onClick={open}
              className="group/case mt-4 flex w-full items-center justify-between gap-4 rounded-md border border-line px-5 py-4 text-left transition-colors duration-300 hover:border-fg hover:bg-bg-2"
            >
              <span className="min-w-0">
                <span className="block text-[0.9375rem] text-fg">Read the case study</span>
                <span className="mt-0.5 block text-[0.8125rem] text-fg-faint">
                  The problem, the build, and the hard parts
                </span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-fg-soft transition-transform duration-300 ease-out-expo group-hover/case:translate-x-1" />
            </button>

            {project.access && (
              <p className="mt-6 text-[0.8125rem] leading-relaxed text-fg-faint">
                {project.access}
              </p>
            )}
          </Reveal>
        </div>

        {/* Screens. Every capture the project has, not just the first one. */}
        <div
          className={cn(
            'flex min-w-0 flex-col gap-6 sm:gap-8 lg:col-span-7 lg:row-start-1',
            mirrored ? 'lg:col-start-1' : 'lg:col-start-6',
          )}
        >
          {project.shots.length > 0 ? (
            project.shots.map((shot, i) => (
              <Reveal key={shot.src} delay={i * 0.06} amount={0.15}>
                <button
                  type="button"
                  onClick={open}
                  aria-label={`${project.title} — open the case study`}
                  className="group block w-full text-left"
                >
                  <Frame
                    shot={shot}
                    caption={i === 0 ? domain : shot.caption}
                    className={cn(
                      'transition-[transform,box-shadow] duration-700 ease-out-expo',
                      'group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/25',
                      'group-focus-visible:-translate-y-1.5',
                    )}
                  />
                </button>
              </Reveal>
            ))
          ) : (
            <Reveal>
              <button
                type="button"
                onClick={open}
                aria-label={`${project.title} — open the case study`}
                className="group block w-full text-left"
              >
                <Frame caption={domain}>
                  <NoCapture project={project} />
                </Frame>
              </button>
            </Reveal>
          )}
        </div>
      </div>
    </article>
  )
}

/**
 * What the frame shows for a project with no screenshot. Deliberately not a
 * drawing of a product — inventing an interface to fill a frame would
 * misrepresent the thing the frame claims to be showing.
 */
function NoCapture({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="display-3">{project.title}</p>
      <p className="label">{project.category}</p>
    </div>
  )
}
