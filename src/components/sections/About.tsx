import { site } from '@/data/site'
import { skillGroups } from '@/data/skills'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { TechStack } from '@/components/ui/TechStack'
import { cn } from '@/lib/cn'

/**
 * The third band: back to paper.
 *
 * About and the stack are one section rather than two. Split apart they were a
 * paragraph of biography followed immediately by a grid of technology names,
 * which is the same information with a page break in the middle of it.
 *
 * The narrative is engineering and nothing else. It used to open on the route
 * in — data work, an earlier school — which is the true story of how he got
 * here and an answer to a question no one reading this is asking. What they
 * are asking is what he can build, so that is the first sentence.
 */
export function About() {
  return (
    <Section id="about" band="light">
      <SectionHeading
        label="About"
        title={['Every layer', 'of every product.']}
        className="mb-16 sm:mb-20"
      />

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-6">
          {site.bio.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.08}>
              {/* The opening paragraph is set a size larger. It carries the
                  claim the other two are evidence for, and a reader who stops
                  after one paragraph should have stopped after that one. */}
              <p
                className={cn(
                  'prose-body max-w-[58ch]',
                  i === 0 && 'text-[1.1875rem] text-fg sm:text-[1.3125rem]',
                )}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="min-w-0 lg:col-span-5 lg:col-start-8">
          {/* Facts, as a description list — because that is what they are. */}
          <Reveal>
            <dl>
              {site.meta.map((entry) => (
                <div key={entry.term} className="border-t border-line-soft py-5 first:border-t-0 first:pt-0">
                  <dt className="label mb-1.5">{entry.term}</dt>
                  <dd className="flex items-center gap-2.5 text-[0.9375rem] text-fg-soft">
                    {entry.highlight && (
                      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                      </span>
                    )}
                    <span className={cn(entry.highlight && 'text-fg')}>{entry.value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* The stack runs the full width underneath, rather than stacking up
          inside the right-hand column. Three groups in a narrow column wrap
          every second entry onto its own line; across the page they each get
          one or two clean lines, and the space the biography leaves empty on
          the left gets used. */}
      <Reveal delay={0.1}>
        <div className="mt-20 rounded-2xl border border-line-soft bg-bg-2/60 p-6 pt-8 sm:mt-24 sm:p-10">
          <p className="label kicker mb-8">Tech stack</p>
          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.name} className="min-w-0">
                <p className="mb-2 text-[0.9375rem] text-fg">{group.name}</p>
                <p className="mb-3 text-[0.8125rem] leading-relaxed text-fg-faint">
                  {group.note}
                </p>
                <TechStack items={group.items} />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
