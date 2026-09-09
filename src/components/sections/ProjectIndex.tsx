import type { Project } from '@/types'
import { Reveal } from '@/components/ui/Reveal'
import { ArrowDownIcon } from '@/components/ui/Icons'
import { scrollToSection } from '@/lib/scroll'
import { statusCopy } from '@/lib/status'
import { cn } from '@/lib/cn'

interface ProjectIndexProps {
  projects: Project[]
}

/**
 * All three projects on one screen, before any of them is presented.
 *
 * The section below this gives each project a full stretch of the page, which
 * is right for someone reading and wrong for someone deciding whether to. A
 * visitor who has thirty seconds should not have to scroll three times to find
 * out what the three things are — so this states them up front: what it is
 * called, what kind of thing it is, whether it is running, and the three
 * technologies most likely to be the ones being looked for.
 *
 * Each row is a jump rather than a link, because the destination is further
 * down this same page.
 */
export function ProjectIndex({ projects }: ProjectIndexProps) {
  return (
    <Reveal direction="none" delay={0.1}>
      <nav aria-label="Projects at a glance">
        <ul className="border-t border-line">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => scrollToSection(`project-${project.id}`)}
                className={cn(
                  'group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-4',
                  'border-b border-line py-5 text-left transition-[background-color,padding] duration-300',
                  'hover:bg-bg-2/80 sm:gap-x-6 sm:py-6',
                  'lg:grid-cols-[3.25rem_14rem_minmax(0,1fr)_auto]',
                )}
              >
                {/* The rule grows from nothing into an accent stroke on hover.
                    It is the only moving part in the row, so it is enough to
                    say which one the pointer is on without the row itself
                    having to change shape. */}
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-4 w-0.5 origin-center scale-y-0 bg-accent transition-transform duration-300 ease-out-expo group-hover:scale-y-100"
                  />
                  <span className="label text-fg">{project.number}</span>
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-serif text-xl leading-tight italic transition-transform duration-300 ease-out-expo group-hover:translate-x-1 sm:text-[1.65rem]">
                    {project.title}
                  </span>
                  {/* Below lg there is no third column, so the category rides
                      under the title rather than disappearing. */}
                  <span className="label mt-1.5 block lg:hidden">{project.category}</span>
                </span>

                <span className="hidden min-w-0 truncate text-[0.8125rem] text-fg-faint lg:block">
                  {project.category}
                  <span aria-hidden> · </span>
                  {project.stack.slice(0, 3).join(', ')}
                </span>

                <span className="flex items-center gap-3 sm:gap-5">
                  {/* The dot survives to the narrowest screen; only the word it
                      is standing next to drops. That a project is running is
                      the one fact here worth keeping at every width. */}
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        'block h-1.5 w-1.5 rounded-full',
                        project.status === 'live' ? 'bg-accent' : 'bg-fg-faint',
                      )}
                    />
                    <span className="label hidden sm:block">{statusCopy[project.status]}</span>
                    <span className="sr-only sm:hidden">{statusCopy[project.status]}</span>
                  </span>
                  <ArrowDownIcon className="h-4 w-4 shrink-0 text-fg-faint transition-transform duration-300 ease-out-expo group-hover:translate-y-1" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </Reveal>
  )
}
